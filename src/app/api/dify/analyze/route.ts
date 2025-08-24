import { NextRequest, NextResponse } from 'next/server';
import { aiServiceManager } from '@/lib/ai-service-manager';
import { defaultAIConfig } from '@/config/ai-config';

// 定义 Dify API 响应的类型
interface BloodGlucoseResult {
  type: 'test';
  content: {
    blood_glucose_level: string;
    unit: string;
    interpretation: string;
    recommendation: string;
  };
}

interface FoodResult {
  type: 'food';
  content: Array<{
    name: string;
    recommendation: '绿灯' | '黄灯' | '红灯';
    explanation: string;
  }>;
}

interface OtherResult {
  type: 'noallow';
  content: {
    message: string;
  };
}

type AnalysisResult = BloodGlucoseResult | FoodResult | OtherResult;

// 将文件转换为 base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

// 上传文件到 Dify 并获取 upload_file_id
async function uploadFileToDify(file: File): Promise<string> {
  const config = defaultAIConfig.dify;
  
  if (!config.apiKey) {
    throw new Error('DIFY_API_KEY 未配置');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', 'diabetes-app-user');

  const response = await fetch(`${config.baseUrl}/v1/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`文件上传失败: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  return result.id; // 返回上传文件的 ID
}

// 调用 Dify 工作流 API
async function callDifyWorkflow(uploadFileId: string, lang?: string): Promise<AnalysisResult> {
  const config = defaultAIConfig.dify;
  
  if (!config.apiKey) {
    throw new Error('DIFY_API_KEY 未配置');
  }

  // 检测API类型：根据API Key格式判断
  // app-xxx格式的API Key用于调用工作流API，其他格式用于应用API
  const isWorkflowAPI = config.apiKey.startsWith('app-');
  
  console.log('🔍 [API DEBUG] API类型检测:', isWorkflowAPI ? '工作流API' : '应用API');
  console.log('🔍 [API DEBUG] API Key格式:', config.apiKey.substring(0, 10) + '...');
  
  // 注意：根据Dify官方文档，工作流API通过API Key来识别具体的工作流
  // 每个工作流都有唯一的API Key，不需要额外传递工作流ID

  // 根据语言设置langValue
  const langValue = lang === 'en' ? 'EnglishEnglishEnglish' : '中文中文中文';
  console.log('🔍 [API DEBUG] 最终传递给Dify的langValue:', langValue);
  console.log('🔍 [API DEBUG] 使用的API Key:', config.apiKey);

  // 根据API类型选择不同的端点和请求体格式
  let endpoint: string;
  let requestBody: any;
  
  if (isWorkflowAPI) {
    // 工作流API - 根据官方文档，端点应该是 /v1/workflows/run
    endpoint = `${config.baseUrl}/v1/workflows/run`;
    requestBody = {
      inputs: {
        img: {
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: uploadFileId
        },  // 使用文件对象格式
        lang: langValue
      },
      response_mode: 'blocking',
      user: 'user-' + Date.now()
    };
  } else {
    // 应用API - 使用completion-messages端点
    endpoint = `${config.baseUrl}/completion-messages`;
    requestBody = {
      inputs: {
        img: {
          type: 'image',
          transfer_method: 'local_file',
          upload_file_id: uploadFileId
        },  // 使用文件对象格式
        lang: langValue
      },
      response_mode: 'blocking',
      user: 'user-' + Date.now()
    };
  }
  
  console.log('🔍 [API DEBUG] 最终端点:', endpoint);
  console.log('🔍 [API DEBUG] 请求体:', JSON.stringify(requestBody, null, 2));

  // 调用 Dify API
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });



  if (!response.ok) {
    const errorText = await response.text();
    console.error('🚨 [API ERROR] Dify API调用失败:');
    console.error('🚨 [API ERROR] URL:', endpoint);
    console.error('🚨 [API ERROR] Status:', response.status, response.statusText);
    console.error('🚨 [API ERROR] Response:', errorText);
    throw new Error(`Dify API 调用失败: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  
  // 添加调试信息来查看完整的返回结构
  console.log('🔍 [API DEBUG] Dify完整返回结果:', JSON.stringify(result, null, 2));
  
  // 从 Dify 响应中提取分析结果
  if (result.data && result.data.outputs) {
    const outputs = result.data.outputs;
    console.log('🔍 [API DEBUG] outputs结构:', JSON.stringify(outputs, null, 2));
    
    // 检查新的数据结构：直接从outputs中获取type和对应的数据
    if (outputs.type) {
      const resultType = outputs.type;
      console.log('🔍 [API DEBUG] 识别到的type:', resultType);
      
      try {
        // 根据type类型获取对应的数据
        let contentData;
        
        if (resultType === 'food' && outputs.food) {
          // food字段包含JSON字符串，需要解析
          contentData = JSON.parse(outputs.food);
          console.log('🔍 [API DEBUG] 解析后的food数据:', contentData);
          
          return {
            type: 'food',
            content: contentData.content || contentData
          };
        } else if (resultType === 'test' && outputs.test) {
          // test字段包含JSON字符串，需要解析
          contentData = JSON.parse(outputs.test);
          console.log('🔍 [API DEBUG] 解析后的test数据:', contentData);
          
          return {
            type: 'test',
            content: contentData.content || contentData
          };
        } else if (resultType === 'other' && outputs.other) {
          // other字段包含JSON字符串，需要解析
          contentData = JSON.parse(outputs.other);
          console.log('🔍 [API DEBUG] 解析后的other数据:', contentData);
          
          return {
            type: 'noallow',
            content: {
              message: contentData.content?.message || contentData.message || '无法识别的图片内容'
            }
          };
        } else {
          // 如果type存在但对应的数据字段为null或不存在
          console.log('🔍 [API DEBUG] type存在但对应数据字段为空:', resultType);
          return {
            type: 'noallow',
            content: {
              message: '无法识别的图片内容'
            }
          };
        }
      } catch (parseError) {
        console.error('🚨 [API ERROR] 解析JSON数据失败:', parseError);
        throw new Error('Dify API 返回的数据格式无法解析');
      }
    } else {
      console.error('🚨 [API ERROR] outputs中缺少type字段');
      throw new Error('Dify API 返回格式异常：缺少 type 字段');
    }
  }
  
  console.error('🚨 [API ERROR] result.data或result.data.outputs不存在');
  throw new Error('Dify API 返回格式异常');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const lang = formData.get('lang') as string || 'zh';
    
    // 添加调试信息
    console.log('🔍 [API DEBUG] 接收到的lang参数:', lang);
    console.log('🔍 [API DEBUG] 原始formData中的lang:', formData.get('lang')); // 默认为中文
    
    // 验证文件
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: '请选择要分析的图片', code: 'NO_FILE' },
        { status: 400 }
      );
    }
    
    // 使用 AI 配置进行文件验证
    const foodConfig = defaultAIConfig.features.foodRecognition;
    
    // 食物识别功能永远启用，移除enabled检查
    
    // 验证文件类型
    const fileExtension = imageFile.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !foodConfig.supportedFormats.includes(fileExtension)) {
      return NextResponse.json(
        { success: false, error: `请上传 ${foodConfig.supportedFormats.join('、').toUpperCase()} 格式的图片`, code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      );
    }
    
    // 验证文件大小
    if (imageFile.size > foodConfig.maxFileSize) {
      const maxSizeMB = Math.round(foodConfig.maxFileSize / 1024 / 1024);
      return NextResponse.json(
        { success: false, error: `图片文件大小不能超过 ${maxSizeMB}MB`, code: 'FILE_TOO_LARGE' },
        { status: 400 }
      );
    }
    
    // 检查 API 密钥是否配置
    if (!defaultAIConfig.dify.apiKey) {
      return NextResponse.json(
        { success: false, error: 'API 密钥未配置，请联系管理员', code: 'API_KEY_MISSING' },
        { status: 500 }
      );
    }
    
    // 上传文件到 Dify 并获取文件 ID
    const uploadFileId = await uploadFileToDify(imageFile);
    
    // 调用 Dify 工作流（带超时处理）
    const result = await Promise.race([
      callDifyWorkflow(uploadFileId, lang),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('请求超时')), 30000) // 30秒超时
      )
    ]);
    
    // 返回分析结果
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    // 添加详细的错误日志
    console.error('🚨 [API ERROR] POST /api/dify/analyze 发生错误:');
    console.error('🚨 [API ERROR] 错误类型:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('🚨 [API ERROR] 错误信息:', error instanceof Error ? error.message : String(error));
    console.error('🚨 [API ERROR] 错误堆栈:', error instanceof Error ? error.stack : 'No stack trace');
    
    // 根据错误类型返回不同的错误信息
    if (error instanceof Error) {
      if (error.message === '请求超时') {
        return NextResponse.json(
          { success: false, error: '分析超时，请稍后重试', code: 'TIMEOUT' },
          { status: 408 }
        );
      }
      
      // 注意：工作流ID是Dify返回的，不需要我们配置，所以删除了相关检查
      
      if (error.message.includes('API_KEY')) {
        return NextResponse.json(
          { success: false, error: 'API密钥无效，请联系管理员', code: 'INVALID_API_KEY' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('网络')) {
        return NextResponse.json(
          { success: false, error: '网络连接失败，请检查网络后重试', code: 'NETWORK_ERROR' },
          { status: 503 }
        );
      }
    }
    
    // 返回错误信息
    const errorMessage = error instanceof Error ? error.message : '分析过程中发生未知错误';
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';

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
  const apiKey = process.env.DIFY_API_KEY;
  
  if (!apiKey) {
    throw new Error('DIFY_API_KEY 未配置');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('user', 'diabetes-app-user');

  const response = await fetch('https://api.dify.ai/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
async function callDifyWorkflow(uploadFileId: string): Promise<AnalysisResult> {
  const apiKey = process.env.DIFY_API_KEY;
  
  if (!apiKey) {
    throw new Error('DIFY_API_KEY 未配置');
  }

  const requestBody = {
    inputs: {
      image: {
        type: 'image',
        transfer_method: 'local_file',
        upload_file_id: uploadFileId
      }
    },
    response_mode: 'blocking',
    user: 'diabetes-app-user'
  };



  const response = await fetch('https://api.dify.ai/v1/workflows/run', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });



  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Dify API 调用失败: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const result = await response.json();
  
  // 从 Dify 响应中提取分析结果
  if (result.data && result.data.outputs) {
    const outputs = result.data.outputs;
    
    // Dify 返回的数据在 text 字段中，需要解析 JSON 字符串
    if (outputs.text) {
      try {
        const parsedResult = JSON.parse(outputs.text);
        
        // 根据解析后的数据结构返回结果
        if (parsedResult.type === 'test') {
          return {
            type: 'test',
            content: parsedResult.content
          };
        } else if (parsedResult.type === 'food') {
          return {
            type: 'food',
            content: parsedResult.content
          };
        } else if (parsedResult.type === 'noallow') {
          return {
            type: 'noallow',
            content: {
              message: parsedResult.content?.message || '无法识别的图片内容'
            }
          };
        } else {
          return {
            type: 'noallow',
            content: {
              message: '无法识别的图片内容'
            }
          };
        }
      } catch (parseError) {
        throw new Error('Dify API 返回的数据格式无法解析');
      }
    } else {
      throw new Error('Dify API 返回格式异常：缺少 text 字段');
    }
  }
  
  throw new Error('Dify API 返回格式异常');
}

export async function POST(request: NextRequest) {
  try {
    // 解析表单数据
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    // 验证文件
    if (!file) {
      return NextResponse.json(
        { success: false, error: '请选择要分析的图片', code: 'NO_FILE' },
        { status: 400 }
      );
    }
    
    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: '请上传 JPG、PNG、GIF 或 WEBP 格式的图片', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      );
    }
    
    // 验证文件大小（限制为 10MB）
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: '图片文件大小不能超过 10MB', code: 'FILE_TOO_LARGE' },
        { status: 400 }
      );
    }
    
    // 检查 API 密钥是否配置
    if (!process.env.DIFY_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'API 密钥未配置，请联系管理员', code: 'API_KEY_MISSING' },
        { status: 500 }
      );
    }
    
    // 上传文件到 Dify 并获取文件 ID
    const uploadFileId = await uploadFileToDify(file);
    
    // 调用 Dify 工作流（带超时处理）
    const result = await Promise.race([
      callDifyWorkflow(uploadFileId),
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
    
    // 根据错误类型返回不同的错误信息
    if (error instanceof Error) {
      if (error.message === '请求超时') {
        return NextResponse.json(
          { success: false, error: '分析超时，请稍后重试', code: 'TIMEOUT' },
          { status: 408 }
        );
      }
      
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
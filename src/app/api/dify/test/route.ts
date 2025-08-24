import { NextRequest, NextResponse } from 'next/server';

// 测试 Dify API 连接的路由
export async function GET() {
  try {
    // 检查环境变量
    const apiKey = process.env.DIFY_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'DIFY_API_KEY 环境变量未配置',
        details: {
          hasApiKey: false,
          apiKeyLength: 0
        }
      }, { status: 500 });
    }

    // 基本信息检查
    const diagnostics = {
      hasApiKey: true,
      apiKeyLength: apiKey.length,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
      timestamp: new Date().toISOString()
    };

    // 测试 Dify API 连接 - 尝试调用一个简单的端点
    try {
      const testResponse = await fetch('https://api.dify.ai/v1/parameters', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        // 设置较短的超时时间用于测试
        signal: AbortSignal.timeout(10000) // 10秒超时
      });

      console.log('Dify API 测试响应状态:', testResponse.status);
      
      if (testResponse.ok) {
        const responseData = await testResponse.json();
        return NextResponse.json({
          success: true,
          message: 'Dify API 连接正常',
          diagnostics,
          apiResponse: {
            status: testResponse.status,
            statusText: testResponse.statusText,
            data: responseData
          }
        });
      } else {
        const errorText = await testResponse.text();
        return NextResponse.json({
          success: false,
          error: 'Dify API 调用失败',
          diagnostics,
          apiResponse: {
            status: testResponse.status,
            statusText: testResponse.statusText,
            errorText
          }
        }, { status: testResponse.status });
      }
    } catch (fetchError: any) {
      console.error('Dify API 连接错误:', fetchError);
      
      return NextResponse.json({
        success: false,
        error: 'Dify API 网络连接失败',
        diagnostics,
        networkError: {
          name: fetchError.name,
          message: fetchError.message,
          cause: fetchError.cause?.toString()
        }
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error('测试过程中发生错误:', error);
    
    return NextResponse.json({
      success: false,
      error: '测试过程中发生未知错误',
      details: {
        name: error.name,
        message: error.message
      }
    }, { status: 500 });
  }
}

// 也支持 POST 请求进行更详细的测试
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const testType = body.testType || 'basic';
    
    const apiKey = process.env.DIFY_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'DIFY_API_KEY 未配置'
      }, { status: 500 });
    }

    if (testType === 'workflow') {
      // 测试工作流端点（不发送实际数据）
      try {
        const response = await fetch('https://api.dify.ai/v1/workflows/run', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: {},
            response_mode: 'blocking',
            user: 'test-user'
          }),
          signal: AbortSignal.timeout(5000) // 5秒超时
        });

        const responseText = await response.text();
        
        return NextResponse.json({
          success: true,
          message: '工作流端点测试完成',
          testResult: {
            status: response.status,
            statusText: response.statusText,
            response: responseText
          }
        });
      } catch (error: any) {
        return NextResponse.json({
          success: false,
          error: '工作流端点测试失败',
          details: error.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: '基本测试完成',
      availableTests: ['basic', 'workflow']
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: '请求处理失败',
      details: error.message
    }, { status: 500 });
  }
}
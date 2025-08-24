/**
 * AI Services Configuration for Diabetes Management App
 * 糖尿病管理应用的 AI 服务配置
 */

export interface AIServiceConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  models?: string[];
  features?: string[];
}

export interface DiabetesAIConfig {
  // Dify API 配置 - 主要用于食物识别和血糖分析
  // 注意：工作流通过API Key识别，不需要单独的工作流ID
  dify: {
    apiKey: string;
    baseUrl: string;
    endpoints: {
      foodRecognition: string;
      bloodGlucoseAnalysis: string;
      nutritionAdvice: string;
    };
  };
  
  // Kling AI 配置 - 用于图像和视频生成
  kling: {
    accessKey: string;
    secretKey: string;
    features: {
      imageGeneration: boolean;
      videoGeneration: boolean;
    };
  };
  
  // OpenRouter 配置 - 备用 AI 模型
  openRouter: {
    apiKey: string;
    models: {
      gpt4: string;
      claude: string;
      gemini: string;
    };
  };
  
  // SiliconFlow 配置 - AI 推理服务
  siliconFlow: {
    apiKey: string;
    baseUrl: string;
    models: string[];
  };
  
  // 应用特定的 AI 功能配置
  features: {
    foodRecognition: {
      enabled: boolean;
      accuracy: number;
      supportedFormats: string[];
      maxFileSize: number;
    };
    bloodGlucoseOCR: {
      enabled: boolean;
      supportedDevices: string[];
      confidenceThreshold: number;
    };
    aiInsights: {
      enabled: boolean;
      personalizedRecommendations: boolean;
      trendAnalysis: boolean;
    };
    medicalCompliance: {
      disclaimerEnabled: boolean;
      hipaaMode: boolean;
      dataRetention: number; // days
    };
  };
}

// 默认配置
export const defaultAIConfig: DiabetesAIConfig = {
  dify: {
    baseUrl: process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1',
    apiKey: (() => {
      const apiKey = process.env.DIFY_API_KEY || '';
      console.log('🔑 DIFY API Key 调试:', {
        hasApiKey: !!apiKey,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 10) + '...',
        envVarName: 'DIFY_API_KEY'
      });
      return apiKey;
    })(),
    endpoints: {
      foodRecognition: '/workflows/run',
      bloodGlucoseAnalysis: '/workflows/run',
      nutritionAdvice: '/workflows/run'
    }
  },
  
  kling: {
    accessKey: process.env.KLING_ACCESS_KEY || '',
    secretKey: process.env.KLING_SECRET_KEY || '',
    features: {
      imageGeneration: true,
      videoGeneration: false // 暂时禁用视频生成以节省成本
    }
  },
  
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || '',
    models: {
      gpt4: 'openai/gpt-4-turbo',
      claude: 'anthropic/claude-3-sonnet',
      gemini: 'google/gemini-pro'
    }
  },
  
  siliconFlow: {
    apiKey: process.env.SILICONFLOW_API_KEY || '',
    baseUrl: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.cn/v1',
    models: [
      'Qwen/Qwen2-72B-Instruct',
      'deepseek-ai/DeepSeek-V2-Chat',
      'meta-llama/Meta-Llama-3.1-70B-Instruct'
    ]
  },
  
  features: {
    foodRecognition: {
      enabled: true, // 食物识别功能永远启用，不再依赖环境变量
      accuracy: 0.95, // 95% 准确率目标
      supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      maxFileSize: 10 * 1024 * 1024 // 10MB
    },
    bloodGlucoseOCR: {
      enabled: process.env.NEXT_PUBLIC_BLOOD_GLUCOSE_OCR_ENABLED === 'true',
      supportedDevices: [
        'FreeStyle Libre',
        'Dexcom G6',
        'Medtronic Guardian',
        'OneTouch',
        'Accu-Chek'
      ],
      confidenceThreshold: 0.9
    },
    aiInsights: {
      enabled: process.env.NEXT_PUBLIC_AI_INSIGHTS_ENABLED === 'true',
      personalizedRecommendations: true,
      trendAnalysis: true
    },
    medicalCompliance: {
      disclaimerEnabled: process.env.NEXT_PUBLIC_MEDICAL_DISCLAIMER_ENABLED === 'true',
      hipaaMode: process.env.NEXT_PUBLIC_HIPAA_COMPLIANCE_MODE === 'true',
      dataRetention: 365 // 保留数据 1 年
    }
  }
};

// AI 服务状态检查
export const checkAIServiceStatus = async (): Promise<Record<string, boolean>> => {
  const status: Record<string, boolean> = {};
  
  // 检查 Dify API
  try {
    if (defaultAIConfig.dify.apiKey) {
      // 这里可以添加实际的 API 健康检查
      status.dify = true;
    } else {
      status.dify = false;
    }
  } catch {
    status.dify = false;
  }
  
  // 检查其他服务
  status.kling = !!defaultAIConfig.kling.accessKey && !!defaultAIConfig.kling.secretKey;
  status.openRouter = !!defaultAIConfig.openRouter.apiKey;
  status.siliconFlow = !!defaultAIConfig.siliconFlow.apiKey;
  
  return status;
};

// 获取可用的 AI 模型列表
export const getAvailableModels = () => {
  const models: string[] = [];
  
  if (defaultAIConfig.openRouter.apiKey) {
    models.push(...Object.values(defaultAIConfig.openRouter.models));
  }
  
  if (defaultAIConfig.siliconFlow.apiKey) {
    models.push(...defaultAIConfig.siliconFlow.models);
  }
  
  return models;
};

// 医疗免责声明文本
export const MEDICAL_DISCLAIMER = {
  zh: '本应用提供的信息仅供参考，不能替代专业医疗建议。请在做出任何医疗决定前咨询您的医生。',
  en: 'The information provided by this app is for reference only and cannot replace professional medical advice. Please consult your doctor before making any medical decisions.'
};
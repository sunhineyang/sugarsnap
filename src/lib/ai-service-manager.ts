/**
 * AI Service Manager for Diabetes Management App
 * 糖尿病管理应用的 AI 服务管理器
 */

import { defaultAIConfig, type DiabetesAIConfig, MEDICAL_DISCLAIMER } from '@/config/ai-config';

export interface AIServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  medicalDisclaimer?: string;
}

export interface FoodRecognitionResult {
  foodName: string;
  nutritionInfo: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  diabeticRecommendation: {
    level: 'green' | 'yellow' | 'red';
    score: number;
    advice: string;
    portionSuggestion: string;
  };
  confidence: number;
}

export interface BloodGlucoseAnalysis {
  value: number;
  unit: 'mg/dL' | 'mmol/L';
  timestamp: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  trend: 'rising' | 'falling' | 'stable';
  recommendations: string[];
  nextTestTime?: string;
}

export class AIServiceManager {
  private config: DiabetesAIConfig;
  
  constructor(config: DiabetesAIConfig = defaultAIConfig) {
    this.config = config;
  }
  
  /**
   * 食物识别服务
   * @param imageFile 食物图片文件
   * @returns 食物识别结果
   */
  async recognizeFood(imageFile: File): Promise<AIServiceResponse<FoodRecognitionResult[]>> {
    try {
      if (!this.config.features.foodRecognition.enabled) {
        return {
          success: false,
          error: '食物识别功能已禁用'
        };
      }
      
      // 检查文件大小
      if (imageFile.size > this.config.features.foodRecognition.maxFileSize) {
        return {
          success: false,
          error: `文件大小超过限制 (${this.config.features.foodRecognition.maxFileSize / 1024 / 1024}MB)`
        };
      }
      
      // 检查文件格式
      const fileExtension = imageFile.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !this.config.features.foodRecognition.supportedFormats.includes(fileExtension)) {
        return {
          success: false,
          error: `不支持的文件格式。支持的格式: ${this.config.features.foodRecognition.supportedFormats.join(', ')}`
        };
      }
      
      // 调用 Dify API 进行食物识别
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('user', 'diabetes-user');
      formData.append('inputs', JSON.stringify({
        analysis_type: 'food_recognition',
        diabetes_focus: true
      }));
      
      const response = await fetch(`${this.config.dify.baseUrl}${this.config.dify.endpoints.foodRecognition}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.dify.apiKey}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        data: this.parseFoodRecognitionResult(result),
        medicalDisclaimer: this.config.features.medicalCompliance.disclaimerEnabled 
          ? MEDICAL_DISCLAIMER.zh 
          : undefined
      };
      
    } catch (error) {
      console.error('食物识别错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
  
  /**
   * 血糖数据分析服务
   * @param glucoseData 血糖数据
   * @returns 血糖分析结果
   */
  async analyzeBloodGlucose(glucoseData: {
    value: number;
    unit: 'mg/dL' | 'mmol/L';
    timestamp: string;
    mealContext?: string;
  }): Promise<AIServiceResponse<BloodGlucoseAnalysis>> {
    try {
      if (!this.config.features.bloodGlucoseOCR.enabled) {
        return {
          success: false,
          error: '血糖分析功能已禁用'
        };
      }
      
      const response = await fetch(`${this.config.dify.baseUrl}${this.config.dify.endpoints.bloodGlucoseAnalysis}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.dify.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {
            glucose_value: glucoseData.value,
            unit: glucoseData.unit,
            timestamp: glucoseData.timestamp,
            meal_context: glucoseData.mealContext || '',
            analysis_type: 'blood_glucose_analysis'
          },
          user: 'diabetes-user'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        data: this.parseBloodGlucoseResult(result, glucoseData),
        medicalDisclaimer: this.config.features.medicalCompliance.disclaimerEnabled 
          ? MEDICAL_DISCLAIMER.zh 
          : undefined
      };
      
    } catch (error) {
      console.error('血糖分析错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
  
  /**
   * 获取个性化营养建议
   * @param userProfile 用户档案
   * @param recentData 最近的数据
   * @returns 营养建议
   */
  async getNutritionAdvice(userProfile: {
    age: number;
    weight: number;
    height: number;
    diabetesType: 1 | 2;
    activityLevel: 'low' | 'moderate' | 'high';
  }, recentData: {
    avgGlucose: number;
    recentMeals: string[];
  }): Promise<AIServiceResponse<string[]>> {
    try {
      if (!this.config.features.aiInsights.enabled) {
        return {
          success: false,
          error: 'AI 洞察功能已禁用'
        };
      }
      
      const response = await fetch(`${this.config.dify.baseUrl}${this.config.dify.endpoints.nutritionAdvice}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.dify.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: {
            user_profile: userProfile,
            recent_data: recentData,
            advice_type: 'personalized_nutrition'
          },
          user: 'diabetes-user'
        })
      });
      
      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        data: this.parseNutritionAdvice(result),
        medicalDisclaimer: MEDICAL_DISCLAIMER.zh
      };
      
    } catch (error) {
      console.error('营养建议错误:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }
  
  /**
   * 解析食物识别结果
   */
  private parseFoodRecognitionResult(apiResult: any): FoodRecognitionResult[] {
    // 这里需要根据实际的 Dify API 响应格式来解析
    // 以下是示例解析逻辑
    const foods = apiResult.data?.foods || [];
    
    return foods.map((food: any) => ({
      foodName: food.name || '未识别食物',
      nutritionInfo: {
        calories: food.nutrition?.calories || 0,
        carbs: food.nutrition?.carbs || 0,
        protein: food.nutrition?.protein || 0,
        fat: food.nutrition?.fat || 0,
        fiber: food.nutrition?.fiber || 0,
        sugar: food.nutrition?.sugar || 0
      },
      diabeticRecommendation: {
        level: this.getDiabeticLevel(food.nutrition?.carbs || 0, food.nutrition?.sugar || 0),
        score: food.diabetic_score || 0,
        advice: food.advice || '请咨询医生获取个性化建议',
        portionSuggestion: food.portion_suggestion || '适量食用'
      },
      confidence: food.confidence || 0.8
    }));
  }
  
  /**
   * 解析血糖分析结果
   */
  private parseBloodGlucoseResult(apiResult: any, originalData: any): BloodGlucoseAnalysis {
    const analysis = apiResult.data?.analysis || {};
    
    return {
      value: originalData.value,
      unit: originalData.unit,
      timestamp: originalData.timestamp,
      status: this.getGlucoseStatus(originalData.value, originalData.unit),
      trend: analysis.trend || 'stable',
      recommendations: analysis.recommendations || [],
      nextTestTime: analysis.next_test_time
    };
  }
  
  /**
   * 解析营养建议
   */
  private parseNutritionAdvice(apiResult: any): string[] {
    return apiResult.data?.advice || [
      '保持规律的饮食时间',
      '控制碳水化合物摄入量',
      '增加膳食纤维摄入',
      '定期监测血糖水平'
    ];
  }
  
  /**
   * 获取糖尿病友好程度等级
   */
  private getDiabeticLevel(carbs: number, sugar: number): 'green' | 'yellow' | 'red' {
    const totalCarbs = carbs + sugar;
    
    if (totalCarbs <= 15) return 'green';
    if (totalCarbs <= 30) return 'yellow';
    return 'red';
  }
  
  /**
   * 获取血糖状态
   */
  private getGlucoseStatus(value: number, unit: 'mg/dL' | 'mmol/L'): 'normal' | 'high' | 'low' | 'critical' {
    // 转换为 mg/dL 进行判断
    const mgdlValue = unit === 'mmol/L' ? value * 18 : value;
    
    if (mgdlValue < 70) return mgdlValue < 54 ? 'critical' : 'low';
    if (mgdlValue > 180) return mgdlValue > 250 ? 'critical' : 'high';
    return 'normal';
  }
}

// 导出单例实例
export const aiServiceManager = new AIServiceManager();
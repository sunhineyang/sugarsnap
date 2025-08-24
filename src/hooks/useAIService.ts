/**
 * React Hook for AI Services in Diabetes Management App
 * 糖尿病管理应用的 AI 服务 React Hook
 */

import { useState, useCallback } from 'react';
import { aiServiceManager, type AIServiceResponse, type FoodRecognitionResult, type BloodGlucoseAnalysis } from '@/lib/ai-service-manager';
import { toast } from 'sonner';

export interface UseAIServiceReturn {
  // 食物识别相关
  recognizeFood: (file: File) => Promise<FoodRecognitionResult[] | null>;
  foodRecognitionLoading: boolean;
  foodRecognitionError: string | null;
  
  // 血糖分析相关
  analyzeBloodGlucose: (data: {
    value: number;
    unit: 'mg/dL' | 'mmol/L';
    timestamp: string;
    mealContext?: string;
  }) => Promise<BloodGlucoseAnalysis | null>;
  bloodGlucoseLoading: boolean;
  bloodGlucoseError: string | null;
  
  // 营养建议相关
  getNutritionAdvice: (userProfile: {
    age: number;
    weight: number;
    height: number;
    diabetesType: 1 | 2;
    activityLevel: 'low' | 'moderate' | 'high';
  }, recentData: {
    avgGlucose: number;
    recentMeals: string[];
  }) => Promise<string[] | null>;
  nutritionAdviceLoading: boolean;
  nutritionAdviceError: string | null;
  
  // 通用状态
  clearErrors: () => void;
}

export const useAIService = (): UseAIServiceReturn => {
  // 食物识别状态
  const [foodRecognitionLoading, setFoodRecognitionLoading] = useState(false);
  const [foodRecognitionError, setFoodRecognitionError] = useState<string | null>(null);
  
  // 血糖分析状态
  const [bloodGlucoseLoading, setBloodGlucoseLoading] = useState(false);
  const [bloodGlucoseError, setBloodGlucoseError] = useState<string | null>(null);
  
  // 营养建议状态
  const [nutritionAdviceLoading, setNutritionAdviceLoading] = useState(false);
  const [nutritionAdviceError, setNutritionAdviceError] = useState<string | null>(null);
  
  /**
   * 食物识别功能
   */
  const recognizeFood = useCallback(async (file: File): Promise<FoodRecognitionResult[] | null> => {
    setFoodRecognitionLoading(true);
    setFoodRecognitionError(null);
    
    try {
      const response = await aiServiceManager.recognizeFood(file);
      
      if (!response.success) {
        const errorMsg = response.error || '食物识别失败';
        setFoodRecognitionError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
      
      // 显示医疗免责声明（如果启用）
      if (response.medicalDisclaimer) {
        toast.info(response.medicalDisclaimer, {
          duration: 5000,
          position: 'top-center'
        });
      }
      
      // 显示成功消息
      const foodCount = response.data?.length || 0;
      toast.success(`成功识别 ${foodCount} 种食物`);
      
      return response.data || [];
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '食物识别过程中发生未知错误';
      setFoodRecognitionError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setFoodRecognitionLoading(false);
    }
  }, []);
  
  /**
   * 血糖分析功能
   */
  const analyzeBloodGlucose = useCallback(async (data: {
    value: number;
    unit: 'mg/dL' | 'mmol/L';
    timestamp: string;
    mealContext?: string;
  }): Promise<BloodGlucoseAnalysis | null> => {
    setBloodGlucoseLoading(true);
    setBloodGlucoseError(null);
    
    try {
      const response = await aiServiceManager.analyzeBloodGlucose(data);
      
      if (!response.success) {
        const errorMsg = response.error || '血糖分析失败';
        setBloodGlucoseError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
      
      // 显示医疗免责声明（如果启用）
      if (response.medicalDisclaimer) {
        toast.info(response.medicalDisclaimer, {
          duration: 5000,
          position: 'top-center'
        });
      }
      
      // 根据血糖状态显示不同的提示
      if (response.data) {
        const { status, value, unit } = response.data;
        let message = `血糖分析完成: ${value} ${unit}`;
        let toastType: 'success' | 'warning' | 'error' = 'success';
        
        switch (status) {
          case 'low':
            message += ' (偏低)';
            toastType = 'warning';
            break;
          case 'high':
            message += ' (偏高)';
            toastType = 'warning';
            break;
          case 'critical':
            message += ' (危险水平)';
            toastType = 'error';
            break;
          default:
            message += ' (正常范围)';
        }
        
        toast[toastType](message);
      }
      
      return response.data || null;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '血糖分析过程中发生未知错误';
      setBloodGlucoseError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setBloodGlucoseLoading(false);
    }
  }, []);
  
  /**
   * 获取营养建议功能
   */
  const getNutritionAdvice = useCallback(async (
    userProfile: {
      age: number;
      weight: number;
      height: number;
      diabetesType: 1 | 2;
      activityLevel: 'low' | 'moderate' | 'high';
    },
    recentData: {
      avgGlucose: number;
      recentMeals: string[];
    }
  ): Promise<string[] | null> => {
    setNutritionAdviceLoading(true);
    setNutritionAdviceError(null);
    
    try {
      const response = await aiServiceManager.getNutritionAdvice(userProfile, recentData);
      
      if (!response.success) {
        const errorMsg = response.error || '获取营养建议失败';
        setNutritionAdviceError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
      
      // 显示医疗免责声明
      if (response.medicalDisclaimer) {
        toast.info(response.medicalDisclaimer, {
          duration: 5000,
          position: 'top-center'
        });
      }
      
      toast.success('个性化营养建议已生成');
      
      return response.data || [];
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '获取营养建议过程中发生未知错误';
      setNutritionAdviceError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setNutritionAdviceLoading(false);
    }
  }, []);
  
  /**
   * 清除所有错误状态
   */
  const clearErrors = useCallback(() => {
    setFoodRecognitionError(null);
    setBloodGlucoseError(null);
    setNutritionAdviceError(null);
  }, []);
  
  return {
    // 食物识别
    recognizeFood,
    foodRecognitionLoading,
    foodRecognitionError,
    
    // 血糖分析
    analyzeBloodGlucose,
    bloodGlucoseLoading,
    bloodGlucoseError,
    
    // 营养建议
    getNutritionAdvice,
    nutritionAdviceLoading,
    nutritionAdviceError,
    
    // 通用功能
    clearErrors
  };
};

/**
 * 用于检查 AI 服务状态的 Hook
 */
export const useAIServiceStatus = () => {
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  
  const checkStatus = useCallback(async () => {
    setLoading(true);
    try {
      // 这里可以调用 AI 服务管理器的状态检查方法
      // const serviceStatus = await aiServiceManager.checkServiceStatus();
      // setStatus(serviceStatus);
      
      // 临时模拟状态检查
      setStatus({
        dify: !!process.env.DIFY_API_KEY,
        kling: !!(process.env.KLING_ACCESS_KEY && process.env.KLING_SECRET_KEY),
        openRouter: !!process.env.OPENROUTER_API_KEY,
        siliconFlow: !!process.env.SILICONFLOW_API_KEY
      });
    } catch (error) {
      console.error('检查 AI 服务状态失败:', error);
      toast.error('无法检查 AI 服务状态');
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    status,
    loading,
    checkStatus
  };
};
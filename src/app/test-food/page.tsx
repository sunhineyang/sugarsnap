'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';

// 模拟你提供的真实 Dify 返回数据
const mockDifyResponse = {
  success: true,
  data: {
    type: "food",
    content: [
      {
        name: "清炒时蔬",
        recommendation: "绿灯",
        explanation: "主要成分为新鲜蔬菜，低热量、高纤维，有助于血糖控制，是糖尿病患者非常推荐的选择。"
      },
      {
        name: "水煮蛋配青菜",
        recommendation: "绿灯",
        explanation: "水煮蛋蛋白质含量高，搭配青菜低脂肪、低碳水化合物，有助于稳定血糖。"
      },
      {
        name: "蒸水蛋配海参",
        recommendation: "绿灯",
        explanation: "蒸蛋和海参都是高蛋白、低脂肪食物，对血糖影响较小，适合糖尿病患者食用。"
      },
      {
        name: "清蒸大闸蟹",
        recommendation: "黄灯",
        explanation: "大闸蟹蛋白质丰富，但胆固醇含量较高，不宜过量。建议适量食用，注意搭配低脂肪、低盐饮食。"
      },
      {
        name: "白灼虾",
        recommendation: "黄灯",
        explanation: "虾富含优质蛋白质，但同样胆固醇较高，建议适量摄入，并避免高油高盐调料。"
      },
      {
        name: "红烧肉炖鹌鹑蛋",
        recommendation: "红灯",
        explanation: "红烧肉脂肪和热量极高，鹌鹑蛋胆固醇也较高，此类高油、高脂、高能量的食物容易导致血糖波动，不建议糖尿病患者食用。"
      }
    ]
  }
};

interface AnalysisResult {
  id: string;
  type: string;
  timestamp: string;
  image: {
    src: string;
    alt: string;
  };
  food?: {
    name: string;
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    confidence: number;
    recommendation: string;
    explanation: string;
    allFoods: any[];
  };
}

export default function TestFoodPage() {
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'completed'>('idle');

  const testFoodRecognition = () => {
    console.log('🔍 开始测试食物识别功能');
    console.log('📥 模拟 Dify API 返回数据:', mockDifyResponse);
    
    const result = mockDifyResponse;
    
    // 验证返回结果格式
    if (!result || !result.success || !result.data || !result.data.type) {
      console.error('❌ API 返回数据格式异常');
      return;
    }
    
    console.log('✅ 数据格式验证通过');
    console.log('📊 结果类型:', result.data.type);
    console.log('📋 内容数据:', result.data.content);
    
    // 创建基础结果对象
    const mockResult: AnalysisResult = {
      id: Date.now().toString(),
      type: 'food',
      timestamp: new Date().toISOString(),
      image: {
        src: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=healthy%20chinese%20food%20dishes%20on%20table&image_size=square',
        alt: '测试食物图片'
      }
    };
    
    // 根据 Dify API 返回的结果类型处理数据
    if (result.data.type === 'food') {
      console.log('🍽️ 处理食物识别结果');
      const foodItems = result.data.content;
      
      if (foodItems && foodItems.length > 0) {
        console.log('📝 食物项目数量:', foodItems.length);
        // 取第一个食物作为主要结果
        const mainFood = foodItems[0];
        console.log('🥗 主要食物:', mainFood);
        
        mockResult.food = {
          name: mainFood.name,
          calories: 100, // Dify 返回的数据中没有热量信息，使用默认值
          carbs: 15, // Dify 返回的数据中没有碳水信息，使用默认值
          protein: 0.3,
          fat: 0.2,
          confidence: 0.9, // 使用默认置信度
          recommendation: mainFood.recommendation,
          explanation: mainFood.explanation,
          allFoods: foodItems // 保存所有食物信息
        };
        
        console.log('✅ 食物数据处理完成:', mockResult.food);
      } else {
        console.log('⚠️ 没有找到食物项目');
      }
    }
    
    console.log('🎯 最终结果对象:', mockResult);
    setCurrentResult(mockResult);
    setAnalysisStatus('completed');
    console.log('✅ 状态设置为 completed');
  };

  const resetTest = () => {
    setCurrentResult(null);
    setAnalysisStatus('idle');
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">食物识别功能测试页面</h1>
      
      <div className="mb-8">
        <Button onClick={testFoodRecognition} className="mr-4">
          测试食物识别
        </Button>
        <Button variant="outline" onClick={resetTest}>
          重置测试
        </Button>
      </div>

      {analysisStatus === 'idle' && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">点击上方按钮开始测试食物识别功能</p>
          </CardContent>
        </Card>
      )}

      {analysisStatus === 'completed' && currentResult && (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-6">分析完成</h3>
          
          {/* 结果展示 */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <img 
                src={currentResult.image.src} 
                alt={currentResult.image.alt} 
                className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 border"
              />
              
              {currentResult.food && (
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="font-semibold text-lg">食物识别结果</h4>
                    <Badge variant="secondary">
                      {((currentResult.food.confidence || 0) * 100).toFixed(1)}% 置信度
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">食物名称</div>
                      <div className="font-semibold">{currentResult.food.name}</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">热量</div>
                      <div className="font-semibold">{currentResult.food.calories} 卡</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">碳水化合物</div>
                      <div className="font-semibold">{currentResult.food.carbs}g</div>
                    </div>
                  </div>
                  
                  {/* 显示所有食物的详细信息 */}
                  <div className="mt-6">
                    <h5 className="font-semibold mb-4">识别到的所有食物：</h5>
                    <div className="grid gap-4">
                      {currentResult.food.allFoods?.map((food, index) => {
                        const getBadgeVariant = (recommendation: string) => {
                          switch (recommendation) {
                            case '绿灯': return 'default';
                            case '黄灯': return 'secondary';
                            case '红灯': return 'destructive';
                            default: return 'outline';
                          }
                        };
                        
                        return (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <h6 className="font-medium">{food.name}</h6>
                              <Badge variant={getBadgeVariant(food.recommendation)}>
                                {food.recommendation}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{food.explanation}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
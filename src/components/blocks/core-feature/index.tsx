"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, Loader2, CheckCircle, AlertCircle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoreFeature, AnalysisResult, AnalysisStatus, RecognitionType } from "@/types/blocks/core-feature";

interface CoreFeatureProps {
  data: CoreFeature;
}

export default function CoreFeatureBlock({ data }: CoreFeatureProps) {
  // 状态管理
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("idle");
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  // 文件输入引用
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // 处理文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: RecognitionType) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert(data.analysis?.file_type_error || '请选择图片文件');
      return;
    }

    // 创建预览URL
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    
    // 开始分析流程
    startAnalysis(file, type);
  };

  // 开始AI分析
  const startAnalysis = async (file: File, type: RecognitionType) => {
    setAnalysisStatus("uploading");
    
    // 声明 result 变量，确保在整个函数中都可访问
    let result: any = null;
    
    try {
      // 文件大小检查（限制为 10MB）
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('文件大小不能超过 10MB');
      }
      
      // 创建 FormData 对象
      const formData = new FormData();
      formData.append('image', file);
      
      setAnalysisStatus("analyzing");
      
      // 创建超时控制器
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000); // 30秒超时
      
      // 调用 Dify API
      const response = await fetch('/api/dify/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API 调用失败 (${response.status}): ${errorText}`);
      }
      
      result = await response.json();
      

      
      // 验证返回结果格式
      if (!result || !result.success || !result.data || !result.data.type) {
        throw new Error('API 返回数据格式异常');
      }
      
      // 创建基础结果对象
      const mockResult: AnalysisResult = {
        id: Date.now().toString(),
        type,
        timestamp: new Date().toISOString(),
        image: {
          src: selectedImage || '',
          alt: '上传的图片'
        }
      };
      
      // 根据 Dify API 返回的结果类型处理数据
      if (result.data.type === 'food') {
        // 食物识别结果
        const foodItems = result.data.content;
        
        if (foodItems && foodItems.length > 0) {
          // 取第一个食物作为主要结果
          const mainFood = foodItems[0];
          
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
        }
      } else if (result.data.type === 'test') {
        // 血糖检测结果
        const content = result.data.content;
        mockResult.bloodSugar = {
          value: parseFloat(content.blood_glucose_level),
          unit: content.unit,
          level: parseFloat(content.blood_glucose_level) > 7.0 ? "high" : "normal",
          confidence: 0.9, // 使用默认置信度
          interpretation: content.interpretation,
          recommendation: content.recommendation
        };
      } else if (result.data.type === 'noallow') {
        // 其他类型结果，设置错误状态
        const errorMsg = result.data.content.message || '无法识别的图片内容';
        setErrorMessage(errorMsg);
        setAnalysisStatus("error");
        return;
      }

      // 确保有有效的结果数据才设置为完成状态
      if (mockResult.food || mockResult.bloodSugar) {
        // 先设置结果，再设置状态
        setCurrentResult(mockResult);
        setAnalysisStatus("completed");
      } else {
        setErrorMessage('未能识别出有效内容，请重试');
        setAnalysisStatus("error");
        return;
      }
      
    } catch (error: any) {
      console.error('分析失败:', error);
      setAnalysisStatus("error");
      
      // 显示用户友好的错误信息
      let errorMsg = '分析失败，请重试';
      if (error.message) {
        if (error.message.includes('超时') || error.name === 'AbortError') {
          errorMsg = '网络超时，请检查网络连接后重试';
        } else if (error.message.includes('文件大小')) {
          errorMsg = '文件过大，请选择小于 10MB 的图片';
        } else if (error.message.includes('格式')) {
          errorMsg = '图片格式不支持，请选择 JPG、PNG 等常见格式';
        } else if (error.message.includes('配置错误')) {
          errorMsg = '服务暂时不可用，请稍后重试';
        } else {
          errorMsg = error.message;
        }
      } else if (error.name === 'AbortError') {
        errorMsg = '请求超时，请检查网络连接后重试';
      }
      
      setErrorMessage(errorMsg);
    }
  };

  // 保存结果到历史记录
  const saveResult = () => {
    if (currentResult) {
      setHistory(prev => [currentResult, ...prev.slice(0, 9)]); // 保留最近10条记录
      setCurrentResult(null);
      setSelectedImage(null);
      setAnalysisStatus("idle");
    }
  };

  // 重新开始
  const resetAnalysis = () => {
    setCurrentResult(null);
    setSelectedImage(null);
    setAnalysisStatus("idle");
    setErrorMessage("");
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="container">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {data.title || "智能健康分析"}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {data.description || "拍照上传，AI智能识别，轻松管理您的健康数据"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 主要功能区域 */}
          <Card className="mb-8">
            <CardContent className="p-8">
              {analysisStatus === "idle" && (
                <div className="text-center">
                  <div className="mb-8">
                    <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                      <Camera className="w-16 h-16 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {data.camera?.title || "开始分析"}
                    </h3>
                    <p className="text-muted-foreground">
                      {data.camera?.description || "选择拍照或上传图片进行AI分析"}
                    </p>
                  </div>

                  {/* 快捷操作按钮 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col h-auto p-6 gap-2"
                    >
                      <Camera className="w-8 h-8" />
                      <span className="text-sm font-medium">{data.quick_actions?.[0]?.title || "Photo Recognition"}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col h-auto p-6 gap-2"
                    >
                      <Upload className="w-8 h-8" />
                      <span className="text-sm font-medium">{data.quick_actions?.[1]?.title || "Upload Image"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* 分析进行中状态 */}
              {(analysisStatus === "uploading" || analysisStatus === "analyzing") && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6">
                    <Loader2 className="w-24 h-24 text-primary animate-spin" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {analysisStatus === "uploading" ? (data.analysis?.uploading_text || "上传中...") : (data.analysis?.analyzing_text || "AI分析中...")}
                  </h3>
                  <p className="text-muted-foreground">
                    {analysisStatus === "uploading" 
                      ? (data.analysis?.uploading_description || "正在上传您的图片") 
                      : (data.analysis?.analyzing_description || "AI正在智能识别分析，请稍候")}
                  </p>
                  {selectedImage && (
                    <div className="mt-6">
                      <img 
                        src={selectedImage} 
                        alt={data.camera?.placeholder || "上传的图片"} 
                        className="w-32 h-32 object-cover rounded-lg mx-auto border"
                      />
                    </div>
                  )}
                </div>
              )}



              {/* 分析完成状态 */}
              {analysisStatus === "completed" && currentResult && (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-6">{data.analysis?.completed_text || "分析完成"}</h3>
                  
                  {/* 结果展示 */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      {selectedImage && (
                        <img 
                          src={selectedImage} 
                          alt={data.camera?.placeholder || "分析图片"} 
                          className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 border"
                        />
                      )}
                      
                      {currentResult.food && (
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-4">
                            <h4 className="font-semibold text-lg">{data.results?.food_recognition_title || "食物识别结果"}</h4>
                            <Badge variant="secondary">
                              {((currentResult.food.confidence || 0) * 100).toFixed(1)}% {data.results?.confidence || "置信度"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">{data.results?.food_name || "食物名称"}</div>
                              <div className="font-semibold">{currentResult.food.name}</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">{data.results?.calories || "热量"}</div>
                              <div className="font-semibold">{currentResult.food.calories} {data.results?.unit_kcal || "卡"}</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">{data.results?.carbs || "碳水化合物"}</div>
                              <div className="font-semibold">{currentResult.food.carbs}{data.results?.unit_g || "g"}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {currentResult.bloodSugar && (
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-4">
                            <h4 className="font-semibold text-lg">{data.results?.blood_sugar_title || "血糖检测结果"}</h4>
                            <Badge 
                              variant={currentResult.bloodSugar.level === 'normal' ? 'default' : 'destructive'}
                            >
                              {currentResult.bloodSugar.level === 'normal' ? (data.results?.status_normal || '正常') :
                               currentResult.bloodSugar.level === 'high' ? (data.results?.status_high || '偏高') : (data.results?.status_low || '偏低')}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">{data.results?.blood_sugar_value || "血糖值"}</div>
                              <div className="font-semibold">{currentResult.bloodSugar.value} {currentResult.bloodSugar.unit}</div>
                            </div>
                            <div className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-sm text-muted-foreground">{data.results?.confidence || "置信度"}</div>
                              <div className="font-semibold">{((currentResult.bloodSugar.confidence || 0) * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* 操作按钮 */}
                  <div className="flex gap-4 justify-center">
                    <Button onClick={saveResult}>
                      {data.actions?.save_record || "保存记录"}
                    </Button>
                    <Button variant="outline" onClick={resetAnalysis}>
                      {data.actions?.retry_analysis || "重新分析"}
                    </Button>
                  </div>
                </div>
              )}

              {/* 错误状态 */}
              {analysisStatus === "error" && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <AlertCircle className="w-16 h-16 text-destructive" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{data.analysis?.error_title || "分析失败"}</h3>
                  <p className="text-muted-foreground mb-6">
                    {errorMessage || data.analysis?.error_text || "请检查网络连接或重试"}
                  </p>
                  {selectedImage && (
                    <div className="mb-6">
                      <img 
                        src={selectedImage} 
                        alt="分析失败的图片" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto border"
                      />
                    </div>
                  )}
                  <div className="flex gap-4 justify-center">
                    <Button onClick={resetAnalysis}>
                      {data.actions?.start_over || "重新开始"}
                    </Button>
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      选择其他图片
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 历史记录区域 */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-center gap-2">
                  <History className="w-5 h-5" />
                  <CardTitle>{data.history?.title || "最近记录"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {history.slice(0, 3).map((item, index) => (
                    <div key={item.id || index} className="flex items-center p-4 bg-muted rounded-lg">
                      {item.image && (
                        <img 
                          src={item.image.src} 
                          alt={item.image.alt || ''} 
                          className="w-12 h-12 object-cover rounded-lg mr-4"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.food?.name || item.bloodSugar?.value + ' ' + item.bloodSugar?.unit || '记录'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.timestamp && new Date(item.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, 'food')}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => handleFileUpload(e, 'food')}
          className="hidden"
        />
      </div>
    </section>
  );
}
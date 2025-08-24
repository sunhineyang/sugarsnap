import { Section, SectionItem } from "./section";
import { Image, Button } from "./base";

// 分析状态枚举
export type AnalysisStatus = "idle" | "uploading" | "analyzing" | "completed" | "error";

// 识别类型枚举
export type RecognitionType = "food" | "blood_sugar" | "manual";

// 分析结果接口
export interface AnalysisResult {
  id?: string;
  type: RecognitionType;
  timestamp?: string;
  image?: Image;
  // 食物识别结果
  food?: {
    name?: string;
    calories?: number;
    carbs?: number;
    protein?: number;
    fat?: number;
    confidence?: number;
    recommendation?: string;
    explanation?: string;
    allFoods?: Array<{
      name: string;
      recommendation: string;
      explanation: string;
    }>;
  };
  // 血糖检测结果
  bloodSugar?: {
    value?: number;
    unit?: string;
    level?: "low" | "normal" | "high";
    confidence?: number;
    interpretation?: string;
    recommendation?: string;
  };
  // 手动输入数据
  manual?: {
    description?: string;
    value?: string;
    notes?: string;
  };
}

// 历史记录项
export interface HistoryItem extends AnalysisResult {
  saved?: boolean;
}

// 核心功能配置项
export interface CoreFeatureItem extends SectionItem {
  type?: "camera" | "upload" | "manual" | "voice";
  action?: string;
  disabled?: boolean;
}

// 核心功能模块接口
export interface CoreFeature extends Section {
  // 主要功能区域
  camera?: {
    title?: string;
    description?: string;
    placeholder?: string;
    button_text?: string;
    icon?: string;
  };
  
  // 快捷操作按钮
  quick_actions?: CoreFeatureItem[];
  
  // 分析状态显示
  analysis?: {
    title?: string;
    loading_text?: string;
    success_text?: string;
    error_text?: string;
    error_title?: string;
    error_description?: string;
    failed_image_alt?: string;
    file_type_error?: string;
    uploading_text?: string;
    analyzing_text?: string;
    uploading_description?: string;
    analyzing_description?: string;
    completed_text?: string;
  };
  
  // 结果展示区域
  results?: {
    title?: string;
    empty_text?: string;
    save_button_text?: string;
    status_normal?: string;
    status_high?: string;
    status_low?: string;
    blood_sugar_value?: string;
    confidence?: string;
    food_recognition_title?: string;
    food_count_text?: string;
    blood_sugar_title?: string;
    food_name?: string;
    calories?: string;
    carbs?: string;
    protein?: string;
    fat?: string;
    recommendation?: string;
    explanation?: string;
  };
  
  // 历史记录区域
  history?: {
    title?: string;
    empty_text?: string;
    view_all_text?: string;
    max_items?: number;
  };
  
  // 提示信息
  tips?: {
    title?: string;
    items?: string[];
  };
  
  // 操作按钮
  actions?: {
    retry_analysis?: string;
    start_over?: string;
    select_other_image?: string;
    save_record?: string;
  };
}
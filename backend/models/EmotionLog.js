// backend/models/EmotionLog.js
import mongoose from 'mongoose';

// 定义数据的“规则” (Schema)
const emotionLogSchema = new mongoose.Schema({
  // 1. 用户填写的量表数据
  fomoScore: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 // 假设 FOMO (错失恐惧) 分数为 0-100
  },
  anxietyScore: { 
    type: Number, 
    required: true, 
    min: 0, 
    max: 100 // 焦虑分数
  },
  intendedAction: { 
    type: String, 
    required: true // 用户想干嘛，比如 "我想马上全仓买入DOGE"
  },
  
  // 2. AI 的处理结果
  aiAdvice: { 
    type: String, 
    default: "" // AI 给出的冷静建议
  },
  aiModelUsed: { 
    type: String, 
    enum: ['deepseek', 'gemini'], // 记录这次是哪个模型回复的
    required: true
  },
  
  // 3. 记录生成的时间
  createdAt: { 
    type: Date, 
    default: Date.now // 存入数据库时自动生成当前时间
  }
});

// 编译成 Model 并导出
const EmotionLog = mongoose.model('EmotionLog', emotionLogSchema);
export default EmotionLog;
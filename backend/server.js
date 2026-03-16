import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import EmotionLog from './models/EmotionLog.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { setGlobalDispatcher, ProxyAgent } from 'undici';

// 强制 Node.js 全局 fetch 走本地代理端口 (例如 Clash 默认是 7890)
const proxyAgent = new ProxyAgent('http://127.0.0.1:7890');
setGlobalDispatcher(proxyAgent);
// 加载环境变量
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. 初始化 MongoDB 连接
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB 连接成功'))
    .catch(err => console.error('❌ MongoDB 连接失败:', err));

// 2. 初始化 AI 客户端
// DeepSeek 客户端 (借用 OpenAI SDK)
const deepseekClient = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

// Gemini 客户端
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); // 根据需要选择具体模型

// 3. 编写测试路由
app.get('/api/test', (req, res) => {
    res.json({ message: '交易冷静器后端运行正常！' });
});

// 测试 DeepSeek 路由
app.post('/api/v1/deepseek/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const completion = await deepseekClient.chat.completions.create({
            messages: [{ role: "user", content: prompt || "你好" }],
            model: "deepseek-chat",
        });
        res.json({ source: 'deepseek', reply: completion.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 测试 Gemini 路由
app.post('/api/v1/gemini/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const result = await geminiModel.generateContent(prompt || "你好");
        const response = await result.response;
        res.json({ source: 'gemini', reply: response.text() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. 启动服务器
const PORT = process.env.PORT || 3000;
// 真实的业务路由：情绪分析与交易阻断
app.post('/api/v1/trading/analyze', async (req, res) => {
    try {
        // 1. 接收前端传来的数据
        const { fomoScore, anxietyScore, intendedAction, aiModel = 'deepseek' } = req.body;

        // 简单校验一下必填项
        if (fomoScore === undefined || anxietyScore === undefined || !intendedAction) {
            return res.status(400).json({ error: '缺少必要的情绪参数或交易意图' });
        }

        // 2. 组装“纪律委员”的系统提示词
        const prompt = `
      你是一个冷酷无情的加密货币/股票交易纪律委员和行为心理学专家。
      当前用户的心理状态评估如下：
      - FOMO（错失恐惧）指数：${fomoScore}/100
      - 恐慌/焦虑指数：${anxietyScore}/100
      - 他试图执行的交易操作："${intendedAction}"

      请严厉地指出他现在的认知偏差，并给出是否应该立即拔掉网线暂停交易的建议。
      要求：语气严肃，直击痛点，用词精炼，总字数不超过 150 字。
    `;

        let aiAdvice = "";
        // 3. 根据前端选择，调用对应的 AI
        if (aiModel === 'gemini') {
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            aiAdvice = response.text();
        } else {
            // 默认走 DeepSeek
            const completion = await deepseekClient.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "deepseek-chat",
            });
            // 将 AI 返回的 Markdown 文本实时解析为 HTML

            aiAdvice = completion.choices[0].message.content;
        }

        // 4. 将此次“冲动记录”和“AI的劝退金句”永久保存到 MongoDB
        const savedLog = await EmotionLog.create({
            fomoScore,
            anxietyScore,
            intendedAction,
            aiAdvice,
            aiModelUsed: aiModel
        });

        // 5. 将结果返回给前端
        res.json({
            success: true,
            message: '分析完成，数据已入库',
            data: savedLog
        });

    } catch (error) {
        console.error('业务路由报错:', error);
        res.status(500).json({ error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 服务已启动: http://localhost:${PORT}`);
});
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// 1. 初始化 AI 客户端
// DeepSeek 客户端 (借用 OpenAI SDK)
const deepseekClient = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

// Gemini 客户端
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" }); 

// 2. 编写测试路由
app.get('/api/test', (req, res) => {
    res.json({ message: '交易冷静器后端运行正常！(Demo无数据库版)' });
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

// 3. 真实的业务路由：情绪分析与交易阻断
app.post('/api/v1/trading/analyze', async (req, res) => {
    try {
        const { fomoScore, anxietyScore, intendedAction, aiModel = 'deepseek' } = req.body;

        if (fomoScore === undefined || anxietyScore === undefined || !intendedAction) {
            return res.status(400).json({ error: '缺少必要的情绪参数或交易意图' });
        }

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
        
        if (aiModel === 'gemini') {
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            aiAdvice = response.text();
        } else {
            const completion = await deepseekClient.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "deepseek-chat",
            });
            aiAdvice = completion.choices[0].message.content;
        }

        // 构造虚拟的数据对象（代替之前的 MongoDB 保存逻辑）
        const mockLog = {
            _id: 'demo-id-' + Date.now(), // 伪造一个 ID 满足前端可能的数据结构要求
            fomoScore,
            anxietyScore,
            intendedAction,
            aiAdvice,
            aiModelUsed: aiModel,
            createdAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: '分析完成 (Demo版仅返回分析，不保存数据)',
            data: mockLog
        });

    } catch (error) {
        console.error('业务路由报错:', error);
        res.status(500).json({ error: error.message });
    }
});

// // 4. 启动服务器
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`🚀 服务已启动: http://localhost:${PORT}`);
// });
// 4. 启动服务器 (兼容 Vercel Serverless)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 服务已启动: http://localhost:${PORT}`);
    });
}

// 供 Vercel Serverless 函数调用
export default app;
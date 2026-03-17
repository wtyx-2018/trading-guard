import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { setGlobalDispatcher, ProxyAgent } from 'undici';
import { setDefaultResultOrder } from 'node:dns';
setDefaultResultOrder('ipv4first'); // 强制优先使用 IPv4，解决 Vercel 节点解析 Google API 超时的问题
// 1. 基础配置
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// 2. 智能环境适配 (核心修复：解决 Connection Error)
// 判断标准：Vercel 部署会自动注入 VERCEL=1 环境变量
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

if (!isVercel) {
    // 仅在本地开发环境挂载代理，确保能连上 Google/DeepSeek
    try {
        const proxyAgent = new ProxyAgent('http://127.0.0.1:7890');
        setGlobalDispatcher(proxyAgent);
        console.log('🛡️  本地模式：已启动 7890 代理穿透');
    } catch (e) {
        console.error('❌ 代理挂载失败:', e.message);
    }
} else {
    // 在 Vercel 美国机房运行时，必须直连，否则会报 500/Connection Error
    console.log('🚀 云端模式：Serverless 环境直连 API');
}

// 3. 初始化 AI 客户端
// DeepSeek 客户端 (增加 /v1 后缀提高稳定性)
const deepseekClient = new OpenAI({
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: process.env.DEEPSEEK_API_KEY
});

// Gemini 客户端
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 4. 业务路由：情绪分析与交易阻断
app.post('/api/v1/trading/analyze', async (req, res) => {
    try {
        const { fomoScore, anxietyScore, intendedAction, aiModel = 'deepseek' } = req.body;

        // 参数校验
        if (fomoScore === undefined || anxietyScore === undefined || !intendedAction) {
            return res.status(400).json({ error: '缺少必要的情绪参数或交易意图' });
        }

        const systemPrompt = `
            你是一个冷酷无情的加密货币交易纪律委员。
            当前用户状态：FOMO指数 ${fomoScore}/100，焦虑指数 ${anxietyScore}/100。
            用户意图：${intendedAction}
            请严厉指出其认知偏差，给出是否拔掉网线的建议。字数限制150字内。
        `;

        let aiAdvice = "";

        if (aiModel === 'gemini') {
            // 调用 Gemini
            const result = await geminiModel.generateContent(systemPrompt);
            const response = await result.response;
            aiAdvice = response.text();
        } else {
            // 默认调用 DeepSeek
            const completion = await deepseekClient.chat.completions.create({
                messages: [{ role: "user", content: systemPrompt }],
                model: "deepseek-chat",
            });
            aiAdvice = completion.choices[0].message.content;
        }

        // 构造返回对象 (Demo版不含数据库)
        const resultData = {
            id: 'demo_' + Date.now(),
            fomoScore,
            anxietyScore,
            intendedAction,
            aiAdvice,
            aiModelUsed: aiModel,
            timestamp: new Date().toISOString()
        };

        res.json({
            success: true,
            data: resultData
        });

    } catch (error) {
        console.error('❌ 业务报错:', error.message);
        // 返回 500 错误体，方便前端调试具体原因
        res.status(500).json({ 
            error: error.message,
            tip: "请检查 API Key 是否正确或余额是否充足"
        });
    }
});

// 5. 健康检查路由

app.get('/api/test', (req, res) => {
    res.json({ 
        status: 'ok', 
        nodeVersion: process.version, // 👈 这一行能告诉你真相
        environment: isVercel ? 'Vercel' : 'Local' 
    });
});
// 6. 启动 (非 Vercel 环境下)
if (!isVercel) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 本地后端启动: http://localhost:${PORT}`);
    });
}

// 导出 app 供 Vercel Serverless 调用
export default app;
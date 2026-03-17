# 🛑 交易冷静器 (Trading Guard) - Demo 版

<p align="center">
  <a href="#english-version">🇬🇧 Read in English</a> | 🇨🇳 中文文档
</p>

一个基于行为心理学与大语言模型（LLM）的加密货币/股票交易防冲动工具。
当 FOMO（错失恐惧）和焦虑情绪支配你的大脑时，让冷酷无情的 AI 纪律委员来强行切断你的交易冲动。

> **💡 当前为 Demo 分支说明**：
> 本分支为**无状态（Stateless）极简版**，已移除 MongoDB 数据库依赖。
> 架构轻量，前后端分离，专为一键部署至 Vercel 等 Serverless 平台而设计。

## ✨ 核心特性

- **双 AI 引擎驱动**：内置 DeepSeek（犀利毒舌）与 Gemini（严谨说理）双模型，自由切换。
- **心理学量表评估**：通过滑块直观量化当前的“贪婪指数”与“恐慌指数”。
- **实时 Markdown 渲染**：将 AI 返回的重点结论（加粗/列表）在前端进行高质量的高亮排版。
- **暗黑沉浸模式**：全量适配暗黑主题 UI，提供极佳的交易复盘视觉体验。

## 🛠️ 技术栈

- **前端**：Vue 3 (Composition API) + Vite + marked.js
- **后端**：Node.js 22 LTS + Express + 官方 AI SDK
- **网络与代理**：CORS + Undici (用于 Node.js 底层 fetch 代理穿透)

## 🚀 本地快速启动

### 1. 克隆项目
\`\`\`bash
git clone https://github.com/你的用户名/trading-guard.git
cd trading-guard
git checkout demo
\`\`\`

### 2. 后端配置与启动
进入后端目录，安装依赖：
\`\`\`bash
cd backend
npm install
\`\`\`

在 `backend` 目录下创建 `.env` 文件，并填入你的 API 密钥：
\`\`\`env
PORT=3000
DEEPSEEK_API_KEY=your_deepseek_key_here
GEMINI_API_KEY=your_gemini_key_here
\`\`\`
*(注：如本地网络无法直连 Gemini，请在 `server.js` 顶部放开 proxyAgent 代理代码)*

启动后端服务：
\`\`\`bash
npm run dev
# 终端应显示：🚀 服务已启动: http://localhost:3000
\`\`\`

### 3. 前端配置与启动
新开一个终端窗口，进入前端目录：
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
打开浏览器访问控制台输出的地址（通常为 `http://localhost:5173`），即可开始体验！

---

<br>

<h1 id="english-version">🛑 Trading Guard - Demo Version</h1>

A crypto/stock trading anti-impulse tool based on behavioral psychology and Large Language Models (LLMs). 
When FOMO (Fear Of Missing Out) and anxiety dominate your brain, let the ruthless AI Disciplinary Committee forcefully cut off your trading impulses.

> **💡 Demo Branch Note**: 
> This branch is a **stateless minimalist version**, with the MongoDB database dependency removed. 
> Featuring a lightweight architecture with separated frontend and backend, it is specifically designed for one-click deployment to Serverless platforms like Vercel.

## ✨ Core Features

- **Dual AI Engines**: Built-in DeepSeek (sharp & ruthless) and Gemini (rigorous & logical) models, switchable at will.
- **Psychological Assessment**: Intuitively quantify your current "Greed Index" and "Panic Index" via UI sliders.
- **Real-time Markdown Rendering**: High-quality highlighting and formatting of key AI takeaways (bold/lists) on the frontend.
- **Immersive Dark Mode**: Fully adapted dark theme UI, providing an excellent visual experience for trading reflection.

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API) + Vite + marked.js
- **Backend**: Node.js 22 LTS + Express + Official AI SDKs
- **Network & Proxy**: CORS + Undici (for Node.js underlying fetch proxy bypass)

## 🚀 Quick Start

### 1. Clone the Repository
\`\`\`bash
git clone https://github.com/YourUsername/trading-guard.git
cd trading-guard
git checkout demo
\`\`\`

### 2. Backend Setup & Run
Navigate to the backend directory and install dependencies:
\`\`\`bash
cd backend
npm install
\`\`\`

Create a `.env` file in the `backend` directory and insert your API keys:
\`\`\`env
PORT=3000
DEEPSEEK_API_KEY=your_deepseek_key_here
GEMINI_API_KEY=your_gemini_key_here
\`\`\`
*(Note: If your local network cannot directly access Gemini, uncomment the proxyAgent code at the top of `server.js`)*

Start the backend server:
\`\`\`bash
npm run dev
# Terminal should output: 🚀 服务已启动: http://localhost:3000
\`\`\`

### 3. Frontend Setup & Run
Open a new terminal window and navigate to the frontend directory:
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
Open your browser and visit the address output in the console (usually `http://localhost:5173`) to start experiencing it!

## 📄 License
MIT
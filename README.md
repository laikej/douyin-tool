# 抖音短视频仿写工具

## 快速启动

### 1. 安装依赖
```bash
cd douyin-script-generator
npm install
```

### 2. 启动服务
```bash
npm start
```

### 3. 访问
浏览器打开 http://localhost:3000

---

## 环境变量

| 变量 | 说明 | 是否必填 |
|------|------|---------|
| `PORT` | 服务端口，默认 3000 | 否 |
| `DY_API_KEY` | 抖音视频解析API密钥 | 否（不填则只能手动输入文案）|

---

## 视频解析说明

工具支持两种内容获取方式：

### 方式一：手动输入文案（推荐，无需配置）
- 用户直接复制视频中的口播文字粘贴到输入框
- 不依赖任何外部服务
- 适合没有视频解析API的场景

### 方式二：自动解析（需配置API）
- 接入第三方抖音视频解析服务
- 配置 `DY_API_KEY` 环境变量
- 可选服务：
  - [ddns.net](https://www.ddapi.cn/) 抖音无水印解析
  - 自建抖音解析服务
  - 其他第三方视频解析API

**注意**：自动解析需要稳定的解析服务，部分免费服务不稳定。

---

## 部署

### 本地部署
```bash
npm install
npm start
```

### 服务器部署
```bash
npm install --production
PORT=8080 npm start
```

### 使用 PM2
```bash
npm install -g pm2
pm2 start server.js --name douyin-tool
```

---

## 功能说明

1. **文案拆解** - 分析爆款视频的文案结构，识别文案类型，输出可套用模板
2. **镜头语言分析** - 分析镜头景别、运镜、节奏，输出分镜表和拍摄套路
3. **BGM推荐** - 根据内容风格推荐适合的背景音乐和节奏
4. **新脚本生成** - 基于产品信息生成新的文案脚本和分镜脚本

---

## 技术栈

- 前端：HTML/CSS/JS（纯静态，无需构建）
- 后端：Node.js + Express
- 分析引擎：纯JavaScript

---

## 目录结构

```
douyin-script-generator/
├── server.js          # Express 后端服务
├── analysis.js        # 分析引擎
├── package.json       # 项目配置
├── .env.example       # 环境变量示例
├── README.md          # 使用说明
├── SPEC.md            # 产品规格文档
└── public/
    ├── index.html     # 主页面
    └── style.css      # 样式
```

# Vercel 部署指南

## 前提准备

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```
   用 GitHub/邮箱登录都可以。

## 部署步骤

### 方式一：命令行部署（推荐）

```bash
cd C:\Users\admin\WorkBuddy\2026-05-07-task-1\douyin-script-generator

# 首次部署
vercel

# 后续更新
vercel --prod
```

按提示操作：
- Set up and deploy? → **Y**
- Which scope? → 选择你的账号
- Link to existing project? → **N**
- Project name? → 填个名字，比如 `douyin-script-generator`
- Directory? → 回车（默认当前目录）
- Override settings? → **N**

部署成功后，Vercel 会给一个 `.vercel.app` 的网址，**可以直接分享给任何人**。

### 方式二：通过 GitHub 部署（更方便，以后更新自动部署）

1. 把 `douyin-script-generator` 文件夹上传到 GitHub 仓库
2. 在 [vercel.com](https://vercel.com) 点击 "Import Project"
3. 选你的仓库，填项目名，部署

以后代码更新 push 到 GitHub，Vercel 自动重新部署。

## 部署后访问

- 正式环境：`https://你的项目名.vercel.app`
- 预览环境：每次 `vercel` 部署都会生成一个临时链接

## 本地开发

```bash
# 本地运行（原来的方式）
npm run dev

# 本地测试 Vercel 函数
vercel dev
```

## 注意事项

- API 分析功能完全正常，免费版 Vercel 的 Serverless Function 足够个人使用
- 不需要配置任何环境变量，分析引擎是纯前端规则

/**
 * 抖音短视频仿写工具 - Express 后端
 */

const express = require('express');
const path = require('path');
const { analyze } = require('./analysis');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

/**
 * POST /api/analyze
 * 主分析接口
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { videoUrl, videoContent, product } = req.body;
    
    // 验证必填字段
    if (!product || !product.category) {
      return res.status(400).json({
        success: false,
        error: '请提供完整的产品信息（至少需要品类）'
      });
    }
    
    if (!videoUrl && !videoContent) {
      return res.status(400).json({
        success: false,
        error: '请提供视频链接或视频文案内容'
      });
    }
    
    console.log(`[分析请求] URL: ${videoUrl || '无'}, 品类: ${product.category}`);
    
    // 执行分析
    const result = await analyze({
      videoUrl: videoUrl || '',
      videoContent: videoContent || '',
      product
    });
    
    console.log(`[分析完成] 品类: ${product.category}`);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('[分析错误]', error);
    res.status(500).json({
      success: false,
      error: '分析过程出现错误，请重试'
    });
  }
});

/**
 * GET /api/health
 * 健康检查
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/parse-video
 * 预留：视频解析接口
 * 实际使用时需接入第三方Douyin解析API
 */
app.post('/api/parse-video', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({
      success: false,
      error: '请提供视频链接'
    });
  }
  
  // TODO: 接入第三方解析API
  // 可选服务：
  // 1. ddns.net 解析服务
  // 2. 自建抖音API服务
  // 3. 第三方视频解析API（如videos.video123.com）
  
  const apiKey = process.env.DY_API_KEY;
  
  if (!apiKey) {
    // 没有配置API时，返回提示让用户手动输入
    return res.json({
      success: false,
      needManualInput: true,
      message: '视频自动解析服务未配置，请手动输入视频文案内容',
      hint: '复制视频中的口播文字粘贴到"视频文案"输入框中'
    });
  }
  
  try {
    // 调用解析API（示例结构）
    // const response = await fetch(`https://api.example.com/parse?url=${encodeURIComponent(url)}&key=${apiKey}`);
    // const data = await response.json();
    
    res.json({
      success: true,
      data: {
        content: '解析内容',
        title: '视频标题',
        author: '账号名'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '视频解析失败'
    });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🎬 抖音短视频仿写工具 已启动                        ║
║                                                      ║
║   本地访问:  http://localhost:${PORT}                   ║
║                                                      ║
║   提示: 视频自动解析需要配置 DY_API_KEY 环境变量      ║
║         否则请手动输入视频文案内容                    ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;

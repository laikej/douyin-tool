// Vercel Serverless Function Entry Point
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const { analyze } = require('../analysis');

app.post('/api/analyze', (req, res) => {
  try {
    const { videoUrl, videoInfo, product } = req.body;
    
    if (!videoInfo || !product) {
      return res.status(400).json({ 
        error: '缺少必要参数：videoInfo 和 product' 
      });
    }
    
    // ✅ 修正：按照 analyze 函数的要求传入一个对象
    const result = analyze({
      videoUrl: videoUrl || '',
      videoContent: videoInfo.content || videoInfo,
      product: product
    });
    
    res.json(result);
  } catch (error) {
    console.error('分析错误:', error);
    res.status(500).json({ 
      error: '分析过程中发生错误',
      message: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;

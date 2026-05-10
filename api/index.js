const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/analyze', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('*', (req, res) => {
  res.send('Hello from Vercel!');
});

module.exports = app;

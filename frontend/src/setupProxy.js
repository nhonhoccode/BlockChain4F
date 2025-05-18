const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const express = require('express');

module.exports = function(app) {
  // Proxy API requests to backend
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
  
  // Proxy static admin from Django
  app.use(
    '/static/admin',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
  
  // Handle hot-update files
  app.get('*.hot-update.json', (req, res) => {
    res.status(200).json({});
  });
  
  app.get('*.hot-update.js', (req, res) => {
    res.status(200).send('');
  });
}; 
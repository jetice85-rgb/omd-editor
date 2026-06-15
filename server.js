/**
 * OMD Editor Server
 * 提供编辑器 HTML + API 转换服务
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// 动态加载 omd-core
const omdCore = require('./omd-core-dist/index.js');

const PORT = 3456;

// MIME types
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.omd': 'text/markdown',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // API: 导出
  if (req.method === 'POST' && url.pathname.startsWith('/api/export/')) {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      try {
        const format = url.pathname.replace('/api/export/', '');
        const doc = omdCore.parse(body);
        let buf;
        
        switch (format) {
          case 'docx': buf = await omdCore.toDocx(doc); break;
          case 'xlsx': buf = await omdCore.toXlsx(doc); break;
          case 'pptx': buf = await omdCore.toPptx(doc); break;
          default: res.writeHead(400); res.end('Unknown format'); return;
        }

        const ext = '.' + format;
        const name = (doc.meta.title || '文档').replace(/[/\\?%*:|"<>]/g, '_');
        res.writeHead(200, {
          'Content-Type': MIME[ext],
          'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}${ext}"`,
        });
        res.end(buf);
      } catch (e) {
        res.writeHead(500);
        res.end('Export error: ' + e.message);
      }
    });
    return;
  }

  // API: 解析
  if (req.method === 'POST' && url.pathname === '/api/parse') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const doc = omdCore.parse(body);
        const outline = omdCore.getOutline(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ meta: doc.meta, outline }));
      } catch (e) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 默认：返回 index.html
  const filePath = path.join(__dirname, 'index.html');
  const html = fs.readFileSync(filePath, 'utf-8');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
});

server.listen(PORT, () => {
  console.log(`\n  🎯 OMD Editor 运行中: http://localhost:${PORT}\n`);
});

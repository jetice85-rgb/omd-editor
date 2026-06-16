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

  // API: MCP 代理
  if (req.method === 'POST' && url.pathname === '/api/mcp') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', async () => {
      try {
        const { tool, args } = JSON.parse(body);
        const { spawn } = require('child_process');
        const cp = spawn('node', [path.join(__dirname, 'mcp-server', 'dist', 'index.js')], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: { ...process.env, OMD_VAULT_PATH: 'E:/Hermes/Hermes/' }
        });
        let out = '', errOut = '';
        cp.stdout.on('data', d => out += d);
        cp.stderr.on('data', d => errOut += d);
        cp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '1.0', capabilities: {}, clientInfo: { name: 'editor', version: '1.0' } } }) + '\n');
        await new Promise(r => setTimeout(r, 300));
        cp.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
        await new Promise(r => setTimeout(r, 200));
        cp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: tool, arguments: args || {} } }) + '\n');
        await new Promise(r => setTimeout(r, 1000));
        cp.stdin.end();
        await new Promise(r => setTimeout(r, 500));
        cp.kill();
        // 解析最后一条 JSON 响应
        var lines = out.split('\n').filter(l => l.trim());
        var result = null;
        for (var i = lines.length - 1; i >= 0; i--) {
          try { var p = JSON.parse(lines[i]); if (p.id === 2) { result = p.result; break; } } catch (e) {}
        }
        if (result) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } else {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'MCP call failed', stderr: errOut }));
        }
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

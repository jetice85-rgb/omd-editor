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

// MCP Vault 直接实现（不依赖子进程）
function handleMCP(tool, args, vaultPath) {
  const YAML_RE = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  function parseFrontMatter(raw) {
    var m = raw.match(YAML_RE);
    if (!m) return { frontMatter: {}, body: raw };
    try {
      var parsed = require('js-yaml').load(m[1]);
      return { frontMatter: (typeof parsed === 'object' && parsed !== null) ? parsed : {}, body: raw.slice(m[0].length) };
    } catch (e) { return { frontMatter: {}, body: raw.slice(m[0].length) }; }
  }
  function walkFiles(dir, pattern, fn) {
    if (!fs.existsSync(dir)) return;
    var entries = fs.readdirSync(dir, { withFileTypes: true });
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i], full = path.join(dir, e.name);
      if (e.isDirectory()) walkFiles(full, pattern, fn);
      else if (e.isFile() && new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$', 'i').test(e.name)) fn(full);
    }
  }

  switch (tool) {
    case 'omd_list': {
      var dir = args.dir || '', subdir = path.resolve(vaultPath, dir);
      var vaultResolved = path.resolve(vaultPath);
      if (!subdir.startsWith(vaultResolved + path.sep) && subdir !== vaultResolved) return { error: 'Path denied' };
      if (!fs.existsSync(subdir)) return { dir: dir, files: [], count: 0 };
      var files = [];
      walkFiles(subdir, args.pattern || '*.md', function (fp) {
        var stat = fs.statSync(fp);
        var rel = path.relative(vaultPath, fp).replace(/\\/g, '/');
        var title = path.basename(fp, path.extname(fp));
        try {
          var raw = fs.readFileSync(fp, 'utf-8');
          var fm = parseFrontMatter(raw).frontMatter;
          title = fm.title || title;
        } catch (e) {}
        files.push({ path: rel, title: title, size: stat.size, modified: stat.mtime.toISOString() });
      });
      files.sort(function (a, b) { return a.path.localeCompare(b.path); });
      return { dir: dir, files: files, count: files.length };
    }
    case 'omd_read': {
      var fp = path.resolve(vaultPath, args.path);
      var vaultRes = path.resolve(vaultPath);
      if (!fp.startsWith(vaultRes + path.sep) && fp !== vaultRes) return { error: 'Path denied' };
      var raw;
      try { raw = fs.readFileSync(fp, 'utf-8'); } catch (e) { return { error: 'File not found: ' + args.path }; }
      var parsed = parseFrontMatter(raw);
      var stats = { chars: raw.length, lines: raw.split('\n').length };
      var title = parsed.frontMatter.title || path.basename(args.path, path.extname(args.path));
      var fmt = args.format || 'full';
      if (fmt === 'meta') return { path: args.path, title: title, meta: parsed.frontMatter, stats: stats };
      if (fmt === 'body') return { path: args.path, title: title, body: parsed.body, stats: stats };
      return { path: args.path, title: title, meta: parsed.frontMatter, body: parsed.body, stats: stats };
    }
    case 'omd_write': {
      var wfp = path.resolve(vaultPath, args.path);
      var wVault = path.resolve(vaultPath);
      if (!wfp.startsWith(wVault + path.sep) && wfp !== wVault) return { error: 'Path denied' };
      var content = args.content;
      var dirPath = path.dirname(wfp);
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      fs.writeFileSync(wfp, content, 'utf-8');
      return { path: args.path, written: true, stats: { chars: content.length, lines: content.split('\n').length } };
    }
    case 'omd_search': {
      var query = args.query || '';
      var results = [];
      walkFiles(vaultPath, '*.md', function (fp) {
        var raw;
        try { raw = fs.readFileSync(fp, 'utf-8'); } catch (e) { return; }
        if (raw.toLowerCase().indexOf(query.toLowerCase()) === -1) return;
        var rel = path.relative(vaultPath, fp).replace(/\\/g, '/');
        var parsed = parseFrontMatter(raw);
        var title = parsed.frontMatter.title || path.basename(fp, path.extname(fp));
        var idx = raw.toLowerCase().indexOf(query.toLowerCase());
        var start = Math.max(0, idx - 50), end = Math.min(raw.length, idx + query.length + 50);
        var snippet = (start > 0 ? '...' : '') + raw.slice(start, end).replace(/\n/g, ' ') + (end < raw.length ? '...' : '');
        results.push({ path: rel, title: title, snippet: snippet, score: 1 });
      });
      return { query: query, count: results.length, results: results.slice(0, args.limit || 10) };
    }
    default: return { error: 'Unknown tool: ' + tool };
  }
}

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

  // API: MCP 代理 — 直接操作 Vault 文件系统
  if (req.method === 'POST' && url.pathname === '/api/mcp') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const { tool, args } = JSON.parse(body);
        const vaultPath = process.env.OMD_VAULT_PATH || 'E:/Hermes/Hermes/';
        const result = handleMCP(tool, args || {}, vaultPath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
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

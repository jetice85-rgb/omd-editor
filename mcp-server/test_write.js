const { spawn } = require('child_process');

const server = spawn('node', ['dist/index.js'], {
  cwd: 'E:/Hermes/projects/omd-editor/mcp-server',
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, OMD_VAULT_PATH: 'E:/Hermes/Hermes/' }
});

let buffer = '';
server.stdout.on('data', (d) => { buffer += d.toString(); });

function send(method, params = {}) {
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) + '\n');
}

function waitForResponse(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
    const check = () => {
      for (const line of buffer.split('\n').filter(l => l.trim())) {
        try {
          const p = JSON.parse(line);
          if (p.id !== undefined && (p.result || p.error)) { clearTimeout(timer); resolve(p); return; }
        } catch {}
      }
      setTimeout(check, 200);
    };
    check();
  });
}

async function test(name, method, params) {
  buffer = '';
  send(method, params);
  try {
    const result = await waitForResponse(8000);
    if (result.error) { console.log(`❌ ${name}: ${JSON.stringify(result.error)}`); return null; }
    const text = result.result.content?.[0]?.text || JSON.stringify(result.result);
    const data = JSON.parse(text);
    console.log(`✅ ${name}`);
    console.log(`   ${JSON.stringify(data).slice(0, 300)}`);
    return data;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
    return null;
  }
}

async function run() {
  await new Promise(r => setTimeout(r, 1000));
  buffer = '';
  send('initialize', { protocolVersion: '1.0', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } });
  await waitForResponse(3000);
  server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
  await new Promise(r => setTimeout(r, 500));

  // Test write
  await test('omd_write', 'tools/call', {
    name: 'omd_write',
    arguments: { path: '_test_mcp.md', content: '# 测试文档\n\nMCP 写入测试。', mode: 'markdown' }
  });

  // Test read back
  await test('omd_read (write verify)', 'tools/call', {
    name: 'omd_read',
    arguments: { path: '_test_mcp.md', format: 'full' }
  });

  console.log('\n--- 完成 ---');
  server.kill();
  process.exit(0);
}

run();

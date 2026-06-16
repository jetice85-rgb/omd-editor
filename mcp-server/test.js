/**
 * MCP Server 快速验证脚本
 * 通过 stdio 发送 JSON-RPC 请求，验证 5 个 tool
 */
const { spawn } = require('child_process');

const server = spawn('node', ['dist/index.js'], {
  cwd: 'E:/Hermes/projects/omd-editor/mcp-server',
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, OMD_VAULT_PATH: 'E:/Hermes/Hermes/' }
});

let buffer = '';
server.stdout.on('data', (d) => { buffer += d.toString(); });

function send(method, params = {}) {
  const msg = JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }) + '\n';
  server.stdin.write(msg);
}

function waitForResponse(timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
    const check = () => {
      const lines = buffer.split('\n').filter(l => l.trim());
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.id !== undefined && parsed.result !== undefined) {
            clearTimeout(timer);
            resolve(parsed.result);
            return;
          }
          if (parsed.error) {
            clearTimeout(timer);
            reject(new Error(JSON.stringify(parsed.error)));
            return;
          }
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
    const text = result.content?.[0]?.text || JSON.stringify(result);
    const data = JSON.parse(text);
    console.log(`✅ ${name}`);
    console.log(`   ${JSON.stringify(data).slice(0, 200)}`);
    return data;
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
    return null;
  }
}

async function run() {
  // Wait for server init
  await new Promise(r => setTimeout(r, 1000));

  // Initialize MCP
  buffer = '';
  send('initialize', { protocolVersion: '1.0', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } });
  await waitForResponse(3000);
  console.log('✅ initialize');

  // Send initialized notification
  const notif = JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n';
  server.stdin.write(notif);
  await new Promise(r => setTimeout(r, 500));

  // Test 1: omd_list
  await test('omd_list', 'tools/call', { name: 'omd_list', arguments: {} });

  // Test 2: omd_read
  await test('omd_read', 'tools/call', { name: 'omd_read', arguments: { path: '01-OMD-是什么.md', format: 'meta' } });

  // Test 3: omd_search
  await test('omd_search', 'tools/call', { name: 'omd_search', arguments: { query: '智慧生而共通', limit: 3 } });

  // Test 4: omd_graph
  await test('omd_graph', 'tools/call', { name: 'omd_graph', arguments: {} });

  console.log('\n--- 全部测试完成 ---');
  server.kill();
  process.exit(0);
}

run();

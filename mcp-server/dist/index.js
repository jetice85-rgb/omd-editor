#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const omd_read_1 = require("./tools/omd_read");
const omd_search_1 = require("./tools/omd_search");
const omd_write_1 = require("./tools/omd_write");
const omd_list_1 = require("./tools/omd_list");
const omd_graph_1 = require("./tools/omd_graph");
const tools = [
    omd_read_1.omdReadTool,
    omd_search_1.omdSearchTool,
    omd_write_1.omdWriteTool,
    omd_list_1.omdListTool,
    omd_graph_1.omdGraphTool,
];
const toolMap = new Map(tools.map((t) => [t.name, t]));
const server = new index_js_1.Server({ name: "omd-mcp-server", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
    tools: tools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
    })),
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = toolMap.get(name);
    if (!tool) {
        return {
            content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
            isError: true,
        };
    }
    try {
        return await tool.handler((args ?? {}));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
            content: [{ type: "text", text: JSON.stringify({ error: message }) }],
            isError: true,
        };
    }
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("OMD MCP Server running on stdio");
}
main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
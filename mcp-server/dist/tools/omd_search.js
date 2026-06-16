"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omdSearchTool = void 0;
const utils_1 = require("../utils");
const inputSchema = {
    type: "object",
    properties: {
        query: { type: "string", description: "Search query string" },
        limit: { type: "number", default: 10, description: "Max number of results" },
    },
    required: ["query"],
};
exports.omdSearchTool = {
    name: "omd_search",
    description: "Full-text search across all .md/.omd files in the OMD vault. Returns matching files with context snippets.",
    inputSchema,
    handler: async (args) => {
        const vault = (0, utils_1.getVaultPath)();
        const limit = args.limit || 10;
        const files = (0, utils_1.walkFilesArray)(vault, "*.md");
        const results = [];
        for (const filePath of files) {
            const raw = (0, utils_1.readFileSafe)(filePath);
            if (!raw)
                continue;
            const lower = raw.toLowerCase();
            const qLower = args.query.toLowerCase();
            if (!lower.includes(qLower))
                continue;
            const parsed = (0, utils_1.parseOMD)(raw);
            const relativePath = (0, utils_1.toRelativePath)(filePath);
            const title = (0, utils_1.extractTitle)(parsed.frontMatter, relativePath);
            const snippet = (0, utils_1.snippetAround)(raw, args.query, 50);
            const score = (0, utils_1.scoreMatch)(raw, args.query);
            results.push({ path: relativePath, title, snippet, score });
        }
        results.sort((a, b) => b.score - a.score);
        const top = results.slice(0, limit);
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ query: args.query, count: top.length, results: top }, null, 2),
                }],
        };
    },
};
//# sourceMappingURL=omd_search.js.map
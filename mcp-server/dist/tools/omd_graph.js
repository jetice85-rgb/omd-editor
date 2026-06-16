"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omdGraphTool = void 0;
const utils_1 = require("../utils");
const inputSchema = {
    type: "object",
    properties: {},
};
exports.omdGraphTool = {
    name: "omd_graph",
    description: "Build a knowledge graph from the OMD vault — extracts tags and [[wikilinks]] from all files.",
    inputSchema,
    handler: async () => {
        const vault = (0, utils_1.getVaultPath)();
        const files = (0, utils_1.walkFilesArray)(vault, "*.md");
        const nodes = [];
        const edgeSet = new Set();
        const edges = [];
        for (const filePath of files) {
            const raw = (0, utils_1.readFileSafe)(filePath);
            if (!raw)
                continue;
            const parsed = (0, utils_1.parseOMD)(raw);
            const relativePath = (0, utils_1.toRelativePath)(filePath);
            const title = (0, utils_1.extractTitle)(parsed.frontMatter, relativePath);
            const tags = (0, utils_1.extractTags)(raw);
            const links = (0, utils_1.extractWikilinks)(raw);
            nodes.push({ path: relativePath, title, tags });
            for (const tag of tags) {
                const key = `${relativePath}->tag:${tag}`;
                if (!edgeSet.has(key)) {
                    edgeSet.add(key);
                    edges.push({ from: relativePath, to: `#${tag}`, type: "tag" });
                }
            }
            for (const link of links) {
                const key = `${relativePath}->link:${link}`;
                if (!edgeSet.has(key)) {
                    edgeSet.add(key);
                    edges.push({ from: relativePath, to: link, type: "link" });
                }
            }
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ nodes, edges }, null, 2),
                }],
        };
    },
};
//# sourceMappingURL=omd_graph.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.omdReadTool = void 0;
const utils_1 = require("../utils");
const inputSchema = {
    type: "object",
    properties: {
        path: { type: "string", description: "File path relative to vault root" },
        format: {
            type: "string",
            enum: ["full", "body", "meta"],
            default: "full",
            description: "Return format: full (entire OMD), body (markdown only), meta (YAML frontmatter only)",
        },
    },
    required: ["path"],
};
exports.omdReadTool = {
    name: "omd_read",
    description: "Read a .md/.omd file from the OMD vault. Returns full OMD, body-only, or metadata-only.",
    inputSchema,
    handler: async (args) => {
        const filePath = (0, utils_1.resolvePath)(args.path);
        const raw = (0, utils_1.readFileSafe)(filePath);
        if (raw === null) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: `File not found: ${args.path}` }) }],
            };
        }
        const format = args.format || "full";
        const parsed = (0, utils_1.parseOMD)(raw);
        const stats = { chars: raw.length, lines: raw.split("\n").length };
        const title = (0, utils_1.extractTitle)(parsed.frontMatter, args.path);
        if (format === "meta") {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({ path: args.path, title, meta: parsed.frontMatter, stats }, null, 2),
                    }],
            };
        }
        if (format === "body") {
            return {
                content: [{
                        type: "text",
                        text: JSON.stringify({ path: args.path, title, body: parsed.body, stats }, null, 2),
                    }],
            };
        }
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        path: args.path,
                        title,
                        meta: parsed.frontMatter,
                        body: parsed.body,
                        render: null,
                        stats,
                    }, null, 2),
                }],
        };
    },
};
//# sourceMappingURL=omd_read.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.omdWriteTool = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("../utils");
const inputSchema = {
    type: "object",
    properties: {
        path: { type: "string", description: "File path relative to vault root" },
        content: { type: "string", description: "File content to write" },
        mode: {
            type: "string",
            enum: ["omd", "markdown"],
            default: "omd",
            description: "omd: content is full OMD; markdown: content is markdown body, auto-generate frontmatter/OMD tail",
        },
    },
    required: ["path", "content"],
};
exports.omdWriteTool = {
    name: "omd_write",
    description: "Create or update a file in the OMD vault. Supports OMD and plain Markdown modes.",
    inputSchema,
    handler: async (args) => {
        const filePath = (0, utils_1.resolvePath)(args.path);
        const mode = args.mode || "omd";
        let finalContent;
        if (mode === "markdown") {
            const basename = path.basename(args.path, path.extname(args.path));
            const now = new Date().toISOString().replace("T", " ").slice(0, 19);
            const header = `---\ntitle: ${basename}\ndate: ${now}\n---\n`;
            const tail = `\n<!--OMD\ncreated: ${now}\nmodified: ${now}\n-->`;
            finalContent = header + args.content + tail;
        }
        else {
            finalContent = args.content;
        }
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, finalContent, "utf-8");
        const stats = { chars: finalContent.length, lines: finalContent.split("\n").length };
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ path: args.path, written: true, stats }, null, 2),
                }],
        };
    },
};
//# sourceMappingURL=omd_write.js.map
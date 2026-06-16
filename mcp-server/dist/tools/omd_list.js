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
exports.omdListTool = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const utils_1 = require("../utils");
const inputSchema = {
    type: "object",
    properties: {
        dir: { type: "string", default: "", description: "Subdirectory within vault (empty for root)" },
        pattern: { type: "string", default: "*.md", description: "File match pattern (glob-style, e.g. *.md)" },
    },
};
exports.omdListTool = {
    name: "omd_list",
    description: "List files in the OMD vault directory. Returns title, size, and modification time for each file.",
    inputSchema,
    handler: async (args) => {
        const vault = (0, utils_1.getVaultPath)();
        const subdir = args.dir || "";
        const pattern = args.pattern || "*.md";
        const targetDir = path.resolve(vault, subdir);
        const vaultResolved = path.resolve(vault);
        if (!targetDir.startsWith(vaultResolved + path.sep) && targetDir !== vaultResolved) {
            return {
                content: [{ type: "text", text: JSON.stringify({ error: "Path traversal denied" }) }],
            };
        }
        if (!fs.existsSync(targetDir)) {
            return {
                content: [{ type: "text", text: JSON.stringify({ dir: subdir, files: [], count: 0 }) }],
            };
        }
        const entries = [];
        (0, utils_1.walkFiles)(targetDir, pattern, (filePath) => {
            const stat = fs.statSync(filePath);
            const relativePath = (0, utils_1.toRelativePath)(filePath);
            let title = path.basename(filePath, path.extname(filePath));
            const raw = (0, utils_1.readFileSafe)(filePath);
            if (raw) {
                const { frontMatter } = (0, utils_1.parseFrontMatter)(raw);
                title = (0, utils_1.extractTitle)(frontMatter, relativePath);
            }
            entries.push({
                path: relativePath,
                title,
                size: stat.size,
                modified: stat.mtime.toISOString(),
            });
        });
        entries.sort((a, b) => a.path.localeCompare(b.path));
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({ dir: subdir, files: entries, count: entries.length }, null, 2),
                }],
        };
    },
};
//# sourceMappingURL=omd_list.js.map
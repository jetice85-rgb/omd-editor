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
exports.getVaultPath = getVaultPath;
exports.toRelativePath = toRelativePath;
exports.resolvePath = resolvePath;
exports.parseFrontMatter = parseFrontMatter;
exports.parseOMD = parseOMD;
exports.extractWikilinks = extractWikilinks;
exports.extractTags = extractTags;
exports.extractTitle = extractTitle;
exports.walkFiles = walkFiles;
exports.walkFilesArray = walkFilesArray;
exports.snippetAround = snippetAround;
exports.scoreMatch = scoreMatch;
exports.readFileSafe = readFileSafe;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const yaml = __importStar(require("js-yaml"));
const YAML_RE = /^---\s*\n([\s\S]*?)\n---\s*\n/;
const OMD_TAIL_RE = /<!--OMD[\s\S]*?-->\s*$/;
const WIKILINK_RE = /\[\[([^\]|#]+)(?:[^\]\]]*)?\]\]/g;
const TAG_RE = /(?<!\w)#([一-鿿\wÀ-ɏḀ-ỿⰀ-ⱟ꜠-ꟿﬀ-ﬆ][一-鿿\wÀ-ɏḀ-ỿⰀ-ⱟ꜠-ꟿﬀ-ﬆ-]*)/g;
function getVaultPath() {
    return process.env.OMD_VAULT_PATH || "E:/Hermes/Hermes/";
}
/** 将绝对路径转为相对于 vault 的相对路径（统一用 /） */
function toRelativePath(absolutePath) {
    const vault = path.resolve(getVaultPath());
    const rel = path.relative(vault, absolutePath);
    return rel.replace(/\\/g, "/");
}
function resolvePath(relativePath) {
    const vault = path.resolve(getVaultPath());
    const resolved = path.resolve(vault, relativePath);
    // 加路径分隔符防止前缀匹配绕过（E:\Hermes\Hermes2 不应匹配 E:\Hermes\Hermes）
    if (!resolved.startsWith(path.resolve(vault) + path.sep) && resolved !== path.resolve(vault)) {
        throw new Error(`Path traversal denied: ${relativePath}`);
    }
    return resolved;
}
function parseFrontMatter(raw) {
    const match = raw.match(YAML_RE);
    if (!match) {
        return { frontMatter: {}, body: raw };
    }
    try {
        const parsed = yaml.load(match[1]);
        const fm = typeof parsed === "object" && parsed !== null ? parsed : {};
        return { frontMatter: fm, body: raw.slice(match[0].length) };
    }
    catch {
        return { frontMatter: {}, body: raw.slice(match[0].length) };
    }
}
function parseOMD(raw) {
    const tailMatch = raw.match(OMD_TAIL_RE);
    const omdTail = tailMatch ? tailMatch[0] : null;
    const withoutTail = tailMatch ? raw.slice(0, tailMatch.index) : raw;
    const { frontMatter, body } = parseFrontMatter(withoutTail);
    return { raw, frontMatter, body, omdTail };
}
function extractWikilinks(text) {
    const links = new Set();
    let match;
    const re = new RegExp(WIKILINK_RE.source, "g");
    while ((match = re.exec(text)) !== null) {
        links.add(match[1].trim());
    }
    return [...links];
}
function extractTags(text) {
    const tags = new Set();
    let match;
    const re = new RegExp(TAG_RE.source, "g");
    while ((match = re.exec(text)) !== null) {
        tags.add(match[1]);
    }
    return [...tags];
}
function extractTitle(frontMatter, filePath) {
    return frontMatter.title || path.basename(filePath, path.extname(filePath));
}
function walkFiles(dir, pattern, fn) {
    if (!fs.existsSync(dir))
        return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkFiles(full, pattern, fn);
        }
        else if (entry.isFile() && matchPattern(entry.name, pattern)) {
            fn(full);
        }
    }
}
function walkFilesArray(dir, pattern) {
    const files = [];
    walkFiles(dir, pattern, (f) => files.push(f));
    return files;
}
function matchPattern(filename, pattern) {
    const re = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$", "i");
    return re.test(filename);
}
function snippetAround(text, query, contextLen = 50) {
    const lower = text.toLowerCase();
    const qLower = query.toLowerCase();
    const idx = lower.indexOf(qLower);
    if (idx === -1)
        return text.slice(0, contextLen * 2);
    const start = Math.max(0, idx - contextLen);
    const end = Math.min(text.length, idx + query.length + contextLen);
    let snippet = text.slice(start, end);
    if (start > 0)
        snippet = "..." + snippet;
    if (end < text.length)
        snippet = snippet + "...";
    return snippet;
}
function scoreMatch(text, query) {
    const lower = text.toLowerCase();
    const qLower = query.toLowerCase();
    let score = 0;
    let pos = 0;
    while ((pos = lower.indexOf(qLower, pos)) !== -1) {
        score += 1;
        pos += qLower.length;
    }
    if (lower.startsWith(qLower))
        score += 2;
    return score;
}
function readFileSafe(filePath) {
    try {
        return fs.readFileSync(filePath, "utf-8");
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=utils.js.map
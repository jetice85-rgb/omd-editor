"use strict";
/**
 * OMD 解析器
 * omd 字符串 → OMDDocument
 */
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
exports.parse = parse;
exports.fromMarkdown = fromMarkdown;
exports.toMarkdown = toMarkdown;
const yaml = __importStar(require("js-yaml"));
/**
 * Parses an OMD document string into structured metadata, body content, and
 * optional render configuration.
 *
 * @param omdString - The raw OMD document source.
 * @returns The parsed OMD document.
 */
function parse(omdString) {
    const trimmed = omdString.trimStart();
    // 1. 提取头部 YAML（语义元数据）
    const headerMatch = trimmed.match(/^---\n([\s\S]*?)\n---\n/);
    let meta = { title: '' };
    let rest = trimmed;
    if (headerMatch) {
        try {
            const parsed = yaml.load(headerMatch[1]);
            meta = {
                title: String(parsed.title || ''),
                author: parsed.author ? String(parsed.author) : undefined,
                created: parsed.created ? String(parsed.created) : undefined,
                modified: parsed.modified ? String(parsed.modified) : undefined,
                tags: Array.isArray(parsed.tags) ? parsed.tags.map(String) : undefined,
                status: parsed.status ? String(parsed.status) : undefined,
                template: parsed.template ? String(parsed.template) : undefined,
                version: parsed.version ? String(parsed.version) : undefined,
                formulas: parsed.formulas,
                relations: parsed.relations,
                references: Array.isArray(parsed.references)
                    ? parsed.references.map(String)
                    : undefined,
            };
        }
        catch {
            // YAML 解析失败，使用默认值
        }
        rest = trimmed.slice(headerMatch[0].length);
    }
    // 2. 提取尾部 <!--OMD-->（呈现元数据）
    const renderMatch = rest.match(/<!--OMD\n?([\s\S]*?)\n?-->/);
    let render;
    let body = rest;
    if (renderMatch) {
        try {
            render = yaml.load(renderMatch[1]);
        }
        catch {
            // 尾部 YAML 解析失败，忽略
        }
        body = rest.slice(0, renderMatch.index).trim();
    }
    else {
        body = rest.trim();
    }
    return { meta, body, render };
}
/**
 * 纯 MD 字符串 → OMD（自动补充头部尾部）
 */
function fromMarkdown(md, title) {
    const t = title || (md.match(/^# (.+)$/m)?.[1] || '');
    return `---\ntitle: "${t}"\n---\n\n${md.trim()}\n\n<!--OMD\n-->\n`;
}
/**
 * OMD 字符串 → 纯 MD（去掉头部尾部）
 */
function toMarkdown(omd) {
    const doc = parse(omd);
    return doc.body;
}

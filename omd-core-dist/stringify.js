"use strict";
/**
 * OMD 序列化器
 * OMDDocument → omd 字符串
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
exports.stringify = stringify;
const yaml = __importStar(require("js-yaml"));
/**
 * 结构化文档 → .omd 文件字符串
 */
function stringify(doc) {
    const parts = [];
    // 头部 YAML（语义元数据）
    const meta = { title: doc.meta.title };
    if (doc.meta.author)
        meta.author = doc.meta.author;
    if (doc.meta.created)
        meta.created = doc.meta.created;
    if (doc.meta.modified)
        meta.modified = doc.meta.modified;
    if (doc.meta.tags?.length)
        meta.tags = doc.meta.tags;
    if (doc.meta.status)
        meta.status = doc.meta.status;
    if (doc.meta.template)
        meta.template = doc.meta.template;
    if (doc.meta.version)
        meta.version = doc.meta.version;
    if (doc.meta.formulas && Object.keys(doc.meta.formulas).length)
        meta.formulas = doc.meta.formulas;
    if (doc.meta.relations?.length)
        meta.relations = doc.meta.relations;
    if (doc.meta.references?.length)
        meta.references = doc.meta.references;
    parts.push('---');
    parts.push(yaml.dump(meta, { lineWidth: -1, noCompatMode: true }).trim());
    parts.push('---');
    parts.push('');
    parts.push(doc.body.trim());
    parts.push('');
    // 尾部 <!--OMD-->（呈现元数据）
    if (doc.render && Object.keys(doc.render).length > 0) {
        parts.push('<!--OMD');
        parts.push(yaml.dump(doc.render, { lineWidth: -1, noCompatMode: true }).trim());
        parts.push('-->');
    }
    else {
        parts.push('<!--OMD');
        parts.push('-->');
    }
    return parts.join('\n') + '\n';
}

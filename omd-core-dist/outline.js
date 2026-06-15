"use strict";
/**
 * 提纲提取器
 * 从 .omd 字符串中提取标题层级树
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutline = getOutline;
exports.outlineToText = outlineToText;
const parse_js_1 = require("./parse.js");
/**
 * 获取 .omd 文件的提纲
 */
function getOutline(omdString) {
    const doc = (0, parse_js_1.parse)(omdString);
    const lines = doc.body.split('\n');
    const nodes = [];
    const stack = [];
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
        if (!match)
            continue;
        const level = match[1].length;
        const text = match[2].trim();
        const node = { level, text, line: i + 1, children: [] };
        // 找到合适的父级
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }
        if (stack.length === 0) {
            nodes.push(node);
        }
        else {
            stack[stack.length - 1].children.push(node);
        }
        stack.push(node);
    }
    return nodes;
}
/**
 * 将提纲扁平化为带缩进的文本
 */
function outlineToText(outline, indent = 0) {
    let result = '';
    for (const node of outline) {
        result += '  '.repeat(indent) + `${node.level}. ${node.text}\n`;
        result += outlineToText(node.children, indent + 1);
    }
    return result;
}

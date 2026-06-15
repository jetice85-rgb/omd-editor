/**
 * 提纲提取器
 * 从 .omd 字符串中提取标题层级树
 */
import type { OutlineNode } from './types.js';
/**
 * 获取 .omd 文件的提纲
 */
export declare function getOutline(omdString: string): OutlineNode[];
/**
 * 将提纲扁平化为带缩进的文本
 */
export declare function outlineToText(outline: OutlineNode[], indent?: number): string;

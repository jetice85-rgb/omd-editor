/**
 * OMD 序列化器
 * OMDDocument → omd 字符串
 */
import type { OMDDocument } from './types.js';
/**
 * 结构化文档 → .omd 文件字符串
 */
export declare function stringify(doc: OMDDocument): string;

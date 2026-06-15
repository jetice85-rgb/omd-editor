/**
 * OMD 解析器
 * omd 字符串 → OMDDocument
 */
import type { OMDDocument } from './types.js';
/**
 * Parses an OMD document string into structured metadata, body content, and
 * optional render configuration.
 *
 * @param omdString - The raw OMD document source.
 * @returns The parsed OMD document.
 */
export declare function parse(omdString: string): OMDDocument;
/**
 * 纯 MD 字符串 → OMD（自动补充头部尾部）
 */
export declare function fromMarkdown(md: string, title?: string): string;
/**
 * OMD 字符串 → 纯 MD（去掉头部尾部）
 */
export declare function toMarkdown(omd: string): string;

/**
 * OMD → DOCX 转换器
 * 将 OMD 结构化文档转为 Word (.docx) Buffer
 */
import type { OMDDocument } from './types.js';
/**
 * 将 OMD 文档转为 docx Buffer
 */
export declare function toDocx(doc: OMDDocument): Promise<Buffer>;
/**
 * OMD 字符串直接转 docx Buffer
 */
export declare function omdToDocx(omdString: string): Promise<Buffer>;

/**
 * OMD → PPTX 转换器
 * 将 OMD 文档按 ---slide--- 分页转为 PowerPoint (.pptx) Buffer
 */
import type { OMDDocument } from './types.js';
/**
 * OMD 文档 → pptx Buffer
 */
export declare function toPptx(doc: OMDDocument): Promise<Buffer>;
/**
 * OMD 字符串直接转 pptx Buffer
 */
export declare function omdToPptx(omdString: string): Promise<Buffer>;

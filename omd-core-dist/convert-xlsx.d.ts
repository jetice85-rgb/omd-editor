/**
 * OMD → XLSX 转换器
 * 提取 OMD 中的表格和公式，生成 Excel (.xlsx) Buffer
 */
import type { OMDDocument } from './types.js';
/**
 * OMD 文档 → xlsx Buffer
 */
export declare function toXlsx(doc: OMDDocument): Promise<Buffer>;
/**
 * OMD 字符串直接转 xlsx Buffer
 */
export declare function omdToXlsx(omdString: string): Promise<Buffer>;

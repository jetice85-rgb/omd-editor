/**
 * OMD 格式校验器
 */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
/**
 * 验证 .omd 字符串是否符合规范
 */
export declare function validate(omdString: string): ValidationResult;

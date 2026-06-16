export declare function getVaultPath(): string;
/** 将绝对路径转为相对于 vault 的相对路径（统一用 /） */
export declare function toRelativePath(absolutePath: string): string;
export declare function resolvePath(relativePath: string): string;
export interface FrontMatter {
    title?: string;
    author?: string;
    tags?: string[];
    [key: string]: unknown;
}
export interface ParsedOMD {
    raw: string;
    frontMatter: FrontMatter;
    body: string;
    omdTail: string | null;
}
export declare function parseFrontMatter(raw: string): {
    frontMatter: FrontMatter;
    body: string;
};
export declare function parseOMD(raw: string): ParsedOMD;
export declare function extractWikilinks(text: string): string[];
export declare function extractTags(text: string): string[];
export declare function extractTitle(frontMatter: FrontMatter, filePath: string): string;
export declare function walkFiles(dir: string, pattern: string, fn: (filePath: string) => void): void;
export declare function walkFilesArray(dir: string, pattern: string): string[];
export declare function snippetAround(text: string, query: string, contextLen?: number): string;
export declare function scoreMatch(text: string, query: string): number;
export declare function readFileSafe(filePath: string): string | null;

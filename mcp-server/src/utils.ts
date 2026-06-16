import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

const YAML_RE = /^---\s*\n([\s\S]*?)\n---\s*\n/;
const OMD_TAIL_RE = /<!--OMD[\s\S]*?-->\s*$/;
const WIKILINK_RE = /\[\[([^\]|#]+)(?:[^\]\]]*)?\]\]/g;
const TAG_RE = /(?<!\w)#([一-鿿\wÀ-ɏḀ-ỿⰀ-ⱟ꜠-ꟿﬀ-ﬆ][一-鿿\wÀ-ɏḀ-ỿⰀ-ⱟ꜠-ꟿﬀ-ﬆ-]*)/g;

export function getVaultPath(): string {
  return process.env.OMD_VAULT_PATH || "E:/Hermes/Hermes/";
}

/** 将绝对路径转为相对于 vault 的相对路径（统一用 /） */
export function toRelativePath(absolutePath: string): string {
  const vault = path.resolve(getVaultPath());
  const rel = path.relative(vault, absolutePath);
  return rel.replace(/\\/g, "/");
}

export function resolvePath(relativePath: string): string {
  const vault = path.resolve(getVaultPath());
  const resolved = path.resolve(vault, relativePath);
  // 加路径分隔符防止前缀匹配绕过（E:\Hermes\Hermes2 不应匹配 E:\Hermes\Hermes）
  if (!resolved.startsWith(path.resolve(vault) + path.sep) && resolved !== path.resolve(vault)) {
    throw new Error(`Path traversal denied: ${relativePath}`);
  }
  return resolved;
}

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

export function parseFrontMatter(raw: string): { frontMatter: FrontMatter; body: string } {
  const match = raw.match(YAML_RE);
  if (!match) {
    return { frontMatter: {}, body: raw };
  }
  try {
    const parsed = yaml.load(match[1]);
    const fm: FrontMatter = typeof parsed === "object" && parsed !== null ? parsed as FrontMatter : {};
    return { frontMatter: fm, body: raw.slice(match[0].length) };
  } catch {
    return { frontMatter: {}, body: raw.slice(match[0].length) };
  }
}

export function parseOMD(raw: string): ParsedOMD {
  const tailMatch = raw.match(OMD_TAIL_RE);
  const omdTail = tailMatch ? tailMatch[0] : null;
  const withoutTail = tailMatch ? raw.slice(0, tailMatch.index) : raw;
  const { frontMatter, body } = parseFrontMatter(withoutTail);
  return { raw, frontMatter, body, omdTail };
}

export function extractWikilinks(text: string): string[] {
  const links = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(WIKILINK_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    links.add(match[1].trim());
  }
  return [...links];
}

export function extractTags(text: string): string[] {
  const tags = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(TAG_RE.source, "g");
  while ((match = re.exec(text)) !== null) {
    tags.add(match[1]);
  }
  return [...tags];
}

export function extractTitle(frontMatter: FrontMatter, filePath: string): string {
  return frontMatter.title || path.basename(filePath, path.extname(filePath));
}

export function walkFiles(
  dir: string,
  pattern: string,
  fn: (filePath: string) => void
): void {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, pattern, fn);
    } else if (entry.isFile() && matchPattern(entry.name, pattern)) {
      fn(full);
    }
  }
}

export function walkFilesArray(dir: string, pattern: string): string[] {
  const files: string[] = [];
  walkFiles(dir, pattern, (f) => files.push(f));
  return files;
}

function matchPattern(filename: string, pattern: string): boolean {
  const re = new RegExp(
    "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$",
    "i"
  );
  return re.test(filename);
}

export function snippetAround(text: string, query: string, contextLen = 50): string {
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text.slice(0, contextLen * 2);
  const start = Math.max(0, idx - contextLen);
  const end = Math.min(text.length, idx + query.length + contextLen);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

export function scoreMatch(text: string, query: string): number {
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  let score = 0;
  let pos = 0;
  while ((pos = lower.indexOf(qLower, pos)) !== -1) {
    score += 1;
    pos += qLower.length;
  }
  if (lower.startsWith(qLower)) score += 2;
  return score;
}

export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

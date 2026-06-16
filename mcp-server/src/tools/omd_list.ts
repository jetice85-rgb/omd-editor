import * as fs from "fs";
import * as path from "path";
import { getVaultPath, walkFiles, readFileSafe, parseFrontMatter, extractTitle, toRelativePath } from "../utils";

const inputSchema = {
  type: "object" as const,
  properties: {
    dir: { type: "string", default: "", description: "Subdirectory within vault (empty for root)" },
    pattern: { type: "string", default: "*.md", description: "File match pattern (glob-style, e.g. *.md)" },
  },
};

interface FileEntry {
  path: string;
  title: string;
  size: number;
  modified: string;
}

export const omdListTool = {
  name: "omd_list",
  description: "List files in the OMD vault directory. Returns title, size, and modification time for each file.",
  inputSchema,
  handler: async (args: { dir?: string; pattern?: string }) => {
    const vault = getVaultPath();
    const subdir = args.dir || "";
    const pattern = args.pattern || "*.md";
    const targetDir = path.resolve(vault, subdir);
    const vaultResolved = path.resolve(vault);

    if (!targetDir.startsWith(vaultResolved + path.sep) && targetDir !== vaultResolved) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: "Path traversal denied" }) }],
      };
    }

    if (!fs.existsSync(targetDir)) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ dir: subdir, files: [], count: 0 }) }],
      };
    }

    const entries: FileEntry[] = [];
    walkFiles(targetDir, pattern, (filePath) => {
      const stat = fs.statSync(filePath);
      const relativePath = toRelativePath(filePath);
      let title = path.basename(filePath, path.extname(filePath));
      const raw = readFileSafe(filePath);
      if (raw) {
        const { frontMatter } = parseFrontMatter(raw);
        title = extractTitle(frontMatter, relativePath);
      }
      entries.push({
        path: relativePath,
        title,
        size: stat.size,
        modified: stat.mtime.toISOString(),
      });
    });

    entries.sort((a, b) => a.path.localeCompare(b.path));

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ dir: subdir, files: entries, count: entries.length }, null, 2),
      }],
    };
  },
};

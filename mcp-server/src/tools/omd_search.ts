import {
  getVaultPath,
  walkFilesArray,
  readFileSafe,
  parseOMD,
  extractTitle,
  snippetAround,
  scoreMatch,
  toRelativePath,
} from "../utils";

const inputSchema = {
  type: "object" as const,
  properties: {
    query: { type: "string", description: "Search query string" },
    limit: { type: "number", default: 10, description: "Max number of results" },
  },
  required: ["query"],
};

interface SearchResult {
  path: string;
  title: string;
  snippet: string;
  score: number;
}

export const omdSearchTool = {
  name: "omd_search",
  description: "Full-text search across all .md/.omd files in the OMD vault. Returns matching files with context snippets.",
  inputSchema,
  handler: async (args: { query: string; limit?: number }) => {
    const vault = getVaultPath();
    const limit = args.limit || 10;
    const files = walkFilesArray(vault, "*.md");

    const results: SearchResult[] = [];

    for (const filePath of files) {
      const raw = readFileSafe(filePath);
      if (!raw) continue;

      const lower = raw.toLowerCase();
      const qLower = args.query.toLowerCase();
      if (!lower.includes(qLower)) continue;

      const parsed = parseOMD(raw);
      const relativePath = toRelativePath(filePath);
      const title = extractTitle(parsed.frontMatter, relativePath);
      const snippet = snippetAround(raw, args.query, 50);
      const score = scoreMatch(raw, args.query);

      results.push({ path: relativePath, title, snippet, score });
    }

    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, limit);

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ query: args.query, count: top.length, results: top }, null, 2),
      }],
    };
  },
};

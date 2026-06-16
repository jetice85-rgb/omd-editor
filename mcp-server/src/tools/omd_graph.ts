import {
  getVaultPath,
  walkFilesArray,
  readFileSafe,
  parseOMD,
  extractTitle,
  extractWikilinks,
  extractTags,
  toRelativePath,
} from "../utils";

const inputSchema = {
  type: "object" as const,
  properties: {},
};

interface GraphNode {
  path: string;
  title: string;
  tags: string[];
}

interface GraphEdge {
  from: string;
  to: string;
  type: "link" | "tag";
}

export const omdGraphTool = {
  name: "omd_graph",
  description: "Build a knowledge graph from the OMD vault — extracts tags and [[wikilinks]] from all files.",
  inputSchema,
  handler: async () => {
    const vault = getVaultPath();
    const files = walkFilesArray(vault, "*.md");

    const nodes: GraphNode[] = [];
    const edgeSet = new Set<string>();
    const edges: GraphEdge[] = [];

    for (const filePath of files) {
      const raw = readFileSafe(filePath);
      if (!raw) continue;

      const parsed = parseOMD(raw);
      const relativePath = toRelativePath(filePath);
      const title = extractTitle(parsed.frontMatter, relativePath);
      const tags = extractTags(raw);
      const links = extractWikilinks(raw);

      nodes.push({ path: relativePath, title, tags });

      for (const tag of tags) {
        const key = `${relativePath}->tag:${tag}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ from: relativePath, to: `#${tag}`, type: "tag" });
        }
      }

      for (const link of links) {
        const key = `${relativePath}->link:${link}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ from: relativePath, to: link, type: "link" });
        }
      }
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ nodes, edges }, null, 2),
      }],
    };
  },
};

import {
  resolvePath,
  readFileSafe,
  parseOMD,
  extractTitle,
} from "../utils";

const inputSchema = {
  type: "object" as const,
  properties: {
    path: { type: "string", description: "File path relative to vault root" },
    format: {
      type: "string",
      enum: ["full", "body", "meta"],
      default: "full",
      description: "Return format: full (entire OMD), body (markdown only), meta (YAML frontmatter only)",
    },
  },
  required: ["path"],
};

export const omdReadTool = {
  name: "omd_read",
  description: "Read a .md/.omd file from the OMD vault. Returns full OMD, body-only, or metadata-only.",
  inputSchema,
  handler: async (args: { path: string; format?: string }) => {
    const filePath = resolvePath(args.path);
    const raw = readFileSafe(filePath);
    if (raw === null) {
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: `File not found: ${args.path}` }) }],
      };
    }

    const format = args.format || "full";
    const parsed = parseOMD(raw);
    const stats = { chars: raw.length, lines: raw.split("\n").length };
    const title = extractTitle(parsed.frontMatter, args.path);

    if (format === "meta") {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ path: args.path, title, meta: parsed.frontMatter, stats }, null, 2),
        }],
      };
    }

    if (format === "body") {
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ path: args.path, title, body: parsed.body, stats }, null, 2),
        }],
      };
    }

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({
          path: args.path,
          title,
          meta: parsed.frontMatter,
          body: parsed.body,
          render: null,
          stats,
        }, null, 2),
      }],
    };
  },
};

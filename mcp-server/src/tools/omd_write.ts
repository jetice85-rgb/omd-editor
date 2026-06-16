import * as fs from "fs";
import * as path from "path";
import { resolvePath } from "../utils";

const inputSchema = {
  type: "object" as const,
  properties: {
    path: { type: "string", description: "File path relative to vault root" },
    content: { type: "string", description: "File content to write" },
    mode: {
      type: "string",
      enum: ["omd", "markdown"],
      default: "omd",
      description: "omd: content is full OMD; markdown: content is markdown body, auto-generate frontmatter/OMD tail",
    },
  },
  required: ["path", "content"],
};

export const omdWriteTool = {
  name: "omd_write",
  description: "Create or update a file in the OMD vault. Supports OMD and plain Markdown modes.",
  inputSchema,
  handler: async (args: { path: string; content: string; mode?: string }) => {
    const filePath = resolvePath(args.path);
    const mode = args.mode || "omd";

    let finalContent: string;
    if (mode === "markdown") {
      const basename = path.basename(args.path, path.extname(args.path));
      const now = new Date().toISOString().replace("T", " ").slice(0, 19);
      const header = `---\ntitle: ${basename}\ndate: ${now}\n---\n`;
      const tail = `\n<!--OMD\ncreated: ${now}\nmodified: ${now}\n-->`;
      finalContent = header + args.content + tail;
    } else {
      finalContent = args.content;
    }

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, finalContent, "utf-8");
    const stats = { chars: finalContent.length, lines: finalContent.split("\n").length };

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ path: args.path, written: true, stats }, null, 2),
      }],
    };
  },
};

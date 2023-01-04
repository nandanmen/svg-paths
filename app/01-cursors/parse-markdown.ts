import * as fs from "fs/promises";
import path from "path";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export const parseMarkdown = async (filePath: string) => {
  const file = await fs.readFile(
    path.join(process.cwd(), `content/${filePath}`),
    "utf-8"
  );
  const doc = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(file);
  return String(doc);
};

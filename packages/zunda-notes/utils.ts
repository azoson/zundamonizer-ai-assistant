import { exec } from "child_process";
import * as fs from "fs/promises";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Marpスライドをプレビュー表示する
 */
export async function previewMarpSlide(slidePath: string): Promise<void> {
  const command = `npx @marp-team/marp-cli --preview "${slidePath}"`;

  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(stdout);

    // エラーが出力されている場合は表示
    if (stderr) {
      console.error(stderr);
    }
  } catch (error) {
    console.error("スライドのプレビューに失敗しました:", error);
    throw error;
  }
}

/**
 * マークダウンスライドを複数のページに分割する
 */
export async function splitSlidePages(slidePath: string): Promise<string[]> {
  const content = await fs.readFile(slidePath, "utf-8");

  // 水平線またはディレクティブでページを分割
  const pageDelimiters = [
    /^---$/m,                 // 水平線
    /^<!-- _class:.*-->$/m,   // _classディレクティブ
    /^<!-- page.*-->$/m       // pageディレクティブ
  ];

  let pages: string[] = [content];

  for (const delimiter of pageDelimiters) {
    const newPages: string[] = [];

    for (const page of pages) {
      // 指定された区切り文字でページを分割
      const split = page.split(delimiter);

      if (split.length > 1) {
        for (let i = 0; i < split.length; i++) {
          let chunk = split[i].trim();

          // 最初のページ以外には区切り文字を先頭に追加
          if (i > 0 && chunk) {
            const match = page.match(delimiter);
            if (match) {
              chunk = match[0] + "\n\n" + chunk;
            }
          }

          if (chunk) {
            newPages.push(chunk);
          }
        }
      } else {
        newPages.push(page);
      }
    }

    pages = newPages;
  }

  return pages.filter(page => page.trim() !== "");
}

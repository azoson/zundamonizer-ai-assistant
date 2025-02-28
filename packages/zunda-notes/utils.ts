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

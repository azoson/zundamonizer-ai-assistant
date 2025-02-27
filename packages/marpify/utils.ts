import { exec } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

// Marpスライドをエクスポートするオプション
export interface MarpExportOptions {
  input: string;
  output: string;
  format: "pdf" | "html" | "pptx";
  theme?: string;
}

/**
 * Marpスライドをエクスポートする
 * @requires marp-cli がインストールされていること
 */
export async function exportMarpSlide(options: MarpExportOptions): Promise<void> {
  const { input, output, format, theme } = options;

  const themeOption = theme ? `--theme ${theme}` : "";
  const command = `npx @marp-team/marp-cli ${input} --output ${output} --${format} ${themeOption}`;

  try {
    await execAsync(command);
    console.log(`スライドを ${output} にエクスポートしました`);
  } catch (error) {
    console.error("スライドのエクスポートに失敗しました:", error);
    throw error;
  }
}

/**
 * Marpスライドにフロントマターを追加する
 */
export async function addFrontMatter(
  slidePath: string,
  frontMatter: Record<string, any>
): Promise<void> {
  const slideContent = await fs.readFile(slidePath, "utf-8");

  // フロントマターをYAML形式に変換
  const yamlLines = Object.entries(frontMatter).map(([key, value]) => {
    if (typeof value === "string") {
      return `${key}: "${value}"`;
    }
    return `${key}: ${value}`;
  });

  const frontMatterText = `---\n${yamlLines.join("\n")}\n---\n\n`;

  // スライドの先頭にフロントマターを追加
  const contentWithFrontMatter = frontMatterText + slideContent;

  await fs.writeFile(slidePath, contentWithFrontMatter, "utf-8");
}

/**
 * Marpスライドにカスタムテーマを適用する
 */
export async function applyCustomTheme(
  slidePath: string,
  themeName: string
): Promise<void> {
  const slideContent = await fs.readFile(slidePath, "utf-8");

  // テーマ指定が既にあるかどうかを確認
  const hasThemeDirective = /^<!-- theme:.*-->/m.test(slideContent);

  if (hasThemeDirective) {
    // 既存のテーマディレクティブを置換
    const updatedContent = slideContent.replace(
      /^<!-- theme:.*-->/m,
      `<!-- theme: ${themeName} -->`
    );
    await fs.writeFile(slidePath, updatedContent, "utf-8");
  } else {
    // テーマディレクティブを追加
    const themeDirective = `<!-- theme: ${themeName} -->\n\n`;
    await fs.writeFile(slidePath, themeDirective + slideContent, "utf-8");
  }
}

/**
 * Marpプレゼンテーションをブラウザでプレビューする
 * @requires marp-cli がインストールされていること
 */
export async function previewMarpSlide(slidePath: string): Promise<void> {
  const command = `npx @marp-team/marp-cli --preview ${slidePath}`;

  try {
    const { stdout, stderr } = await execAsync(command);
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
  } catch (error) {
    console.error("スライドのプレビューに失敗しました:", error);
    throw error;
  }
}

/**
 * 画像ファイルをスライド用のディレクトリにコピーする
 */
export async function copyImagesToSlideDir(
  markdownContent: string,
  outputDir: string
): Promise<string> {
  // マークダウン内の画像パスを検出
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  let match;
  let updatedContent = markdownContent;
  const imagesToCopy = [];

  // imagesディレクトリを作成
  const imagesDir = path.join(outputDir, "images");
  await fs.mkdir(imagesDir, { recursive: true });

  // 画像パスを検出してコピー対象リストに追加
  while ((match = imageRegex.exec(markdownContent)) !== null) {
    const imagePath = match[1];
    if (imagePath.startsWith("http")) continue; // 外部URLはスキップ

    const fileName = path.basename(imagePath);
    const destPath = path.join(imagesDir, fileName);

    imagesToCopy.push({
      sourcePath: imagePath,
      destPath,
      originalPath: match[1],
      newPath: `images/${fileName}`
    });
  }

  // 画像をコピーしてパスを置換
  for (const img of imagesToCopy) {
    try {
      await fs.copyFile(img.sourcePath, img.destPath);
      // マークダウン内のパスを置換
      updatedContent = updatedContent.replace(
        new RegExp(`!\\[.*?\\]\\(${img.originalPath}`, "g"),
        `![](${img.newPath}`
      );
    } catch (error) {
      console.warn(`警告: 画像 ${img.sourcePath} のコピーに失敗しました`, error);
    }
  }

  return updatedContent;
}

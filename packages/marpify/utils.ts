import { exec } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { promisify } from "util";

const execPromise = promisify(exec);

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
    await execPromise(command);
    console.log(`スライドを ${output} にエクスポートしました`);
  } catch (error) {
    console.error("スライドのエクスポートに失敗しました:", error);
    throw error;
  }
}

/**
 * マークダウンコンテンツからフロントマターを検出する
 * @returns フロントマターがある場合は、{hasFrontMatter: true, content: フロントマターを除去したコンテンツ}
 * フロントマターがない場合は、{hasFrontMatter: false, content: 元のコンテンツ}
 */
export function detectAndRemoveFrontMatter(content: string): { hasFrontMatter: boolean; content: string } {
  // フロントマターの正規表現 (--- で始まり、--- で終わる)
  const frontMatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = content.match(frontMatterRegex);

  if (match) {
    // フロントマターを除去したコンテンツを返す
    return {
      hasFrontMatter: true,
      content: content.replace(frontMatterRegex, '')
    };
  }

  return {
    hasFrontMatter: false,
    content
  };
}

/**
 * フロントマターを解析する
 */
export function parseFrontMatter(
  content: string
): { frontMatter: Record<string, any>; content: string } {
  const { hasFrontMatter, content: contentWithoutFrontMatter } = detectAndRemoveFrontMatter(content);

  if (!hasFrontMatter) {
    return {
      frontMatter: {},
      content: contentWithoutFrontMatter
    };
  }

  // フロントマターを抽出して解析
  const match = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match || !match[1]) {
    return {
      frontMatter: {},
      content: contentWithoutFrontMatter
    };
  }

  // YAMLフロントマターを解析
  const frontMatterText = match[1];
  const frontMatter: Record<string, any> = {};

  // 単純なキー・バリューのみをサポート
  frontMatterText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      // 引用符を削除
      frontMatter[key.trim()] = value.replace(/^["'](.*)["']$/, '$1');
    }
  });

  return {
    frontMatter,
    content: contentWithoutFrontMatter
  };
}

/**
 * フロントマターをマークダウンに適用する
 */
export function applyFrontMatter(
  content: string,
  frontMatter: Record<string, any>
): string {
  // 既存のフロントマターを削除
  const { content: cleanContent } = detectAndRemoveFrontMatter(content);

  // 新しいフロントマターを構築
  const yamlLines = Object.entries(frontMatter).map(([key, value]) => {
    if (typeof value === 'string') {
      // 値に:が含まれている場合は引用符で囲む
      if (value.includes(':') || value.includes('#')) {
        return `${key}: "${value}"`;
      }
      return `${key}: ${value}`;
    }
    return `${key}: ${value}`;
  });

  if (yamlLines.length === 0) {
    return cleanContent;
  }

  const frontMatterText = `---\n${yamlLines.join('\n')}\n---\n\n`;
  return frontMatterText + cleanContent;
}

/**
 * Marpスライドにフロントマターを追加する
 */
export async function addFrontMatter(
  slidePath: string,
  frontMatter: Record<string, any>
): Promise<void> {
  // ファイルを読み込む
  const slideContent = await fs.readFile(slidePath, "utf-8");

  // 既存のフロントマターをマージ
  const { frontMatter: existingFrontMatter } = parseFrontMatter(slideContent);
  const mergedFrontMatter = { ...existingFrontMatter, ...frontMatter };

  // フロントマターを適用
  const contentWithFrontMatter = applyFrontMatter(slideContent, mergedFrontMatter);

  // ファイルに書き込む
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

  // フロントマターを解析
  const { frontMatter, content } = parseFrontMatter(slideContent);

  // フロントマターにテーマを設定
  frontMatter.theme = themeName;

  // テーマ指定が既にあるかどうかを確認
  const hasThemeDirective = /^<!-- theme:.*-->/m.test(content);
  let updatedContent = content;

  if (hasThemeDirective) {
    // 既存のテーマディレクティブを置換
    updatedContent = content.replace(
      /^<!-- theme:.*-->/m,
      `<!-- theme: ${themeName} -->`
    );
  } else {
    // テーマディレクティブを追加
    updatedContent = `<!-- theme: ${themeName} -->\n\n${content}`;
  }

  // フロントマターを適用して保存
  const finalContent = applyFrontMatter(updatedContent, frontMatter);
  await fs.writeFile(slidePath, finalContent, "utf-8");
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

  try {
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

    // 画像をコピーしてパスを置換（一括処理）
    await Promise.all(
      imagesToCopy.map(async (img) => {
        try {
          await fs.copyFile(img.sourcePath, img.destPath);
          // パスの置換は後で一括して行う
        } catch (error) {
          console.warn(`警告: 画像 ${img.sourcePath} のコピーに失敗しました: ${error instanceof Error ? error.message : String(error)}`);
        }
      })
    );

    // すべての画像パスを一括置換
    for (const img of imagesToCopy) {
      updatedContent = updatedContent.replace(
        new RegExp(`!\\[.*?\\]\\(${escapeRegExp(img.originalPath)}\\)`, "g"),
        `![](${img.newPath})`
      );
    }

    return updatedContent;
  } catch (error) {
    console.error(`画像の処理中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`);
    // エラーが発生しても元のコンテンツを返す
    return markdownContent;
  }
}

/**
 * 正規表現で使用する特殊文字をエスケープする
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

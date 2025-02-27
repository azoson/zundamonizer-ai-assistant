#!/usr/bin/env bun
import * as fs from "fs/promises";
import OpenAI from "openai";
import { splitSlidePages } from "./utils.js";
import { getAddNotesPrompt } from "./prompt-templates.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * ずんだもんと春日部つむぎのかけあい形式のプレゼンターノートを生成する
 */
async function generateCharacterDialogue(
  slideContent: string,
  referenceContent: string | null,
  zundamonName: string,
  tsumugiName: string
): Promise<string> {
  const promptContent = getAddNotesPrompt({
    originalSlide: slideContent,
    documentContent: referenceContent || undefined,
    zundamonName,
    tsumugiName
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "あなたはプレゼンテーション解説用のコンテンツを作成するアシスタントです。ずんだもんと春日部つむぎの会話形式のコメントスタイルでプレゼンターノートを作成します。"
      },
      {
        role: "user",
        content: promptContent
      }
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0].message.content || "";
}

/**
 * プレゼンターノートをスライドに追加する
 */
async function addPresenterNotesToSlide(
  slidePath: string,
  documentPath: string | undefined,
  outputPath: string,
  zundamonName: string,
  tsumugiName: string
): Promise<void> {
  // スライドをページに分割
  const pages = await splitSlidePages(slidePath);

  // 元の資料がある場合は読み込む
  let referenceContent: string | null = null;
  if (documentPath) {
    try {
      referenceContent = await fs.readFile(documentPath, "utf-8");
    } catch (error) {
      console.warn(`警告: 参考資料 ${documentPath} を読み込めませんでした`);
    }
  }

  // 各ページにプレゼンターノートを追加
  const pagesWithNotes: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    console.log(`ページ ${i + 1}/${pages.length} の会話形式プレゼンターノートを生成中...`);
    const dialogue = await generateCharacterDialogue(page, referenceContent, zundamonName, tsumugiName);

    // プレゼンターノートをマークダウンに追加
    const pageWithNote = `${page}\n\nNote:\n${dialogue}\n`;
    pagesWithNotes.push(pageWithNote);
  }

  // 結果を保存
  const combinedContent = pagesWithNotes.join("\n---\n\n");
  await fs.writeFile(outputPath, combinedContent, "utf-8");
}

// メイン処理
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error("使い方: bun add-notes.ts <slide-path> <document-path> <output-path> [zunda-character] [tsumugi-character]");
    process.exit(1);
  }

  const slidePath = args[0];
  const documentPath = args[1] !== '""' ? args[1] : undefined;
  const outputPath = args[2];
  const zundamonName = args[3] || "ずんだもん";
  const tsumugiName = args[4] || "春日部つむぎ";

  try {
    await addPresenterNotesToSlide(slidePath, documentPath, outputPath, zundamonName, tsumugiName);
    console.log(`会話形式プレゼンターノートを追加したスライドを ${outputPath} に保存しました`);
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

main();

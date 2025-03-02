import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MARP_DESCRIPTION = `
- ページの区切りは "---" を使用
- テキストの位置調整は '<div style="text-align: center;">' などを使用
- 段組表示には '<div style="display: grid; grid-template-columns: 1fr 1fr;">' などを使用
`;

// フロントマターを検出する正規表現
const frontMatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;

export async function improveSlideWithFeedback(
  markdownContent: string,
  slideMarkdown: string,
  feedback: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "o1-mini",
    messages: [
      {
        role: "user",
        content: `あなたはプレゼンテーションのスライドを作成するプロフェッショナルです。
指定された資料の内容とそれを表現するスライドコンテンツについて、
ユーザーからフィードバックを受け取り、スライドの内容を改善してください。

スライドには以下の Marp 形式が利用可能です:
${MARP_DESCRIPTION}

スライドのガイドライン:
- タイトルは必ず「# タイトル」の形式（# の後にスペース）で書いてください
- 資料の内容を明確な構造で整理してください
- 各スライドは簡潔かつ明確な内容にしてください`,
      },
      {
        role: "user",
        content: `
資料は以下です:
\`\`\`
${markdownContent}
\`\`\`

スライドは以下です:
\`\`\`
${slideMarkdown}
\`\`\`

フィードバックは以下です:
\`\`\`
${feedback}
\`\`\`

改善後のスライドの内容を出力してください。
出力にはフロントマターを含めないでください。
出力の冒頭・末尾にはコードブロック宣言（\`\`\`）を含めないでください。
出力にはスライド内容のみを含めてください。`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("スライドの改善に失敗しました");
  }

  // 常にフロントマターを追加（Marpスライドとして有効な形式にする）
  const resultWithFrontMatter = `---
marp: true
---

${result}`;

  return resultWithFrontMatter;
}

export async function main(documentFilePath?: string, slidesFilePath?: string, feedbackFilePath?: string) {
  try {
    const docPath = documentFilePath || process.argv[2];
    const slidePath = slidesFilePath || process.argv[3];
    const feedbackPath = feedbackFilePath || process.argv[4];

    if (!docPath || !slidePath || !feedbackPath) {
      throw new Error(
        "Usage: bun run improve.ts <document-file-path> <slides-file-path> <feedback-file-path>"
      );
    }

    const markdownContent = await fs.readFile(
      path.resolve(process.cwd(), docPath),
      "utf-8"
    );
    const slideMarkdown = await fs.readFile(
      path.resolve(process.cwd(), slidePath),
      "utf-8"
    );
    const feedback = await fs.readFile(
      path.resolve(process.cwd(), feedbackPath),
      "utf-8"
    );

    // フロントマターを取り除いてAPIに送信
    const slideWithoutFrontMatter = slideMarkdown.replace(frontMatterRegex, '').trim();

    const improvedSlide = await improveSlideWithFeedback(
      markdownContent,
      slideWithoutFrontMatter,
      feedback
    );

    console.log(improvedSlide);
    return improvedSlide;
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.main) {
  main();
}

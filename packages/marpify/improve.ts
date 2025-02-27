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

async function improveSlideWithFeedback(
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
${MARP_DESCRIPTION}`,
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

  return result;
}

async function main() {
  try {
    const documentFilePath = process.argv[2];
    const slidesFilePath = process.argv[3];
    const feedbackFilePath = process.argv[4];

    if (!documentFilePath || !slidesFilePath || !feedbackFilePath) {
      throw new Error(
        "Usage: bun run improve.ts <document-file-path> <slides-file-path> <feedback-file-path>"
      );
    }

    const markdownContent = await fs.readFile(
      path.resolve(process.cwd(), documentFilePath),
      "utf-8"
    );
    const slideMarkdown = await fs.readFile(
      path.resolve(process.cwd(), slidesFilePath),
      "utf-8"
    );
    const feedback = await fs.readFile(
      path.resolve(process.cwd(), feedbackFilePath),
      "utf-8"
    );

    const improvedSlide = await improveSlideWithFeedback(
      markdownContent,
      slideMarkdown,
      feedback
    );

    console.log(improvedSlide);
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

main();

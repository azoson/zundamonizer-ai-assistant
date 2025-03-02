import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function evaluateMarpSlide(
  markdownContent: string,
  slideMarkdown: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "o1-mini",
    messages: [
      {
        role: "user",
        content: `
  あなたはスライドを作成するスペシャリストです。
  ユーザーからスライド化する前の資料とスライド（Marpit 形式）を受け取り、それを改善してください。

  以下の観点からスライドを 10 点満点で評価してください。
  - スライド化する前の資料の情報を過不足なく伝えられているか
  - スライド全体の構成は理解しやすいものになっているか
  - スライドの各ページは簡潔・明瞭か
  - スライドの各ページの文章量は多すぎないか

  その後、点数を 10 点に近づけるための改善点を出力してください。
  出力には改善点のみを含めてください。
            `,
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
            `,
      },
    ],
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("Failed to generate script");
  }

  return result;
}

export async function main(documentFilePath?: string, slidesFilePath?: string) {
  try {
    const docPath = documentFilePath || process.argv[2];
    const slidePath = slidesFilePath || process.argv[3];

    if (!docPath || !slidePath) {
      throw new Error(
        "Usage: node index.ts <document-file-path> <slides-file-path>"
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
    const evaluation = await evaluateMarpSlide(
      markdownContent,
      slideMarkdown
    );

    console.log(evaluation);
    return evaluation;
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.main) {
  main();
}

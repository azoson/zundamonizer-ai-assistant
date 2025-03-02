import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// フロントマターを検出する正規表現
const frontMatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/;

const MARP_DESCRIPTION = `
- ページの区切りは "---" を使用
- テキストの位置調整は '<div style="text-align: center;">' などを使用
- 段組表示には '<div style="display: grid; grid-template-columns: 1fr 1fr;">' などを使用
- 画像の挿入は '![alt text](画像URL)' を使用
- 画像サイズの変更は '![alt text](画像URL "=WIDTHxHEIGHT")' を使用
`;

async function generateSlideFromMarkdown(
  markdownContent: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "o1-mini",
    messages: [
      {
        role: "user",
        content: `あなたはプレゼンテーションのスライドを作成するプロフェッショナルです。
マークダウン形式の資料を受け取り、Marp形式のスライド内容を生成してください。

スライドには以下の Marp 形式が利用可能です:
${MARP_DESCRIPTION}

スライドのガイドライン:
- タイトルスライドを最初に作成してください
- タイトルは必ず「# タイトル」の形式（# の後にスペース）で書いてください
- 資料の内容を明確な構造で整理してください
- 各スライドは簡潔かつ明確な内容にしてください
- 適切な見出しレベルを使用してください
- 必要に応じて箇条書きを使用してください
- 適切なスライド数になるように内容を調整してください`,
      },
      {
        role: "user",
        content: `
以下の資料からMarp形式のスライドを作成してください:
\`\`\`
${markdownContent}
\`\`\`

出力にはフロントマターを含めないでください。
出力の冒頭・末尾にはコードブロック宣言（\`\`\`）を含めないでください。
出力にはスライド内容のみを含めてください。`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("スライドの生成に失敗しました");
  }

  // 常にフロントマターを追加（Marpスライドとして有効な形式にする）
  const resultWithFrontMatter = `---
marp: true
---

${result}`;

  return resultWithFrontMatter;
}

export async function main(documentFilePath?: string, outputPath?: string) {
  try {
    // コマンドライン引数があれば使用し、なければ関数の引数を使用
    const docPath = documentFilePath || process.argv[2];
    const outPath = outputPath || process.argv[3];

    if (!docPath) {
      throw new Error(
        "Usage: bun run generate.ts <document-file-path> [output-file-path]"
      );
    }

    const markdownContent = await fs.readFile(
      path.resolve(process.cwd(), docPath),
      "utf-8"
    );

    const slideContent = await generateSlideFromMarkdown(markdownContent);

    if (outPath) {
      await fs.writeFile(
        path.resolve(process.cwd(), outPath),
        slideContent,
        "utf-8"
      );
      console.log(`スライドを ${outPath} に保存しました`);
    } else {
      console.log(slideContent);
    }

    return slideContent;
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.main) {
  main();
}

#!/usr/bin/env bun
import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";
import { getImprovePrompt } from "./prompt-templates.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 環境変数からモデル名を取得するか、デフォルト値を使用
const MODEL_NAME = process.env.OPENAI_MODEL_NAME || "gpt-4o";

/**
 * 評価に基づいてプレゼンターノートを改善する
 */
export async function improvePresenterNotes(
  slidePath: string,
  withNotesPath: string,
  evaluationPath: string
): Promise<string> {
  // 元のスライド、プレゼンターノート付きスライド、評価を読み込む
  const originalSlide = await fs.readFile(
    path.resolve(process.cwd(), slidePath),
    "utf-8"
  );
  const slideWithNotes = await fs.readFile(
    path.resolve(process.cwd(), withNotesPath),
    "utf-8"
  );
  const evaluation = await fs.readFile(
    path.resolve(process.cwd(), evaluationPath),
    "utf-8"
  );

  const promptContent = getImprovePrompt({
    originalSlide,
    slideWithNotes,
    evaluation
  });

  console.log(`使用するモデル: ${MODEL_NAME}`);

  // モデル名によってパラメータを選択
  const requestParams: any = {
    model: MODEL_NAME,
    messages: [
      {
        role: "user",
        content: `あなたはプレゼンテーション解説を改善するアシスタントです。ずんだもんと春日部つむぎの会話形式のプレゼンターノートを評価に基づいて改善します。

${promptContent}`
      }
    ],
  };

  // o1-miniモデル以外の場合のみtemperatureを設定
  if (!MODEL_NAME.includes("o1-mini")) {
    requestParams.temperature = 0.7;
  }

  // o1-miniモデルの場合はmax_completion_tokensを使用
  if (MODEL_NAME.includes("o1-mini")) {
    requestParams.max_completion_tokens = 6000;
  } else {
    requestParams.max_tokens = 6000;
  }

  const response = await openai.chat.completions.create(requestParams);

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("プレゼンターノートの改善に失敗しました");
  }

  // コードブロック宣言を削除
  const cleanedResult = result.replace(/^```(?:markdown)?|```$/g, '').trim();

  return cleanedResult;
}

// メイン処理
export async function main(args: string[]): Promise<string> {
  try {
    const slidePath = args[0];
    const withNotesPath = args[1];
    const evaluationPath = args[2];

    if (!slidePath || !withNotesPath || !evaluationPath) {
      throw new Error(
        "使い方: bun run improve.ts <original-slide-path> <slide-with-notes-path> <evaluation-path>"
      );
    }

    const improvedSlide = await improvePresenterNotes(
      slidePath,
      withNotesPath,
      evaluationPath
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
  await main(process.argv.slice(2));
}

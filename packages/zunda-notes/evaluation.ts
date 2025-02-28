#!/usr/bin/env bun
import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";
import { getEvaluationPrompt } from "./prompt-templates.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 環境変数からモデル名を取得するか、デフォルト値を使用
const MODEL_NAME = process.env.OPENAI_MODEL_NAME || "gpt-4o";

/**
 * ずんだもんと春日部つむぎのかけあい形式プレゼンターノートを評価する
 */
export async function evaluatePresenterNotes(
  slidePath: string,
  withNotesPath: string
): Promise<string> {
  // 元のスライドとプレゼンターノート付きスライドを読み込む
  const originalSlide = await fs.readFile(
    path.resolve(process.cwd(), slidePath),
    "utf-8"
  );
  const slideWithNotes = await fs.readFile(
    path.resolve(process.cwd(), withNotesPath),
    "utf-8"
  );

  const promptContent = getEvaluationPrompt({
    originalSlide,
    slideWithNotes
  });

  console.log(`使用するモデル: ${MODEL_NAME}`);

  // モデル名によってパラメータを選択
  const requestParams: any = {
    model: MODEL_NAME,
    messages: [
      {
        role: "user",
        content: `あなたはプレゼンテーション解説の評価を行うアシスタントです。ずんだもんと春日部つむぎの会話形式のプレゼンターノートの質を評価します。

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
    requestParams.max_completion_tokens = 4000;
  } else {
    requestParams.max_tokens = 4000;
  }

  const response = await openai.chat.completions.create(requestParams);

  console.log("OpenAI API レスポンス:", JSON.stringify(response, null, 2));

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("プレゼンターノートの評価に失敗しました");
  }

  return result;
}

// メイン処理
export async function main(args: string[]): Promise<string> {
  try {
    const slidePath = args[0];
    const withNotesPath = args[1];

    if (!slidePath || !withNotesPath) {
      throw new Error(
        "使い方: bun run evaluation.ts <original-slide-path> <slide-with-notes-path>"
      );
    }

    const evaluation = await evaluatePresenterNotes(slidePath, withNotesPath);
    console.log(evaluation);
    return evaluation;
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.main) {
  await main(process.argv.slice(2));
}

#!/usr/bin/env bun
import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";
import { getImprovePrompt } from "./prompt-templates.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 評価に基づいてプレゼンターノートを改善する
 */
async function improvePresenterNotes(
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

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "あなたはプレゼンテーション解説を改善するアシスタントです。ずんだもんと春日部つむぎの会話形式のプレゼンターノートを評価に基づいて改善します。"
      },
      {
        role: "user",
        content: promptContent
      }
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("プレゼンターノートの改善に失敗しました");
  }

  return result;
}

// メイン処理
async function main() {
  try {
    const slidePath = process.argv[2];
    const withNotesPath = process.argv[3];
    const evaluationPath = process.argv[4];

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
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

main();

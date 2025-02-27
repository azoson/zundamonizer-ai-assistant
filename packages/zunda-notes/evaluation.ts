#!/usr/bin/env bun
import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";
import { getEvaluationPrompt } from "./prompt-templates.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * ずんだもんと春日部つむぎのかけあい形式プレゼンターノートを評価する
 */
async function evaluatePresenterNotes(
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

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: "あなたはプレゼンテーション解説の評価を行うアシスタントです。ずんだもんと春日部つむぎの会話形式のプレゼンターノートの質を評価します。"
      },
      {
        role: "user",
        content: promptContent
      }
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("プレゼンターノートの評価に失敗しました");
  }

  return result;
}

// メイン処理
async function main() {
  try {
    const slidePath = process.argv[2];
    const withNotesPath = process.argv[3];

    if (!slidePath || !withNotesPath) {
      throw new Error(
        "使い方: bun run evaluation.ts <original-slide-path> <slide-with-notes-path>"
      );
    }

    const evaluation = await evaluatePresenterNotes(slidePath, withNotesPath);
    console.log(evaluation);
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

main();

#!/usr/bin/env bun
import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";
import { getAddNotesPrompt } from "./prompt-templates.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 環境変数からモデル名を取得するか、デフォルト値を使用
const MODEL_NAME = process.env.OPENAI_MODEL_NAME || "gpt-4o";

/**
 * Marpスライドにプレゼンターノートを追加する
 */
export async function addPresenterNotes(
  slidePath: string,
  documentPath: string | undefined,
  zundaCharacter: string = "ずんだもん",
  tsumugiCharacter: string = "春日部つむぎ"
): Promise<string> {
  // スライドの内容を読み込む
  const slideContent = await fs.readFile(
    path.resolve(process.cwd(), slidePath),
    "utf-8"
  );

  // 参考資料がある場合は読み込む
  let documentContent: string | undefined;
  if (documentPath && documentPath !== "") {
    try {
      documentContent = await fs.readFile(
        path.resolve(process.cwd(), documentPath),
        "utf-8"
      );
    } catch (error) {
      console.warn("参考資料の読み込みに失敗しました:", error);
    }
  }

  const promptContent = getAddNotesPrompt({
    originalSlide: slideContent,
    documentContent,
    zundaCharacter,
    tsumugiCharacter
  });

  console.log(`使用するモデル: ${MODEL_NAME}`);

  // モデル名によってパラメータを選択
  const requestParams: any = {
    model: MODEL_NAME,
    messages: [
      {
        role: "user",
        content: promptContent
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

  // OpenAI APIで処理
  const response = await openai.chat.completions.create(requestParams);

  console.log("OpenAI API レスポンス:", JSON.stringify(response, null, 2));

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("プレゼンターノートの生成に失敗しました");
  }

  return result;
}

// メイン処理
export async function main(args: string[]): Promise<string> {
  try {
    const slidePath = args[0];
    const documentPath = args[1];
    const outputPath = args[2];
    const zundaCharacter = args[3] || "ずんだもん";
    const tsumugiCharacter = args[4] || "春日部つむぎ";

    if (!slidePath) {
      throw new Error(
        "使い方: bun run add-notes.ts <slide-path> [document-path] <output-path> [zunda-character] [tsumugi-character]"
      );
    }

    // プレゼンターノートを追加
    const slideWithNotes = await addPresenterNotes(
      slidePath,
      documentPath !== "" ? documentPath : undefined,
      zundaCharacter,
      tsumugiCharacter
    );

    // 結果を保存
    if (outputPath) {
      await fs.writeFile(path.resolve(process.cwd(), outputPath), slideWithNotes, "utf-8");
    }

    return slideWithNotes;
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみmain関数を実行
if (import.meta.main) {
  await main(process.argv.slice(2));
}

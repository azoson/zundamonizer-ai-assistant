#!/usr/bin/env bun
import { program } from "commander";
import path from "path";
import * as fs from "fs/promises";
import {
  exportMarpSlide,
  addFrontMatter,
  applyCustomTheme,
} from "./utils.js";

// 各スクリプトの主要な関数をインポート
import { main as generateMain } from "./generate.js";
import { main as evaluateMain } from "./evaluation.js";
import { main as improveMain } from "./improve.js";

interface CommandOptions {
  output?: string;
  outputDir?: string;
  format?: "pdf" | "html" | "pptx";
  theme?: string;
  title?: string;
  author?: string;
}

program
  .name("marpify")
  .description("マークダウン資料からMarpスライドを生成・改善するツール")
  .version("0.1.0");

program
  .command("generate")
  .description("マークダウン資料からMarpスライドを生成")
  .argument("<document-path>", "マークダウン資料のパス")
  .option("-o, --output <path>", "出力ファイルパス")
  .action(async (documentPath: string, options: CommandOptions) => {
    const outputPath = options.output;
    console.log("スライドを生成中...");

    try {
      const output = await generateMain(documentPath, outputPath);

      if (!outputPath && output) {
        console.log(output);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`スライド生成エラー: ${error.message}`);
      } else {
        console.error("不明なエラーが発生しました");
      }
      process.exit(1);
    }
  });

program
  .command("evaluate")
  .description("既存のMarpスライドを評価")
  .argument("<document-path>", "元のマークダウン資料のパス")
  .argument("<slide-path>", "Marpスライドのパス")
  .option("-o, --output <path>", "評価結果の出力パス")
  .action(async (documentPath: string, slidePath: string, options: CommandOptions) => {
    const outputPath = options.output;
    console.log("スライドを評価中...");

    try {
      const evaluation = await evaluateMain(documentPath, slidePath);

      if (outputPath && evaluation) {
        const outputFullPath = path.resolve(process.cwd(), outputPath);
        const outputDir = path.dirname(outputFullPath);
        await fs.mkdir(outputDir, { recursive: true });

        await fs.writeFile(outputFullPath, evaluation, "utf-8");
        console.log(`評価結果を ${outputPath} に保存しました`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`スライド評価エラー: ${error.message}`);
      } else {
        console.error("不明なエラーが発生しました");
      }
      process.exit(1);
    }
  });

program
  .command("improve")
  .description("フィードバックに基づいてMarpスライドを改善")
  .argument("<document-path>", "元のマークダウン資料のパス")
  .argument("<slide-path>", "Marpスライドのパス")
  .argument("<feedback-path>", "フィードバック内容のパス")
  .option("-o, --output <path>", "改善されたスライドの出力パス")
  .action(async (documentPath: string, slidePath: string, feedbackPath: string, options: CommandOptions) => {
    const outputPath = options.output;
    console.log("スライドを改善中...");

    try {
      const improvedSlide = await improveMain(documentPath, slidePath, feedbackPath);

      if (outputPath && improvedSlide) {
        const outputFullPath = path.resolve(process.cwd(), outputPath);
        const outputDir = path.dirname(outputFullPath);
        await fs.mkdir(outputDir, { recursive: true });

        await fs.writeFile(outputFullPath, improvedSlide, "utf-8");
        console.log(`改善されたスライドを ${outputPath} に保存しました`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`スライド改善エラー: ${error.message}`);
      } else {
        console.error("不明なエラーが発生しました");
      }
      process.exit(1);
    }
  });

program
  .command("workflow")
  .description("マークダウン資料からスライド生成、評価、改善までの一連の流れを実行")
  .argument("<document-path>", "マークダウン資料のパス")
  .option("-o, --output-dir <directory>", "出力ディレクトリ", "output")
  .action(async (documentPath: string, options: CommandOptions) => {
    const outputDir = options.outputDir || "output";
    const basename = path.basename(documentPath, path.extname(documentPath));

    // 出力ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });

    try {
      // 生成
      const slidePath = path.join(outputDir, `${basename}-slide.md`);
      console.log(`スライドを生成中...`);
      await generateMain(documentPath, slidePath);
      console.log(`スライドを ${slidePath} に生成しました`);

      // 評価
      const evaluationPath = path.join(outputDir, `${basename}-evaluation.md`);
      console.log(`スライドを評価中...`);
      const evaluation = await evaluateMain(documentPath, slidePath);
      if (evaluation) {
        await fs.writeFile(evaluationPath, evaluation, "utf-8");
        console.log(`評価結果を ${evaluationPath} に保存しました`);
      }

      // 改善
      const improvedSlidePath = path.join(outputDir, `${basename}-improved-slide.md`);
      console.log(`スライドを改善中...`);
      const improvedSlide = await improveMain(documentPath, slidePath, evaluationPath);
      if (improvedSlide) {
        await fs.writeFile(improvedSlidePath, improvedSlide, "utf-8");
        console.log(`改善されたスライドを ${improvedSlidePath} に保存しました`);
      }

      console.log("ワークフロー完了！");
    } catch (error) {
      if (error instanceof Error) {
        console.error(`ワークフローエラー: ${error.message}`);
      } else {
        console.error("不明なエラーが発生しました");
      }
      process.exit(1);
    }
  });

program
  .command("export")
  .description("Marpスライドを様々な形式にエクスポート")
  .argument("<slide-path>", "Marpスライドのパス")
  .option("-o, --output <path>", "出力ファイルパス")
  .option("-f, --format <format>", "出力形式（pdf, html, pptx）", "pdf")
  .option("-t, --theme <theme>", "使用するテーマ")
  .action(async (slidePath: string, options: CommandOptions) => {
    const { output, format, theme } = options;
    if (!output) {
      console.error("エラー: 出力ファイルパスを指定してください");
      process.exit(1);
    }
    if (!format || !["pdf", "html", "pptx"].includes(format)) {
      console.error("エラー: 有効な出力形式（pdf, html, pptx）を指定してください");
      process.exit(1);
    }

    console.log(`スライドを ${format} 形式でエクスポート中...`);

    await exportMarpSlide({
      input: slidePath,
      output,
      format: format as "pdf" | "html" | "pptx",
      theme
    });
  });

program
  .command("theme")
  .description("Marpスライドにテーマを適用")
  .argument("<slide-path>", "Marpスライドのパス")
  .argument("<theme-name>", "適用するテーマ名")
  .action(async (slidePath: string, themeName: string) => {
    console.log(`テーマ '${themeName}' を適用中...`);
    await applyCustomTheme(slidePath, themeName);
    console.log("テーマを適用しました");
  });

program
  .command("add-meta")
  .description("Marpスライドにメタデータを追加")
  .argument("<slide-path>", "Marpスライドのパス")
  .option("-t, --title <title>", "プレゼンテーションのタイトル")
  .option("-a, --author <author>", "著者名")
  .option("-th, --theme <theme>", "使用するテーマ")
  .action(async (slidePath: string, options: CommandOptions) => {
    const frontMatter: Record<string, any> = {
      marp: true
    };

    if (options.title) frontMatter.title = options.title;
    if (options.author) frontMatter.author = options.author;
    if (options.theme) frontMatter.theme = options.theme;

    console.log("メタデータを追加中...");
    await addFrontMatter(slidePath, frontMatter);
    console.log("メタデータを追加しました");
  });

// メイン関数をエクスポート
export async function main(args: string[] = process.argv.slice(2)): Promise<any> {
  try {
    // Commanderの動作モードをテストモードに設定して、parseAsyncが処理を終了させないようにする
    program.exitOverride();
    return await program.parseAsync(args, { from: 'user' });
  } catch (error: any) {
    if (error.code === 'commander.helpDisplayed' || error.code === 'commander.unknownOption') {
      // ヘルプ表示やオプションエラーの場合はそのまま表示を許可
      return;
    }
    console.error(`コマンドライン引数エラー: ${error.message}`);
    throw error;
  }
}

// スクリプトが直接実行された場合のみparse()を実行
if (import.meta.main) {
  program.parse();
}

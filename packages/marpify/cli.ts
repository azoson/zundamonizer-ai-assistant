#!/usr/bin/env bun
import { program } from "commander";
import path from "path";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import {
  exportMarpSlide,
  addFrontMatter,
  applyCustomTheme,
  previewMarpSlide,
} from "./utils.js";

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
    const cmd = `bun run ${path.join(__dirname, "generate.ts")} "${documentPath}" ${
      outputPath ? `"${outputPath}"` : ""
    }`;
    try {
      console.log("スライドを生成中...");
      const output = execSync(cmd).toString();
      if (!outputPath) {
        console.log(output);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
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
    const cmd = `bun run ${path.join(__dirname, "evaluation.ts")} "${documentPath}" "${slidePath}"`;
    try {
      console.log("スライドを評価中...");
      const output = execSync(cmd).toString();
      if (outputPath) {
        await fs.writeFile(path.resolve(process.cwd(), outputPath), output, "utf-8");
        console.log(`評価結果を ${outputPath} に保存しました`);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
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
    const cmd = `bun run ${path.join(
      __dirname,
      "improve.ts"
    )} "${documentPath}" "${slidePath}" "${feedbackPath}"`;
    try {
      console.log("スライドを改善中...");
      const output = execSync(cmd).toString();
      if (outputPath) {
        await fs.writeFile(path.resolve(process.cwd(), outputPath), output, "utf-8");
        console.log(`改善されたスライドを ${outputPath} に保存しました`);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("エラーが発生しました:", error);
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

    try {
      // 出力ディレクトリを作成
      await fs.mkdir(outputDir, { recursive: true });

      // 生成
      const slidePath = path.join(outputDir, `${basename}-slide.md`);
      console.log(`スライドを生成中...`);
      const generateCmd = `bun run ${path.join(
        __dirname,
        "generate.ts"
      )} "${documentPath}" "${slidePath}"`;
      execSync(generateCmd);
      console.log(`スライドを ${slidePath} に生成しました`);

      // 評価
      const evaluationPath = path.join(outputDir, `${basename}-evaluation.md`);
      console.log(`スライドを評価中...`);
      const evaluateCmd = `bun run ${path.join(
        __dirname,
        "evaluation.ts"
      )} "${documentPath}" "${slidePath}"`;
      const evaluation = execSync(evaluateCmd).toString();
      await fs.writeFile(evaluationPath, evaluation, "utf-8");
      console.log(`評価結果を ${evaluationPath} に保存しました`);

      // 改善
      const improvedSlidePath = path.join(outputDir, `${basename}-improved-slide.md`);
      console.log(`スライドを改善中...`);
      const improveCmd = `bun run ${path.join(
        __dirname,
        "improve.ts"
      )} "${documentPath}" "${slidePath}" "${evaluationPath}"`;
      const improvedSlide = execSync(improveCmd).toString();
      await fs.writeFile(improvedSlidePath, improvedSlide, "utf-8");
      console.log(`改善されたスライドを ${improvedSlidePath} に保存しました`);

      console.log("ワークフロー完了！");
    } catch (error) {
      console.error("エラーが発生しました:", error);
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
    try {
      const { output, format, theme } = options;
      if (!output) {
        throw new Error("出力ファイルパスを指定してください");
      }
      if (!format || !["pdf", "html", "pptx"].includes(format)) {
        throw new Error("有効な出力形式（pdf, html, pptx）を指定してください");
      }

      console.log(`スライドを ${format} 形式でエクスポート中...`);

      await exportMarpSlide({
        input: slidePath,
        output,
        format: format as "pdf" | "html" | "pptx",
        theme
      });
    } catch (error) {
      console.error("エラーが発生しました:", error);
      process.exit(1);
    }
  });

program
  .command("preview")
  .description("Marpスライドをブラウザでプレビュー")
  .argument("<slide-path>", "Marpスライドのパス")
  .action(async (slidePath: string) => {
    try {
      console.log("スライドをプレビュー中...");
      await previewMarpSlide(slidePath);
    } catch (error) {
      console.error("エラーが発生しました:", error);
      process.exit(1);
    }
  });

program
  .command("theme")
  .description("Marpスライドにテーマを適用")
  .argument("<slide-path>", "Marpスライドのパス")
  .argument("<theme-name>", "適用するテーマ名")
  .action(async (slidePath: string, themeName: string) => {
    try {
      console.log(`テーマ '${themeName}' を適用中...`);
      await applyCustomTheme(slidePath, themeName);
      console.log("テーマを適用しました");
    } catch (error) {
      console.error("エラーが発生しました:", error);
      process.exit(1);
    }
  });

program
  .command("add-meta")
  .description("Marpスライドにメタデータを追加")
  .argument("<slide-path>", "Marpスライドのパス")
  .option("-t, --title <title>", "プレゼンテーションのタイトル")
  .option("-a, --author <author>", "著者名")
  .action(async (slidePath: string, options: CommandOptions) => {
    try {
      const frontMatter: Record<string, any> = {
        marp: true
      };

      if (options.title) frontMatter.title = options.title;
      if (options.author) frontMatter.author = options.author;
      if (options.theme) frontMatter.theme = options.theme;

      console.log("メタデータを追加中...");
      await addFrontMatter(slidePath, frontMatter);
      console.log("メタデータを追加しました");
    } catch (error) {
      console.error("エラーが発生しました:", error);
      process.exit(1);
    }
  });

// メイン関数をエクスポート
export async function main(args: string[] = process.argv.slice(2)): Promise<any> {
  // Commanderの動作モードをテストモードに設定して、parseAsyncが処理を終了させないようにする
  program.exitOverride();
  try {
    return await program.parseAsync(args, { from: 'user' });
  } catch (error: any) {
    if (error.code === 'commander.helpDisplayed' || error.code === 'commander.unknownOption') {
      // ヘルプ表示やオプションエラーの場合はそのまま表示を許可
      return;
    }
    throw error;
  }
}

// スクリプトが直接実行された場合のみparse()を実行
if (import.meta.main) {
  program.parse();
}

#!/usr/bin/env bun
import { program } from "commander";
import path from "path";
import { execSync } from "child_process";
import * as fs from "fs/promises";
import { previewMarpSlide } from "./utils.js";

interface CommandOptions {
  output?: string;
  zundaCharacter?: string;
  tsumugiCharacter?: string;
  outputDir?: string;
}

program
  .name("zunda-notes")
  .description("Marpスライドにずんだもんと春日部つむぎの会話形式プレゼンターノートを追加するツール")
  .version("0.1.0");

program
  .command("add")
  .description("Marpスライドの各ページにずんだもんと春日部つむぎの会話形式の解説を追加")
  .argument("<slide-path>", "Marpスライドのパス")
  .argument("[document-path]", "元の参考資料のパス（オプション）")
  .option("-o, --output <path>", "出力ファイルパス")
  .option("--zunda-character <name>", "ずんだもんキャラクター名", "ずんだもん")
  .option("--tsumugi-character <name>", "春日部つむぎキャラクター名", "春日部つむぎ")
  .action(async (slidePath: string, documentPath: string | undefined, options: CommandOptions) => {
    const outputPath = options.output || slidePath.replace(/\.md$/, "-with-notes.md");
    const zundaCharacter = options.zundaCharacter || "ずんだもん";
    const tsumugiCharacter = options.tsumugiCharacter || "春日部つむぎ";

    const cmd = `bun run ${path.join(__dirname, "add-notes.ts")} "${slidePath}" ${
      documentPath ? `"${documentPath}"` : "\"\""
    } "${outputPath}" "${zundaCharacter}" "${tsumugiCharacter}"`;

    try {
      console.log("プレゼンターノートを追加中...");
      execSync(cmd);
      console.log(`ずんだもん＆春日部つむぎの会話形式プレゼンターノートを追加したスライドを ${outputPath} に保存しました`);
    } catch (error) {
      console.error("エラーが発生しました:", error);
      process.exit(1);
    }
  });

program
  .command("evaluate")
  .description("ずんだもんと春日部つむぎの会話形式プレゼンターノートを評価")
  .argument("<slide-path>", "元のMarpスライドのパス")
  .argument("<notes-slide-path>", "プレゼンターノート付きMarpスライドのパス")
  .option("-o, --output <path>", "評価結果の出力パス")
  .action(async (slidePath: string, notesPath: string, options: CommandOptions) => {
    const outputPath = options.output;
    const cmd = `bun run ${path.join(__dirname, "evaluation.ts")} "${slidePath}" "${notesPath}"`;

    try {
      console.log("プレゼンターノートを評価中...");
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
  .description("評価に基づいてプレゼンターノートを改善")
  .argument("<slide-path>", "元のMarpスライドのパス")
  .argument("<notes-slide-path>", "プレゼンターノート付きMarpスライドのパス")
  .argument("<evaluation-path>", "評価結果のパス")
  .option("-o, --output <path>", "改善されたスライドの出力パス")
  .action(async (slidePath: string, notesPath: string, evaluationPath: string, options: CommandOptions) => {
    const outputPath = options.output || notesPath.replace(/\.md$/, "-improved.md");
    const cmd = `bun run ${path.join(__dirname, "improve.ts")} "${slidePath}" "${notesPath}" "${evaluationPath}"`;

    try {
      console.log("プレゼンターノートを改善中...");
      const output = execSync(cmd).toString();

      await fs.writeFile(path.resolve(process.cwd(), outputPath), output, "utf-8");
      console.log(`改善されたプレゼンターノートを ${outputPath} に保存しました`);
    } catch (error) {
      console.error("エラーが発生しました:", error);
      process.exit(1);
    }
  });

program
  .command("workflow")
  .description("プレゼンターノートの追加、評価、改善の一連の流れを実行")
  .argument("<slide-path>", "Marpスライドのパス")
  .argument("[document-path]", "元の参考資料のパス（オプション）")
  .option("-o, --output-dir <directory>", "出力ディレクトリ", "output")
  .option("--zunda-character <name>", "ずんだもんキャラクター名", "ずんだもん")
  .option("--tsumugi-character <name>", "春日部つむぎキャラクター名", "春日部つむぎ")
  .action(async (slidePath: string, documentPath: string | undefined, options: CommandOptions) => {
    const outputDir = options.outputDir || "output";
    const basename = path.basename(slidePath, path.extname(slidePath));
    const zundaCharacter = options.zundaCharacter || "ずんだもん";
    const tsumugiCharacter = options.tsumugiCharacter || "春日部つむぎ";

    try {
      // 出力ディレクトリを作成
      await fs.mkdir(outputDir, { recursive: true });

      // プレゼンターノート追加
      const notesPath = path.join(outputDir, `${basename}-with-notes.md`);
      console.log(`プレゼンターノートを追加中...`);
      const addCmd = `bun run ${path.join(__dirname, "add-notes.ts")} "${slidePath}" ${
        documentPath ? `"${documentPath}"` : "\"\""
      } "${notesPath}" "${zundaCharacter}" "${tsumugiCharacter}"`;
      execSync(addCmd);
      console.log(`プレゼンターノートを ${notesPath} に生成しました`);

      // 評価
      const evaluationPath = path.join(outputDir, `${basename}-evaluation.md`);
      console.log(`プレゼンターノートを評価中...`);
      const evaluateCmd = `bun run ${path.join(__dirname, "evaluation.ts")} "${slidePath}" "${notesPath}"`;
      const evaluation = execSync(evaluateCmd).toString();
      await fs.writeFile(evaluationPath, evaluation, "utf-8");
      console.log(`評価結果を ${evaluationPath} に保存しました`);

      // 改善
      const improvedPath = path.join(outputDir, `${basename}-improved.md`);
      console.log(`プレゼンターノートを改善中...`);
      const improveCmd = `bun run ${path.join(__dirname, "improve.ts")} "${slidePath}" "${notesPath}" "${evaluationPath}"`;
      const improved = execSync(improveCmd).toString();
      await fs.writeFile(improvedPath, improved, "utf-8");
      console.log(`改善されたプレゼンターノートを ${improvedPath} に保存しました`);

      console.log("ワークフロー完了！");
    } catch (error) {
      console.error("エラーが発生しました:", error);
      process.exit(1);
    }
  });

program
  .command("preview")
  .description("Marpスライドをプレビュー表示")
  .argument("<slide-path>", "プレビューするMarpスライドのパス")
  .action(async (slidePath: string) => {
    try {
      console.log(`${slidePath} をプレビュー中...`);
      await previewMarpSlide(slidePath);
    } catch (error) {
      console.error("プレビューに失敗しました:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);

#!/usr/bin/env bun
import { execSync } from "child_process";
import * as fs from "fs/promises";
import path from "path";
import { program } from "commander";

program
  .name("zundamonizer-workflow")
  .description("マークダウン資料からMarpスライド生成、ずんだもん会話形式ノート追加まで一気通貫で実行")
  .argument("<document-path>", "元のマークダウン資料のパス")
  .option("-o, --output-dir <directory>", "出力ディレクトリ", "zundamonizer-output")
  .option("--slide-title <title>", "スライドのタイトル（指定しない場合はファイル名）")
  .option("--zunda-character <n>", "ずんだもんキャラクター名", "ずんだもん")
  .option("--tsumugi-character <n>", "春日部つむぎキャラクター名", "春日部つむぎ")
  .parse(process.argv);

const options = program.opts();
const documentPath = program.args[0];

if (!documentPath) {
  console.error("エラー: マークダウン資料のパスを指定してください");
  process.exit(1);
}

// 入力ファイル名からベース名を取得
const basename = path.basename(documentPath, path.extname(documentPath));
const outputDir = options.outputDir;
const slideTitle = options.slideTitle || basename;
const zundaCharacter = options.zundaCharacter;
const tsumugiCharacter = options.tsumugiCharacter;

// 入力と出力の絶対パスを取得
const rootDir = process.cwd();
const documentAbsPath = path.resolve(rootDir, documentPath);

// 出力パスを設定
const marpifyOutputDir = path.join(outputDir, "01_marpify");
const slidePath = path.join(marpifyOutputDir, `${basename}-slide.md`);
const slideAbsPath = path.resolve(rootDir, slidePath);

const zundaNotesOutputDir = path.join(outputDir, "02_zunda-notes");
const withNotesPath = path.join(zundaNotesOutputDir, `${basename}-with-notes.md`);
const withNotesAbsPath = path.resolve(rootDir, withNotesPath);

const evaluationPath = path.join(zundaNotesOutputDir, `${basename}-evaluation.md`);
const evaluationAbsPath = path.resolve(rootDir, evaluationPath);

const improvedPath = path.join(zundaNotesOutputDir, `${basename}-improved.md`);
const improvedAbsPath = path.resolve(rootDir, improvedPath);

async function main() {
  try {
    // 出力ディレクトリを作成
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(marpifyOutputDir, { recursive: true });
    await fs.mkdir(zundaNotesOutputDir, { recursive: true });

    console.log("===================================");
    console.log("ずんだもナイザーワークフロー開始！");
    console.log("===================================");
    console.log(`入力資料: ${documentPath}`);
    console.log(`出力ディレクトリ: ${outputDir}`);
    console.log("");

    // ステップ1: marpifyでスライド生成
    console.log("ステップ1: マークダウン資料からMarpスライドを生成中...");
    const marpifyCmd = `cd packages/marpify && bun cli.ts generate "${documentAbsPath}" -o "${slideAbsPath}"`;
    execSync(marpifyCmd, { stdio: "inherit" });
    console.log(`✅ Marpスライドを ${slidePath} に生成しました`);
    console.log("");

    // ステップ2: zunda-notesでプレゼンターノート追加
    console.log("ステップ2: Marpスライドにずんだもんと春日部つむぎの会話形式プレゼンターノートを追加中...");
    const zundaNotesCmd = `cd packages/zunda-notes && bun cli.ts add "${slideAbsPath}" "${documentAbsPath}" -o "${withNotesAbsPath}" --zunda-character "${zundaCharacter}" --tsumugi-character "${tsumugiCharacter}"`;
    execSync(zundaNotesCmd, { stdio: "inherit" });
    console.log(`✅ プレゼンターノートを追加したスライドを ${withNotesPath} に生成しました`);
    console.log("");

    // ステップ3: プレゼンターノートを評価
    console.log("ステップ3: プレゼンターノートを評価中...");
    const evaluateCmd = `cd packages/zunda-notes && bun cli.ts evaluate "${slideAbsPath}" "${withNotesAbsPath}" -o "${evaluationAbsPath}"`;
    execSync(evaluateCmd, { stdio: "inherit" });
    console.log(`✅ 評価結果を ${evaluationPath} に保存しました`);
    console.log("");

    // ステップ4: プレゼンターノートを改善
    console.log("ステップ4: プレゼンターノートを改善中...");
    const improveCmd = `cd packages/zunda-notes && bun cli.ts improve "${slideAbsPath}" "${withNotesAbsPath}" "${evaluationAbsPath}" -o "${improvedAbsPath}"`;
    execSync(improveCmd, { stdio: "inherit" });
    console.log(`✅ 改善されたプレゼンターノートを ${improvedPath} に保存しました`);
    console.log("");

    console.log("===================================");
    console.log("ずんだもナイザーワークフロー完了！");
    console.log("===================================");
    console.log("生成されたファイル:");
    console.log(`1. Marpスライド: ${slidePath}`);
    console.log(`2. プレゼンターノート付きスライド: ${withNotesPath}`);
    console.log(`3. 評価結果: ${evaluationPath}`);
    console.log(`4. 改善版スライド: ${improvedPath}`);
    console.log("");
    console.log("改善版スライドをプレビューするには:");
    console.log(`cd packages/zunda-notes && bun cli.ts preview "${improvedAbsPath}"`);

  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

main();

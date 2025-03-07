#!/usr/bin/env bun
import * as fs from "fs/promises";
import path from "path";
import { program } from "commander";

// 各パッケージのmain関数をインポート
import { main as marpifyMain } from "../packages/marpify/cli.ts";
import { main as addNotesMain } from "../packages/zunda-notes/add-notes.ts";
import { main as evaluateMain } from "../packages/zunda-notes/evaluation.ts";
import { main as improveMain } from "../packages/zunda-notes/improve.ts";

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
    try {
      // marpify の generate.ts を直接呼び出す
      // 現在のディレクトリを保存
      const originalDir = process.cwd();

      // パスを絶対パスに変換
      const absoluteDocumentPath = path.resolve(originalDir, documentPath);
      const absoluteOutputPath = path.resolve(originalDir, slidePath);

      process.chdir(path.join(rootDir, "packages/marpify"));
      const { main: generateMain } = await import("../packages/marpify/generate.ts");
      await generateMain([absoluteDocumentPath, absoluteOutputPath]);

      // 元のディレクトリに戻る
      process.chdir(originalDir);
      console.log(`✅ Marpスライドを ${slidePath} に生成しました`);
      console.log("");
    } catch (error) {
      console.error("ステップ1でエラーが発生しました:", error);
      process.exit(1);
    }

    // ステップ2: zunda-notesでプレゼンターノート追加
    console.log("ステップ2: Marpスライドにずんだもんと春日部つむぎの会話形式プレゼンターノートを追加中...");
    try {
      // 現在のディレクトリを保存
      const originalDir = process.cwd();

      // パスを絶対パスに変換
      const absoluteSlideAbsPath = path.resolve(originalDir, slideAbsPath);
      const absoluteDocumentAbsPath = path.resolve(originalDir, documentAbsPath);
      const absoluteWithNotesAbsPath = path.resolve(originalDir, withNotesAbsPath);

      process.chdir(path.join(rootDir, "packages/zunda-notes"));
      await addNotesMain([absoluteSlideAbsPath, absoluteDocumentAbsPath, absoluteWithNotesAbsPath, zundaCharacter, tsumugiCharacter]);

      // 元のディレクトリに戻る
      process.chdir(originalDir);
      console.log(`✅ プレゼンターノートを追加したスライドを ${withNotesPath} に生成しました`);
      console.log("");
    } catch (error) {
      console.error("ステップ2でエラーが発生しました:", error);
      process.exit(1);
    }

    // ステップ3: プレゼンターノートを評価
    console.log("ステップ3: プレゼンターノートを評価中...");
    try {
      // 現在のディレクトリを保存
      const originalDir = process.cwd();

      // パスを絶対パスに変換
      const absoluteSlideAbsPath = path.resolve(originalDir, slideAbsPath);
      const absoluteWithNotesAbsPath = path.resolve(originalDir, withNotesAbsPath);
      const absoluteEvaluationAbsPath = path.resolve(originalDir, evaluationAbsPath);

      process.chdir(path.join(rootDir, "packages/zunda-notes"));
      const evaluation = await evaluateMain([absoluteSlideAbsPath, absoluteWithNotesAbsPath]);
      await fs.writeFile(absoluteEvaluationAbsPath, evaluation, "utf-8");

      // 元のディレクトリに戻る
      process.chdir(originalDir);
      console.log(`✅ 評価結果を ${evaluationPath} に保存しました`);
      console.log("");
    } catch (error) {
      console.error("ステップ3でエラーが発生しました:", error);
      process.exit(1);
    }

    // ステップ4: プレゼンターノートを改善
    console.log("ステップ4: プレゼンターノートを改善中...");
    try {
      // 現在のディレクトリを保存
      const originalDir = process.cwd();

      // パスを絶対パスに変換
      const absoluteSlideAbsPath = path.resolve(originalDir, slideAbsPath);
      const absoluteWithNotesAbsPath = path.resolve(originalDir, withNotesAbsPath);
      const absoluteEvaluationAbsPath = path.resolve(originalDir, evaluationAbsPath);
      const absoluteImprovedAbsPath = path.resolve(originalDir, improvedAbsPath);

      process.chdir(path.join(rootDir, "packages/zunda-notes"));
      const improved = await improveMain([absoluteSlideAbsPath, absoluteWithNotesAbsPath, absoluteEvaluationAbsPath]);
      await fs.writeFile(absoluteImprovedAbsPath, improved, "utf-8");

      // 元のディレクトリに戻る
      process.chdir(originalDir);
      console.log(`✅ 改善されたプレゼンターノートを ${improvedPath} に保存しました`);
      console.log("");
    } catch (error) {
      console.error("ステップ4でエラーが発生しました:", error);
      process.exit(1);
    }

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

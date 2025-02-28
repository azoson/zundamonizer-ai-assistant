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
      // パスを絶対パスに変換
      const absoluteDocumentPath = path.resolve(rootDir, documentPath);
      const absoluteOutputPath = path.resolve(rootDir, slidePath);

      console.log(`入力ファイル: ${absoluteDocumentPath}`);
      console.log(`出力ファイル: ${absoluteOutputPath}`);

      // ディレクトリを変更せずに直接generateMainを呼び出す
      const { main: generateMain } = await import("../packages/marpify/generate.ts");

      // ESM環境でのコマンドライン引数の処理のため、プロセスの引数を一時的に変更
      const originalArgs = process.argv;
      process.argv = [process.argv[0], process.argv[1], absoluteDocumentPath, absoluteOutputPath];

      try {
        await generateMain();
      } finally {
        // 元の引数に戻す
        process.argv = originalArgs;
      }

      console.log(`✅ Marpスライドを ${slidePath} に生成しました`);
      console.log("");
    } catch (error) {
      console.error("ステップ1でエラーが発生しました:", error);
      process.exit(1);
    }

    // ステップ2: zunda-notesでプレゼンターノート追加
    console.log("ステップ2: Marpスライドにずんだもんと春日部つむぎの会話形式プレゼンターノートを追加中...");
    try {
      // パスを絶対パスに変換
      const absoluteSlideAbsPath = path.resolve(rootDir, slideAbsPath);
      const absoluteDocumentAbsPath = path.resolve(rootDir, documentAbsPath);
      const absoluteWithNotesAbsPath = path.resolve(rootDir, withNotesAbsPath);

      console.log(`スライドファイル: ${absoluteSlideAbsPath}`);
      console.log(`元資料ファイル: ${absoluteDocumentAbsPath}`);
      console.log(`出力ファイル: ${absoluteWithNotesAbsPath}`);

      // addNotesMainを直接呼び出す
      const { main: addNotes } = await import("../packages/zunda-notes/add-notes.ts");

      // 引数を一時的に変更
      const originalArgs = process.argv;
      process.argv = [
        process.argv[0],
        process.argv[1],
        absoluteSlideAbsPath,
        absoluteDocumentAbsPath,
        absoluteWithNotesAbsPath,
        zundaCharacter,
        tsumugiCharacter
      ];

      try {
        await addNotes(process.argv.slice(2));
      } finally {
        // 元の引数に戻す
        process.argv = originalArgs;
      }

      console.log(`✅ プレゼンターノートを追加したスライドを ${withNotesPath} に生成しました`);
      console.log("");
    } catch (error) {
      console.error("ステップ2でエラーが発生しました:", error);
      process.exit(1);
    }

    // ステップ3: プレゼンターノートを評価
    console.log("ステップ3: プレゼンターノートを評価中...");
    try {
      // パスを絶対パスに変換
      const absoluteSlideAbsPath = path.resolve(rootDir, slideAbsPath);
      const absoluteWithNotesAbsPath = path.resolve(rootDir, withNotesAbsPath);
      const absoluteEvaluationAbsPath = path.resolve(rootDir, evaluationAbsPath);

      console.log(`スライドファイル: ${absoluteSlideAbsPath}`);
      console.log(`ノート付きファイル: ${absoluteWithNotesAbsPath}`);
      console.log(`評価結果出力先: ${absoluteEvaluationAbsPath}`);

      // 評価関数を直接呼び出す
      const { main: evaluate } = await import("../packages/zunda-notes/evaluation.ts");

      // 引数を一時的に変更
      const originalArgs = process.argv;
      process.argv = [
        process.argv[0],
        process.argv[1],
        absoluteSlideAbsPath,
        absoluteWithNotesAbsPath
      ];

      try {
        const evaluation = await evaluate(process.argv.slice(2));
        await fs.writeFile(absoluteEvaluationAbsPath, evaluation, "utf-8");
      } finally {
        // 元の引数に戻す
        process.argv = originalArgs;
      }

      console.log(`✅ 評価結果を ${evaluationPath} に保存しました`);
      console.log("");
    } catch (error) {
      console.error("ステップ3でエラーが発生しました:", error);
      process.exit(1);
    }

    // ステップ4: プレゼンターノートを改善
    console.log("ステップ4: プレゼンターノートを改善中...");
    try {
      // パスを絶対パスに変換
      const absoluteSlideAbsPath = path.resolve(rootDir, slideAbsPath);
      const absoluteWithNotesAbsPath = path.resolve(rootDir, withNotesAbsPath);
      const absoluteEvaluationAbsPath = path.resolve(rootDir, evaluationAbsPath);
      const absoluteImprovedAbsPath = path.resolve(rootDir, improvedAbsPath);

      console.log(`スライドファイル: ${absoluteSlideAbsPath}`);
      console.log(`ノート付きファイル: ${absoluteWithNotesAbsPath}`);
      console.log(`評価結果ファイル: ${absoluteEvaluationAbsPath}`);
      console.log(`改善結果出力先: ${absoluteImprovedAbsPath}`);

      // 改善関数を直接呼び出す
      const { main: improve } = await import("../packages/zunda-notes/improve.ts");

      // 引数を一時的に変更
      const originalArgs = process.argv;
      process.argv = [
        process.argv[0],
        process.argv[1],
        absoluteSlideAbsPath,
        absoluteWithNotesAbsPath,
        absoluteEvaluationAbsPath
      ];

      try {
        const improved = await improve(process.argv.slice(2));
        await fs.writeFile(absoluteImprovedAbsPath, improved, "utf-8");
      } finally {
        // 元の引数に戻す
        process.argv = originalArgs;
      }

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

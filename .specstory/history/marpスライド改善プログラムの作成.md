## SpecStory

## Marpスライド改善プログラムの作成 (2025/2/25 6:58:56)

_**User**_

openai 使って markdown 形式のスライド（marp）を改善するクンを作りたい。
叩き用意してもらえますか。

---

_**Assistant**_

OpenAIを使ってMarpスライドを改善するプログラムを作成しましょう。基本的な構造を提案させていただきます。

まず、必要なパッケージをインストールする必要があります：

```typescript:index.ts
// ... existing code ...

import { OpenAI } from 'openai';
import * as fs from 'fs/promises';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function improveMarpSlide(markdownContent: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "あなたはMarpスライドの改善スペシャリストです。与えられたマークダウンスライドを以下の点で改善してください：\n- より明確な表現\n- 視覚的な改善提案\n- 構造の最適化\n- 文法やスペルの修正"
        },
        {
          role: "user",
          content: markdownContent
        }
      ],
    });

    return completion.choices[0].message.content || markdownContent;
  } catch (error) {
    console.error('エラーが発生しました:', error);
    return markdownContent;
  }
}

async function main() {
  try {
    const inputFile = process.argv[2];
    if (!inputFile) {
      throw new Error('入力ファイルを指定してください');
    }

    const markdownContent = await fs.readFile(inputFile, 'utf-8');
    const improvedContent = await improveMarpSlide(markdownContent);
    
    const outputFile = inputFile.replace('.md', '_improved.md');
    await fs.writeFile(outputFile, improvedContent);
    
    console.log(`改善されたスライドを ${outputFile} に保存しました`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
```

また、必要な依存関係を追加する必要があります：

```json:package.json
{
  "name": "marp-improver",
  "module": "index.ts",
  "type": "module",
  "dependencies": {
    "openai": "^4.28.0"
  },
  "devDependencies": {
    "bun-types": "latest"
  },
  "peerDependencies": {
    "typescript": "^5.0.0"
  }
}
```

環境変数の設定も必要です：

```bash:.envrc
export OPENAI_API_KEY="your-api-key-here"
```

このプログラムの使い方：

1. 必要なパッケージをインストール：
```bash
bun install
```

2. 実行：
```bash
bun run index.ts your-slide.md
```

このプログラムは以下の機能を提供します：

1. Marpスライドのマークダウンファイルを読み込み
2. OpenAI APIを使用してコンテンツを改善
3. 改善されたバージョンを新しいファイルとして保存

必要に応じて、以下のような機能を追加することもできます：

- スライドのプレビュー機能
- 特定のスタイルやテーマの提案
- 画像の最適化提案
- アクセシビリティの改善提案

これをベースに、具体的なニーズに合わせてカスタマイズすることができます。

---

_**User**_

@evaluation.ts を元に、以下の prompt を使う「フィードバック反映用の ts ファイル」を作って欲しい

---
あなたはプレゼンテーションのスライドを作成するプロフェッショナルです。
指定された資料の内容とそれを表現するスライドコンテンツについて、
ユーザーからフィードバックを受け取り、スライドの内容を改善してください。

スライドには以下の Marp 形式が利用可能です:
${marpDescription}

資料は以下です:
\`\`\`
${contents}
\`\`\`

スライドは以下です:
\`\`\`
${script}
\`\`\`

フィードバックは以下です:
\`\`\`
${feedback}
\`\`\`

改善後のスライドの内容を出力してください。
改善時には、各ページに画像が 0~1 つのみ含まれている状態にしてください。
出力にはフロントマターを含めないでください。
出力の冒頭・末尾にはコードブロック宣言（\`\`\`）を含めないでください。
出力にはスライド内容のみを含めてください。

---

_**Assistant**_

フィードバックを反映してスライドを改善するプログラムを作成します。

```typescript:improve.ts
import { OpenAI } from "openai";
import * as fs from "fs/promises";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MARP_DESCRIPTION = `
- ページの区切りは "---" を使用
- 画像の挿入は "![](画像パス)" を使用
- 背景画像の設定は "![bg](画像パス)" を使用
- テキストの位置調整は "<!-- _class: center -->" などを使用
`;

async function improveSlideWithFeedback(
  markdownContent: string,
  slideMarkdown: string,
  feedback: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `あなたはプレゼンテーションのスライドを作成するプロフェッショナルです。
指定された資料の内容とそれを表現するスライドコンテンツについて、
ユーザーからフィードバックを受け取り、スライドの内容を改善してください。

スライドには以下の Marp 形式が利用可能です:
${MARP_DESCRIPTION}`,
      },
      {
        role: "user",
        content: `
資料は以下です:
\`\`\`
${markdownContent}
\`\`\`

スライドは以下です:
\`\`\`
${slideMarkdown}
\`\`\`

フィードバックは以下です:
\`\`\`
${feedback}
\`\`\`

改善後のスライドの内容を出力してください。
改善時には、各ページに画像が 0~1 つのみ含まれている状態にしてください。
出力にはフロントマターを含めないでください。
出力の冒頭・末尾にはコードブロック宣言（\`\`\`）を含めないでください。
出力にはスライド内容のみを含めてください。`,
      },
    ],
  });

  const result = response.choices[0]?.message?.content;
  if (!result) {
    throw new Error("スライドの改善に失敗しました");
  }

  return result;
}

async function main() {
  try {
    const documentFilePath = process.argv[2];
    const slidesFilePath = process.argv[3];
    const feedbackFilePath = process.argv[4];
    
    if (!documentFilePath || !slidesFilePath || !feedbackFilePath) {
      throw new Error(
        "Usage: bun run improve.ts <document-file-path> <slides-file-path> <feedback-file-path>"
      );
    }

    const markdownContent = await fs.readFile(
      path.resolve(process.cwd(), documentFilePath),
      "utf-8"
    );
    const slideMarkdown = await fs.readFile(
      path.resolve(process.cwd(), slidesFilePath),
      "utf-8"
    );
    const feedback = await fs.readFile(
      path.resolve(process.cwd(), feedbackFilePath),
      "utf-8"
    );

    const improvedSlide = await improveSlideWithFeedback(
      markdownContent,
      slideMarkdown,
      feedback
    );

    const outputPath = slidesFilePath.replace('.md', '_improved.md');
    await fs.writeFile(outputPath, improvedSlide);
    
    console.log(`改善されたスライドを ${outputPath} に保存しました`);
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

main();
```

このプログラムの特徴：

1. 3つの入力ファイルを受け取ります：
   - 元の資料（マークダウン）
   - 現在のスライド内容
   - フィードバック内容

2. OpenAI APIを使用してスライドを改善します

3. 改善されたスライドは元のファイル名に `_improved` を付加して保存されます

使用方法：

```bash
bun run improve.ts document.md slides.md feedback.md
```

注意点：
- GPT-4を使用していますが、必要に応じて他のモデルに変更可能です
- Marpの記法説明は `MARP_DESCRIPTION` 定数で管理しており、必要に応じて更新可能です
- 出力されるスライドは、各ページに画像が0〜1つという制約を守るように指示しています

---



---


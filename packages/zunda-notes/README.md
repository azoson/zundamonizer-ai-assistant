# ずんだノーツ（Zunda Notes）

Marpスライドの各ページに、ずんだもんと春日部つむぎのかけあい形式でプレゼンターノートを自動生成・追加するツールです。

## 機能

- Marpフォーマットのマークダウンスライドを解析し、各ページにずんだもんと春日部つむぎの会話形式の解説を追加
- 元の資料（オプション）を参考にしながら、より詳細な説明を生成
- ずんだもんと春日部つむぎの掛け合いによる、わかりやすい解説をコメント形式で作成
- プレゼンターノートとしてスライドに埋め込み、発表時の参考資料として利用可能
- 生成したプレゼンターノートの品質を評価し、改善することができます
- キャラクター設定が一元管理されており、カスタマイズが容易です

## 出力形式

会話形式のプレゼンターノートは以下のようなコメント形式で出力されます：

```markdown
<!-- ずんだもん(happy): このスライドではAIの基本概念について説明するのだ！ -->
<!-- 春日部つむぎ(neutral): 具体的にはどのような内容ですの？ -->
<!-- ずんだもん(neutral): 機械学習、ディープラーニング、自然言語処理の違いについて解説するのだ -->
<!-- 春日部つむぎ(happy): なるほど、聴衆にとって重要なポイントですわね -->
```

## キャラクター設定

キャラクター設定は `character-settings.ts` ファイルで一元管理されています。以下の設定が定義されています：

### ずんだもん
- 語尾：「〜のだ」「〜なのだ」
- 性格：明るく元気な口調
- 説明スタイル：親しみやすく簡潔に、例え話を使って説明

### 春日部つむぎ
- 語尾：「〜ですわ」「〜ですの」
- 性格：上品で丁寧な口調
- 説明スタイル：論理的で体系だった説明

キャラクター設定をカスタマイズする場合は、`character-settings.ts` ファイルを編集するか、コマンドライン引数で名前を変更できます。

## インストール

このツールはずんだもナイザーAIアシスタントの一部として提供されています。

```bash
# リポジトリのクローン
git clone <repository-url>
cd zundamonizer-ai-assistant

# 依存関係のインストール
bun install
```

## 使い方

### プレゼンターノートの追加

```bash
# ルートディレクトリからの実行
bun zunda-notes add path/to/slide.md -o output/slide-with-notes.md

# 元の資料を指定してより詳細な解説を生成
bun zunda-notes add path/to/slide.md path/to/original-document.md -o output/slide-with-notes.md

# キャラクター名をカスタマイズ
bun zunda-notes add path/to/slide.md --zunda-character "ずんだもん" --tsumugi-character "春日部つむぎ"
```

### プレゼンターノートの評価

プレゼンターノートの品質を評価します。評価結果は会話形式で出力され、改善点も提案されます。

```bash
# プレゼンターノートを評価
bun zunda-notes evaluate original-slide.md slide-with-notes.md -o evaluation.md
```

### プレゼンターノートの改善

評価結果に基づいてプレゼンターノートを改善します。

```bash
# 評価結果に基づいて改善
bun zunda-notes improve original-slide.md slide-with-notes.md evaluation.md -o improved-slide.md
```

### ワークフロー（一連の流れを実行）

プレゼンターノートの追加、評価、改善までの一連の流れを一度に実行します。

```bash
# 一連のワークフローを実行
bun zunda-notes workflow path/to/slide.md -o output-directory

# 元の資料も指定
bun zunda-notes workflow path/to/slide.md path/to/original-document.md -o output-directory
```

### スライドのプレビュー

```bash
# 生成したスライドをプレビュー
bun zunda-notes preview output/slide-with-notes.md
```

## オプション

- `-o, --output <path>` - 出力ファイルパスを指定
- `--zunda-character <name>` - ずんだもんキャラクターの名前をカスタマイズ (デフォルト: "ずんだもん")
- `--tsumugi-character <name>` - 春日部つむぎキャラクターの名前をカスタマイズ (デフォルト: "春日部つむぎ")
- `-o, --output-dir <directory>` - ワークフロー実行時の出力ディレクトリを指定 (デフォルト: "output")

## 必要環境

- Node.js v14以上
- Bun v1.0.0以上
- OpenAI API キー（環境変数 `OPENAI_API_KEY` に設定）
- Marp CLI（プレビュー機能を使用する場合）

## 使用例

### 基本的な使用例

1. Marpスライドを用意
2. `bun zunda-notes add slide.md -o slide-with-notes.md` を実行
3. 生成されたスライドには各ページにずんだもんと春日部つむぎのかけあい形式の解説が追加されています
4. プレゼンテーションソフトでスライドを開き、プレゼンターノートとして参照できます

### 評価と改善

1. `bun zunda-notes evaluate slide.md slide-with-notes.md -o evaluation.md` で評価
2. `bun zunda-notes improve slide.md slide-with-notes.md evaluation.md -o improved-slide.md` で改善
3. 改善されたスライドを確認し、必要に応じて再度評価・改善を行います

### ワークフロー

1. `bun zunda-notes workflow slide.md -o output` を実行
2. output ディレクトリに下記ファイルが生成されます：
   - slide-with-notes.md：プレゼンターノート付きスライド
   - slide-evaluation.md：評価結果
   - slide-improved.md：改善されたスライド

## ライセンス

MIT

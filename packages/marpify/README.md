# Marpify

マークダウン形式の文章資料から[Marp](https://marp.app/)形式のスライドを生成・改善するためのツール群です。

## 機能

- 文章資料から自動的にMarpスライドを生成
- 既存のスライドを評価し、改善点を提示
- フィードバックに基づいてスライドを改善
- スライドのPDF・HTML・PPTXへのエクスポート
- プレビュー、テーマの適用などの便利な機能

## インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd marpify

# 依存関係のインストール
bun install

# CLIコマンドのリンク作成（任意）
bun link
```

Marpへのエクスポート機能を使用する場合は、別途marp-cliのインストールが必要です：

```bash
npm install -g @marp-team/marp-cli
```

## 使い方

### マークダウン資料からスライドを生成

```bash
bun start generate path/to/document.md -o output/slides.md
```

### スライドの評価

```bash
bun start evaluate path/to/document.md path/to/slides.md -o output/evaluation.md
```

### フィードバックに基づいてスライドを改善

```bash
bun start improve path/to/document.md path/to/slides.md path/to/feedback.md -o output/improved-slides.md
```

### 生成・評価・改善の一連の流れを実行

```bash
bun start workflow path/to/document.md -o output-directory
```

### PDFにエクスポート

```bash
bun start export path/to/slides.md -o output/slides.pdf -f pdf
```

### HTMLにエクスポート

```bash
bun start export path/to/slides.md -o output/slides.html -f html
```

### PPTXにエクスポート

```bash
bun start export path/to/slides.md -o output/slides.pptx -f pptx
```

### ブラウザでプレビュー

```bash
bun start preview path/to/slides.md
```

### テーマの適用

```bash
bun start theme path/to/slides.md default
```

### メタデータの追加

```bash
bun start add-meta path/to/slides.md --title "プレゼンテーションタイトル" --author "著者名"
```

## ChatGPTでの利用方法

このツールを直接利用できない場合でも、ChatGPTなどのAIチャットサービスを使用して同様の機能を試すことができます。以下にプロンプト例を示します。

### マークダウン資料からMarpスライドを生成するプロンプト

```
以下のマークダウン形式のテキストをMarp形式のスライドに変換してください。各スライドは適切な長さに分割し、見やすく整理してください。

【変換ルール】
1. 各スライドは「---」で区切ってください
2. 最初のスライドにはタイトルと概要を含めてください
3. スライドには適切な見出しレベル（#, ##, ###）を使用してください
4. 箇条書きや図表の指示がある場合は、それらを適切に配置してください
5. 各スライドには過剰な情報を詰め込まないでください
6. 以下のMarpディレクティブをスライドの先頭に追加してください：
   <!-- marp: true -->
   <!-- theme: default -->
   <!-- paginate: true -->
7. 重要な情報は強調（**太字**）で表示してください
8. 適宜、コメントで各スライドの意図を説明してください

【マークダウンテキスト】
ここに変換したいマークダウンテキストを貼り付けてください
```

### スライドを評価するプロンプト

```
以下のMarpスライドを評価し、改善点を指摘してください。元の文章資料も参考にしてください。

【評価項目】
1. 情報の整理と構造化: スライドは適切に情報を整理し、論理的な流れを持っているか
2. 視覚的要素: レイアウト、フォント、間隔などが読みやすく設計されているか
3. コンテンツの簡潔さ: 各スライドは簡潔で、1つのスライドに詰め込みすぎていないか
4. 強調と焦点: 重要なポイントが適切に強調されているか
5. 一貫性: デザインや表現が一貫しているか
6. 情報の網羅性: 元の文章資料の重要な情報がすべて含まれているか

【元の文章資料】
ここに元のマークダウン文章を貼り付けてください

【評価対象のMarpスライド】
ここに評価したいMarpスライドを貼り付けてください
```

### スライドを改善するプロンプト

```
以下のMarpスライドを改善してください。元の文章資料とスライドの評価結果を参考にしてください。

【改善のポイント】
1. 各スライドの情報量を適切に調整し、読みやすくする
2. 視覚的な要素（レイアウト、間隔など）を改善する
3. 重要なポイントを強調する
4. スライド間の一貫性を確保する
5. 元の文章資料の重要な情報が漏れている場合は追加する
6. 専門用語には必要に応じて簡単な説明を加える
7. Marpの機能（ディレクティブ、分割レイアウトなど）を活用して表現を豊かにする

【元の文章資料】
ここに元のマークダウン文章を貼り付けてください

【現在のMarpスライド】
ここに現在のMarpスライドを貼り付けてください

【評価結果】
ここにスライドの評価結果を貼り付けてください
```

## Marpの便利な記法

Marpフォーマットでは以下のような記法が使えます：

- ページの区切り: `---`
- テキストの位置調整: `<div style="text-align: center;">`
- 段組表示: `<div style="display: grid; grid-template-columns: 1fr 1fr;">`
- 画像の挿入: `![alt text](画像URL)`
- 画像サイズ変更: `![alt text](画像URL "=WIDTHxHEIGHT")`

## ライセンス

MIT

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

## Marpの便利な記法

Marpフォーマットでは以下のような記法が使えます：

- ページの区切り: `---`
- テキストの位置調整: `<div style="text-align: center;">`
- 段組表示: `<div style="display: grid; grid-template-columns: 1fr 1fr;">`
- 画像の挿入: `![alt text](画像URL)`
- 画像サイズ変更: `![alt text](画像URL "=WIDTHxHEIGHT")`

## ライセンス

MIT

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

## ライセンス

MIT

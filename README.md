# ずんだもナイザー AI アシスタント

AIを活用した便利なツール群を集めたモノレポリポジトリです。

## プロジェクト構造

```
zundamonizer-ai-assistant/
├── packages/          # すべてのツール群を格納するディレクトリ
│   └── marpify/       # マークダウン資料をMarpスライド化するツール
└── package.json       # ワークスペース設定
```

## インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd zundamonizer-ai-assistant

# 依存関係のインストール (すべてのワークスペースパッケージの依存関係が一度にインストールされます)
bun install
```

## 利用可能なツール

### Marpify

マークダウン形式の文章資料から[Marp](https://marp.app/)形式のスライドを生成・改善するためのツール群です。

#### 使い方

ルートディレクトリから実行する場合:

```bash
# マークダウン資料からスライドを生成
bun marpify generate path/to/document.md -o output/slides.md

# 生成・評価・改善の一連の流れを実行
bun marpify workflow path/to/document.md -o output-directory
```

marpifyディレクトリ内から直接実行する場合:

```bash
cd packages/marpify

# マークダウン資料からスライドを生成
bun start generate path/to/document.md -o output/slides.md
```

詳細な使い方は [packages/marpify/README.md](packages/marpify/README.md) をご参照ください。

## 新しいツールの追加方法

新しいツールを追加する場合は、`packages/` ディレクトリ内に新しいパッケージを作成してください。

```bash
mkdir -p packages/new-tool
cd packages/new-tool
bun init
```

パッケージ名は以下のように設定してください:

```json
{
  "name": "@zundamonizer/new-tool",
  ...
}
```

## ライセンス

MIT

# ずんだもナイザー AI アシスタント

AIを活用した便利なツール群を集めたモノレポリポジトリです。

## プロジェクト構造

```
zundamonizer-ai-assistant/
├── packages/          # すべてのツール群を格納するディレクトリ
│   ├── marpify/       # マークダウン資料をMarpスライド化するツール
│   └── zunda-notes/   # Marpスライドにずんだもんと春日部つむぎの会話形式プレゼンターノートを追加するツール
├── scripts/           # 統合ワークフロースクリプト
├── examples/          # サンプル入力とワークフロー出力の例
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

## 環境設定

Zunda Notesパッケージを使用するためには、OpenAI APIキーを設定する必要があります。
以下の環境変数を `.env` ファイルに設定してください：

```
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL_NAME=gpt-4o  # デフォルトはgpt-4o。変更可能。
```

> **注意**: o1-miniモデルはトークン制限が小さいため、大きな入力を処理する際にエラーが発生する場合があります。
> エラーが発生した場合は、`OPENAI_MODEL_NAME=gpt-4o` に設定することをお勧めします。

## 一気通貫ワークフロー

マークダウン資料からMarpスライドを生成し、ずんだもんと春日部つむぎの会話形式でプレゼンターノートを追加・評価・改善するまでを一気通貫で実行できます。

```bash
# マークダウン資料から一気通貫でスライド生成と会話形式ノート追加まで行う
bun zundamonizer-workflow path/to/document.md -o output-directory

# スライドのタイトルを指定する場合
bun zundamonizer-workflow path/to/document.md --slide-title "プレゼンテーションのタイトル" -o output-directory

# キャラクター名をカスタマイズする場合
bun zundamonizer-workflow path/to/document.md --zunda-character "ずんだもん" --tsumugi-character "春日部つむぎ" -o output-directory
```

ワークフロー実行後、以下のファイルが生成されます：
1. Marpスライド: `output-directory/01_marpify/document-slide.md`
2. プレゼンターノート付きスライド: `output-directory/02_zunda-notes/document-with-notes.md`
3. 評価結果: `output-directory/02_zunda-notes/document-evaluation.md`
4. 改善版スライド: `output-directory/02_zunda-notes/document-improved.md`

> **注意**: スクリプトは絶対パスを使用して実行されるため、ファイルパスの解決に関する問題は発生しません。

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

### Zunda Notes

Marpスライドの各ページに、ずんだもんと春日部つむぎのかけあい形式でプレゼンターノートを自動生成・追加・評価・改善するツールです。

#### 使い方

ルートディレクトリから実行する場合:

```bash
# Marpスライドにずんだもんと春日部つむぎの会話形式プレゼンターノートを追加
bun zunda-notes add path/to/slide.md -o output/slide-with-notes.md

# 元の資料も参照してより詳細な解説を生成
bun zunda-notes add path/to/slide.md path/to/original-document.md -o output/slide-with-notes.md

# プレゼンターノートを評価
bun zunda-notes evaluate original-slide.md slide-with-notes.md -o evaluation.md

# 評価結果に基づいて改善
bun zunda-notes improve original-slide.md slide-with-notes.md evaluation.md -o improved-slide.md

# 追加・評価・改善の一連の流れを実行
bun zunda-notes workflow path/to/slide.md -o output-directory
```

zunda-notesディレクトリ内から直接実行する場合:

```bash
cd packages/zunda-notes

# Marpスライドにプレゼンターノートを追加
bun start add path/to/slide.md -o output/slide-with-notes.md
```

詳細な使い方は [packages/zunda-notes/README.md](packages/zunda-notes/README.md) をご参照ください。

## 利用例

リポジトリにはサンプル入力と出力例が含まれています：

```bash
# 例示ディレクトリを確認
ls examples/

# 特定の例の入力を確認
cat examples/simple-presentation/input.md

# 特定の例の出力を確認
ls examples/simple-presentation/output/
```

各例示ディレクトリには、入力マークダウンファイルと、ワークフローで生成される一連の出力ファイルが含まれています。これらの例は、ずんだもナイザーワークフローの使い方と期待される出力を理解するのに役立ちます。

独自のマークダウン文書でワークフローを試すには：

```bash
# examples内の入力マークダウンを使用してワークフロー実行
bun zundamonizer-workflow examples/simple-presentation/input.md -o my-output
```

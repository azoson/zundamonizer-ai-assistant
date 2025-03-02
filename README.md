# ずんだもナイザー AI アシスタント

AIを活用した便利なツール群を集めたモノレポリポジトリです。

## プロジェクト構造

```
zundamonizer-ai-assistant/
├── packages/          # すべてのツール群を格納するディレクトリ
│   ├── marpify/       # マークダウン資料をMarpスライド化するツール
│   └── zunda-notes/   # Marpスライドにずんだもんと春日部つむぎの会話形式プレゼンターノートを追加するツール
├── scripts/           # 統合ワークフロースクリプト
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

マークダウン資料からMarpスライドの生成、ずんだもん会話形式のプレゼンターノート追加、評価、改善までを一気通貫で行うためのプロンプトです：

```
あなたは文章資料からプレゼンテーションスライドを作成し、解説ノートを追加する専門家です。以下のマークダウン形式の文章資料を使って、以下の3つのステップを順番に実行してください。

ステップ1: マークダウン資料からMarp形式のスライドを生成する
ステップ2: 生成したスライドに、ずんだもんと春日部つむぎの会話形式でプレゼンターノートを追加する
ステップ3: スライドとプレゼンターノートを評価し、改善する

【マークダウン資料】
ここに元のマークダウン文章を貼り付けてください

【ステップ1の指示】
以下のルールに従ってMarp形式のスライドを生成してください：
1. 各スライドは「---」で区切る
2. 最初のスライドにはタイトルと概要を含める
3. スライドには適切な見出しレベル（#, ##, ###）を使用する
4. 各スライドには過剰な情報を詰め込まない
5. 以下のMarpディレクティブをスライドの先頭に追加する：
   <!-- marp: true -->
   <!-- theme: default -->
   <!-- paginate: true -->

【ステップ2の指示】
生成したスライドに、以下のキャラクター設定と指示に従って会話形式のプレゼンターノートを追加してください：

キャラクター設定：
・ずんだもん: ずんだ餅をこよなく愛する、明るく元気な妖精。東北ずん子の友達で、女の子。「〜のだ」「〜なのだ」という語尾が特徴的。かわいらしく元気な口調で話す。
・春日部つむぎ: お嬢様風の物腰と丁寧な話し方が特徴的な女の子。上品で知的な印象を与える。「〜だよ」「〜だね」などの語尾が特徴的。快活な口調で話す。

プレゼンターノート追加の指示：
1. 各スライドの最後に会話形式の解説を追加する
2. スライド内容を詳しく説明し、想定される質問とその回答も含める
3. 会話は<!-- ずんだもん(emotion): コメント -->と<!-- 春日部つむぎ(emotion): コメント -->の形式で記述する
4. emotionには(happy)、(sad)、(thinking)、(neutral)、(angry)の感情表現を入れる

【ステップ3の指示】
作成したプレゼンターノート付きスライドを以下の観点から評価し、改善してください：
1. 情報の整理と構造化
2. コンテンツの簡潔さと分かりやすさ
3. キャラクターの特徴の適切な表現
4. プレゼンターにとっての有用性
5. 想定質問と回答の適切さ

最終的な出力は、改善されたプレゼンターノート付きのMarpスライドとしてください。
```

詳細なプロンプトについては、それぞれのパッケージのREADMEを参照してください。

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

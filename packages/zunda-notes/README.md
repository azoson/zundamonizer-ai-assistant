# Zunda Notes

Marpスライドにずんだもんと春日部つむぎの会話形式でプレゼンターノートを追加するツールです。

## 機能

- **プレゼンターノート追加**: Marpスライドに、ずんだもんと春日部つむぎのかけあい形式でプレゼンターノートを追加
- **評価**: 追加されたプレゼンターノートの品質を評価
- **改善**: 評価に基づいて、プレゼンターノートを改善
- **ワークフロー**: 上記3つのステップを一連の流れで実行

## 使い方

### インストール

```bash
# リポジトリのルートから
bun install
```

### 環境変数の設定

`.env`ファイルを作成するか、環境変数を直接設定します：

```bash
# OpenAI APIキー（必須）
OPENAI_API_KEY=your-api-key-here

# 使用するモデル（オプション、デフォルトは"gpt-4o"）
OPENAI_MODEL_NAME=gpt-4o
```

o1-miniモデルを使用する場合は、自動的に以下のパラメータ調整が行われます：
- `max_tokens`の代わりに`max_completion_tokens`が使用されます
- `temperature`パラメータは除外されます（このモデルではデフォルト値のみサポート）

### コマンド

#### プレゼンターノートの追加

```bash
bun zunda-notes add path/to/slide.md -o output/slide-with-notes.md
```

オリジナルの資料も参照してより詳細な解説を生成する場合：

```bash
bun zunda-notes add path/to/slide.md path/to/original-document.md -o output/slide-with-notes.md
```

#### プレゼンターノートの評価

```bash
bun zunda-notes evaluate path/to/slide.md path/to/slide-with-notes.md -o evaluation.md
```

#### プレゼンターノートの改善

```bash
bun zunda-notes improve path/to/slide.md path/to/slide-with-notes.md path/to/evaluation.md -o improved.md
```

#### 一連のワークフロー実行

```bash
bun zunda-notes workflow path/to/slide.md -o output-dir
```

元の資料も参照する場合：

```bash
bun zunda-notes workflow path/to/slide.md path/to/original-document.md -o output-dir
```

## オプション

- `-o, --output <path>`: 出力ファイルパス
- `--zunda-character <n>`: ずんだもんキャラクターの名前をカスタマイズ (デフォルト: "ずんだもん")
- `--tsumugi-character <n>`: 春日部つむぎキャラクターの名前をカスタマイズ (デフォルト: "春日部つむぎ")

## 開発

### プロジェクト構造

```
packages/zunda-notes/
├── cli.ts                # コマンドラインインターフェース
├── add-notes.ts          # プレゼンターノート追加機能
├── evaluation.ts         # プレゼンターノート評価機能
├── improve.ts            # プレゼンターノート改善機能
├── character-settings.ts # キャラクター設定
├── prompt-templates.ts   # プロンプトテンプレート
└── utils.ts              # ユーティリティ関数
```

## トラブルシューティング

- **エラー「プレゼンターノートの生成に失敗しました」**: これはOpenAI APIからの応答が空の場合に発生します。モデルをgpt-4oに変更して再試行してください。
- **「Invalid response object from API」エラー**: APIキーが正しく設定されていない可能性があります。`.env`ファイルのAPIキーを確認してください。

## ライセンス

MIT

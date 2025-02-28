# Zunda Notes

Marpスライドにずんだもんと春日部つむぎの会話形式でプレゼンターノートを追加するツールです。

## 機能

- **プレゼンターノート追加**: Marpスライドに、ずんだもんと春日部つむぎのかけあい形式でプレゼンターノートを追加
- **評価**: 追加されたプレゼンターノートの品質を評価
- **改善**: 評価に基づいて、プレゼンターノートを改善
- **ワークフロー**: 上記3つのステップを一連の流れで実行
- **プレビュー**: Marpスライドをプレビュー表示

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

サポートされているモデル例：
- gpt-4o
- gpt-4-turbo
- gpt-3.5-turbo
- o1-mini （Anthropicのモデル）

**注意**: o1-miniモデルを使用する場合は、自動的にパラメータが調整されます。このモデルは他のモデルとは異なるパラメータ形式が必要であるため、以下の自動調整が行われます：
- `max_tokens`の代わりに`max_completion_tokens`が使用されます
- `temperature`パラメータは除外されます（このモデルではデフォルト値のみサポート）

### コマンド

#### プレゼンターノートの追加

```bash
bun zunda-notes add path/to/slide.md -o output/slide-with-notes.md
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

#### スライドのプレビュー

```bash
bun zunda-notes preview path/to/slide.md
```

## オプション

- `-o, --output <path>`: 出力ファイルパス
- `--zunda-character <name>`: ずんだもんキャラクターの名前をカスタマイズ (デフォルト: "ずんだもん")
- `--tsumugi-character <name>`: 春日部つむぎキャラクターの名前をカスタマイズ (デフォルト: "春日部つむぎ")

## 開発

### プロジェクト構造

```
packages/zunda-notes/
├── cli.ts         # コマンドラインインターフェース
├── add-notes.ts   # プレゼンターノート追加機能
├── evaluation.ts  # プレゼンターノート評価機能
├── improve.ts     # プレゼンターノート改善機能
└── utils.ts       # ユーティリティ関数
```

## ライセンス

MIT

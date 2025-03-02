/**
 * zunda-notesのプロンプトテンプレート
 * AIとのやり取りに使用するプロンプトを一元管理します
 */
import { getCharacterSettingsForPrompt } from './character-settings.js';

export interface AddNotesPromptParams {
  originalSlide: string;
  documentContent?: string;
  zundaCharacter: string;
  tsumugiCharacter: string;
}

export interface EvaluationPromptParams {
  originalSlide: string;
  slideWithNotes: string;
}

export interface ImprovePromptParams {
  originalSlide: string;
  slideWithNotes: string;
  evaluation: string;
}

/**
 * プレゼンターノート追加用のプロンプトを生成する
 */
export function getAddNotesPrompt(params: AddNotesPromptParams): string {
  const documentSection = params.documentContent
    ? `\n【参考資料】\n\`\`\`\n${params.documentContent}\n\`\`\``
    : "";

  return `
あなたはプレゼンテーション解説の専門家です。
以下のMarpスライドの各ページに、${params.zundaCharacter}と${params.tsumugiCharacter}の会話形式でプレゼンターノートを追加してください。

【スライド】
\`\`\`
${params.originalSlide}
\`\`\`${documentSection}

【指示】
1. 各ページの最後に会話形式の解説を追加してください
2. 元のスライドの構造（ページ分け）と内容はそのまま維持してください
3. スライド内容を詳しく説明し、想定される質問とその回答も含めてください
4. 会話は<!-- ${params.zundaCharacter}(emotion): コメント -->と<!-- ${params.tsumugiCharacter}(emotion): コメント -->の形式で記述してください
5. キャラクターの特徴を口調や発言の内容に反映してください
6. emotionには(happy)、(sad)、(thinking)、(neutral)、(angry) の感情表現を入れてください
7. 出力は完全なスライド（元のスライド内容＋追加したNote）としてください
8. 出力には Markdown の文書のみを含めてください

【キャラクター設定】
${getCharacterSettingsForPrompt()}

出力例：
---
# スライドのタイトル

- 箇条書き1
- 箇条書き2

<!-- ${params.zundaCharacter}(happy): このスライドは〇〇についての説明なのだ！ -->
<!-- ${params.tsumugiCharacter}(neutral): なるほど、どのような点が重要なの？ -->
<!-- ${params.zundaCharacter}(neutral): 特に△△がポイントなのだ。 -->
<!-- ${params.tsumugiCharacter}(happy): わかりやすい説明をありがとう！ -->
---
`;
}

/**
 * プレゼンターノート評価用のプロンプトを生成する
 */
export function getEvaluationPrompt(params: EvaluationPromptParams): string {
  return `
あなたはプレゼンテーション解説の専門家です。
以下の元のスライド内容と、ずんだもんと春日部つむぎの会話形式で追加されたプレゼンターノートを評価してください。

以下の観点から10点満点で評価し、それぞれの評価理由と改善点を構造化された形式で提案してください：

1. プレゼンターノートはスライドの内容を適切に解説しているか（情報の正確さ）
2. 会話形式は自然で理解しやすいか（会話の自然さ）
3. キャラクターの特徴が適切に表現されているか
4. プレゼンターにとって有用な情報が含まれているか（実用性）
5. 想定される質問とその回答が適切に含まれているか（想定QA）

【元のスライド】
\`\`\`
${params.originalSlide}
\`\`\`

【プレゼンターノート付きスライド】
\`\`\`
${params.slideWithNotes}
\`\`\`

【キャラクター設定】
${getCharacterSettingsForPrompt()}

出力形式：
各評価項目について、以下の構造で出力してください：

# 評価項目 X: [項目名]
評価: [X/10]

強み:
- [強みポイント1]
- [強みポイント2]

改善点:
- [改善点1]
- [改善点2]

提案:
[具体的な改善提案]

最後に総評をまとめてください。
`;
}

/**
 * プレゼンターノート改善用のプロンプトを生成する
 */
export function getImprovePrompt(params: ImprovePromptParams): string {
  return `
あなたはプレゼンテーション解説の専門家です。
以下の元のスライド内容と、ずんだもんと春日部つむぎの会話形式で追加されたプレゼンターノート、
そしてそのノートに対する評価を参考に、改善されたプレゼンターノートを作成してください。

【元のスライド】
\`\`\`
${params.originalSlide}
\`\`\`

【現在のプレゼンターノート付きスライド】
\`\`\`
${params.slideWithNotes}
\`\`\`

【評価と改善提案】
\`\`\`
${params.evaluation}
\`\`\`

【改善のポイント】
1. 評価で指摘された問題点を修正すること
2. キャラクターの特徴を適切に表現すること
3. 会話の自然さを向上させること
4. プレゼンターにとって有用な情報を充実させること
5. 想定質問と回答を適切に含めること

元のスライドの構造（ページ分け）を維持しながら、各ページのプレゼンターノートのみを改善してください。
出力は改善されたスライド全体（元のスライド内容＋改善されたNote部分）としてください。

出力形式：
各ページのNoteセクション内のコメントは以下の形式を使用してください：
<!-- ずんだもん(emotion): （発言内容） -->
<!-- 春日部つむぎ(emotion): （発言内容） -->
`;
}

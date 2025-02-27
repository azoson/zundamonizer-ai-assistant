/**
 * zunda-notesのプロンプトテンプレート
 * AIとのやり取りに使用するプロンプトを一元管理します
 */
import { getCharacterSettingsForPrompt, getCustomCharacterSettingsForPrompt } from './character-settings.js';

export interface PromptParams {
  originalSlide: string;
  documentContent?: string;
  zundamonName?: string;
  tsumugiName?: string;
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
export function getAddNotesPrompt(params: PromptParams): string {
  const characterSettings = params.zundamonName && params.tsumugiName
    ? getCustomCharacterSettingsForPrompt(params.zundamonName, params.tsumugiName)
    : getCharacterSettingsForPrompt();

  return `
あなたはプレゼンテーション解説の専門家です。
Marpスライドの各ページに対して、ずんだもんと春日部つむぎの会話形式でプレゼンターノートを作成してください。

${characterSettings}

【スライド内容】
\`\`\`
${params.originalSlide}
\`\`\`

${params.documentContent ? `【参考資料】\n\`\`\`\n${params.documentContent}\n\`\`\`\n` : ''}

【プレゼンターノート作成のポイント】
1. 各スライドページの内容を説明するような会話を生成してください
2. 会話はスライドの内容を補足し、発表者が参照しやすいものにしてください
3. 想定される質問と回答も含めてください
4. スライドの構造（ページ分け）を維持したまま、Note部分を追加してください
5. 各ページごとに2〜4往復程度の会話を入れるのが理想的です

出力は、元のスライド内容にNoteセクションを追加したものとしてください。
各ページのNoteセクションは以下の形式で追加してください：

Note:
<!-- ずんだもん(emotion): （発言内容） -->
<!-- 春日部つむぎ(emotion): （発言内容） -->
`;
}

/**
 * プレゼンターノート評価用のプロンプトを生成する
 */
export function getEvaluationPrompt(params: EvaluationPromptParams): string {
  return `
あなたはプレゼンテーション解説の専門家です。
以下の元のスライド内容と、ずんだもんと春日部つむぎの会話形式で追加されたプレゼンターノートを評価してください。

以下の観点から10点満点で評価し、それぞれの評価理由と改善点を、ずんだもんと春日部つむぎの会話形式で提案してください：

1. プレゼンターノートはスライドの内容を適切に解説しているか（情報の正確さ）
2. 会話形式は自然で理解しやすいか（会話の自然さ）
3. キャラクターの特徴（ずんだもん：「〜のだ」、春日部つむぎ：「〜ですわ」などの口調）が適切に表現されているか
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

出力形式：
<!-- ずんだもん(emotion): （発言内容） -->
<!-- 春日部つむぎ(emotion): （発言内容） -->
のような形式で、会話形式の評価と改善提案を行ってください。
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

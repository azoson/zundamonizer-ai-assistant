/**
 * zunda-notesのキャラクター設定
 * プロンプト内で使用するキャラクターの特徴や口調、説明スタイルを一元管理します
 */

export interface CharacterSetting {
  name: string;
  description: string;
  speechPattern: string;
  emotionExamples: string[];
  presentationStyle: string;
}

export const characterSettings = {
  zundamon: {
    name: "ずんだもん",
    description: "ずんだ餅をこよなく愛する、明るく元気な妖精。東北ずん子の友達で、女の子。",
    speechPattern: "「〜のだ」「〜なのだ」という語尾が特徴的。かわいらしく元気な口調で話す。",
    emotionExamples: ["happy", "neutral", "thinking", "sad", "angry"],
    presentationStyle: "親しみやすく簡潔に、時に例え話を使って分かりやすく説明する。技術的な内容も噛み砕いて表現する。"
  },
  tsumugi: {
    name: "春日部つむぎ",
    description: "お嬢様風の物腰と丁寧な話し方が特徴的な女の子。上品で知的な印象を与える。",
    speechPattern: "「〜だよ」「〜だね」などの語尾が特徴的。快活な口調で話す。",
    emotionExamples: ["happy", "neutral", "thinking", "sad", "angry"],
    presentationStyle: "論理的で体系だった説明を好み、要点をまとめて伝える。専門的な用語も適切に使いながら、深い解説を行う。"
  }
};

/**
 * プロンプト用のキャラクター設定テキストを生成する
 * @returns プロンプトで使用するキャラクター設定の説明文
 */
export function getCharacterSettingsForPrompt(): string {
  const zundamon = characterSettings.zundamon;
  const tsumugi = characterSettings.tsumugi;

  return `
【キャラクター設定】
・${zundamon.name}: ${zundamon.description} ${zundamon.speechPattern}
・${tsumugi.name}: ${tsumugi.description} ${tsumugi.speechPattern}

【出力形式】
各キャラクターの発言は以下の形式で記述してください：
<!-- ${zundamon.name}(emotion): （発言内容） -->
<!-- ${tsumugi.name}(emotion): （発言内容） -->

emotionには、${zundamon.name}の場合は ${zundamon.emotionExamples.join(", ")} など、
${tsumugi.name}の場合は ${tsumugi.emotionExamples.join(", ")} などの感情を表す英単語を入れてください。
`;
}

/**
 * カスタムキャラクター名での設定を生成する
 * @param zundamonName カスタムのずんだもん名
 * @param tsumugiName カスタムの春日部つむぎ名
 * @returns カスタム名を適用したキャラクター設定
 */
export function getCustomCharacterSettingsForPrompt(zundamonName: string, tsumugiName: string): string {
  const zundamon = characterSettings.zundamon;
  const tsumugi = characterSettings.tsumugi;

  return `
【キャラクター設定】
・${zundamonName}: ${zundamon.description} ${zundamon.speechPattern}
・${tsumugiName}: ${tsumugi.description} ${tsumugi.speechPattern}

【出力形式】
各キャラクターの発言は以下の形式で記述してください：
<!-- ${zundamonName}(emotion): （発言内容） -->
<!-- ${tsumugiName}(emotion): （発言内容） -->

emotionには、${zundamonName}の場合は ${zundamon.emotionExamples.join(", ")} など、
${tsumugiName}の場合は ${tsumugi.emotionExamples.join(", ")} などの感情を表す英単語を入れてください。
`;
}

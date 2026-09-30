// tarot_cards.jsonから読み込んだ78枚を保存する一覧です。
let tarotCards = [];

const freeFeelingsThemes = [
  "お相手の今の気持ち",
  "現在の二人の流れ",
  "近い未来",
];

const freeSelfThemes = [
  "今のあなたのエネルギー",
  "今起きている流れの意味",
  "これから訪れやすい変化",
];

const freeBothThemes = [
  "お相手の今の気持ち",
  "今のあなたの状態やエネルギー",
  "これから訪れやすい変化",
];

const detailedRequest = `【依頼】
「相手の本音・詳細恋愛鑑定」をお願いします。`;

const detailedThemes = [
  "相手の今の気持ち",
  "相談者への印象",
  "相手が隠している本音",
  "なぜ今動けないのか",
  "二人の間にある障害",
  "近い未来の流れ",
  "相談者が次にどう動くべきか",
];

const futureLoveThemes = [
  "お相手の今の気持ち",
  "相談者への印象",
  "お相手が言葉にしていない本音",
  "なぜ今この状態になっているのか",
  "二人の間にある大きな障害",
  "お相手がこの関係に求めていること",
  "近い未来の流れ",
  "その先の二人の流れ",
  "関係が動くポイント",
  "相談者が最終的にどう動くとよいか",
];

const currentSelfThemes = [
  "今のあなたのエネルギー",
  "心の奥にある本音",
  "今起きている流れの意味",
  "今あなたを止めているもの",
  "手放した方がいいもの",
  "これから訪れやすい変化",
  "今あなたが意識するとよいこと",
];

const futureSelfThemes = [
  "今のあなたのエネルギー",
  "心の奥にある本音",
  "今抱えている大きなテーマ",
  "今あなたを止めているもの",
  "今手放した方がいいもの",
  "これから入ってくる新しい流れ",
  "近い未来に起こりやすい変化",
  "その先に広がりやすい未来",
  "転機になりやすいポイント",
  "今あなたが選ぶとよい方向",
];

const freeModeButton = document.querySelector("#freeModeButton");
const freeSelfModeButton = document.querySelector("#freeSelfModeButton");
const freeBothModeButton = document.querySelector("#freeBothModeButton");
const detailedModeButton = document.querySelector("#detailedModeButton");
const freePanel = document.querySelector("#freePanel");
const freeSelfPanel = document.querySelector("#freeSelfPanel");
const freeBothPanel = document.querySelector("#freeBothPanel");
const detailedPanel = document.querySelector("#detailedPanel");
const futureLoveModeButton = document.querySelector("#futureLoveModeButton");
const currentSelfModeButton = document.querySelector("#currentSelfModeButton");
const futureSelfModeButton = document.querySelector("#futureSelfModeButton");
const futureLovePanel = document.querySelector("#futureLovePanel");
const currentSelfPanel = document.querySelector("#currentSelfPanel");
const futureSelfPanel = document.querySelector("#futureSelfPanel");

const consultationInput = document.querySelector("#consultation");
const freeFeelingsForm = document.querySelector("#freeFeelingsForm");
const drawButton = document.querySelector("#drawButton");
const inputMessage = document.querySelector("#inputMessage");
const characterCount = document.querySelector("#characterCount");

const detailedForm = document.querySelector("#detailedForm");
const detailedDrawButton = document.querySelector("#detailedDrawButton");
const detailedInputMessage = document.querySelector("#detailedInputMessage");
const purchasedConsultation = document.querySelector("#purchasedConsultation");
const paidCharacterCount = document.querySelector("#paidCharacterCount");

const resultSection = document.querySelector("#resultSection");
const resultTitle = document.querySelector("#result-title");
const resultStepLabel = document.querySelector("#resultStepLabel");
const resultText = document.querySelector("#resultText");
const copyButton = document.querySelector("#copyButton");
const copyMessage = document.querySelector("#copyMessage");

// 78枚のカードデータを読み込み、両方の抽選ボタンを使える状態にします。
async function loadTarotCards() {
  try {
    const response = await fetch("tarot_cards.json");

    if (!response.ok) {
      throw new Error("カードデータを取得できませんでした");
    }

    const cards = await response.json();

    if (!Array.isArray(cards) || cards.length !== 78) {
      throw new Error("カードデータが78枚ではありません");
    }

    tarotCards = cards.map((card) => ({
      id: card.id,
      name: card.name_ja,
      loveUpright: card.love_upright,
      loveReversed: card.love_reversed,
    }));

    freeModes.forEach((mode) => {
      mode.drawButton.disabled = false;
      mode.drawButton.textContent = "✦ 3枚引く";
    });
    detailedDrawButton.disabled = false;
    detailedDrawButton.textContent = "✦ 詳細鑑定の7枚を引く";
    additionalPaidModes.forEach((mode) => {
      mode.drawButton.disabled = false;
      mode.drawButton.textContent = `✦ ${mode.cardCount}枚を引く`;
    });
  } catch (error) {
    freeModes.forEach((mode) => {
      mode.drawButton.textContent = "カードを読み込めませんでした";
      mode.message.textContent = "カードデータを読み込めませんでした。ページを読み直してください。";
    });
    detailedDrawButton.textContent = "カードを読み込めませんでした";
    detailedInputMessage.textContent = "カードデータを読み込めませんでした。ページを読み直してください。";
    additionalPaidModes.forEach((mode) => {
      mode.drawButton.textContent = "カードを読み込めませんでした";
      mode.message.textContent = "カードデータを読み込めませんでした。ページを読み直してください。";
    });
  }
}

// 元のカード一覧を壊さず、順番だけをランダムに並べ替えます。
function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

// 指定した枚数を重複なしで選び、それぞれの向きと恋愛メッセージを決めます。
function createCardResults(count) {
  return shuffleCards(tarotCards)
    .slice(0, count)
    .map((card) => {
      const isUpright = Math.random() < 0.5;

      return {
        id: card.id,
        name: card.name,
        position: isUpright ? "正位置" : "逆位置",
        message: isUpright ? card.loveUpright : card.loveReversed,
      };
    });
}

const freeFeelingsFields = [
  {
    key: "nickname",
    label: "① ニックネーム",
    pattern: /^①\s*ニックネーム\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "relationship",
    label: "② お相手との関係",
    pattern: /^②\s*お相手との関係\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "mainQuestion",
    label: "③ 今いちばん知りたいこと",
    pattern: /^③\s*今いちばん知りたいこと\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "recentSituation",
    label: "④ 最近の状況",
    pattern: /^④\s*最近の状況\s*[：:]\s*(.*)$/,
    required: true,
  },
];

const freeSelfFields = [
  {
    key: "nickname",
    label: "① ニックネーム",
    pattern: /^①\s*ニックネーム\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "mainConcern",
    label: "② 今いちばん悩んでいること",
    pattern: /^②\s*今いちばん悩んでいること\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "recentChange",
    label: "③ 最近、気持ちや状況にどんな変化があったか",
    pattern: /^③\s*最近、気持ちや状況にどんな変化があったか\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "desiredFuture",
    label: "④ これからどうなっていきたいか",
    pattern: /^④\s*これからどうなっていきたいか\s*[：:]\s*(.*)$/,
    required: true,
  },
];

const freeBothFields = [
  {
    key: "nickname",
    label: "① ニックネーム",
    pattern: /^①\s*ニックネーム\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "relationship",
    label: "② お相手との関係",
    pattern: /^②\s*お相手との関係\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "mainQuestion",
    label: "③ 今いちばん知りたいこと",
    pattern: /^③\s*今いちばん知りたいこと\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "recentSituation",
    label: "④ 最近の状況",
    pattern: /^④\s*最近の状況\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "personalChange",
    label: "⑤ 最近、ご自身の気持ちや環境に変化があれば教えてください",
    pattern: /^⑤\s*最近、ご自身の気持ちや環境に変化があれば教えてください\s*[：:]\s*(.*)$/,
    required: true,
  },
];

const freeModes = [
  {
    key: "free",
    title: "無料① 相手の気持ちを見る鑑定",
    resultTitle: "無料① 相手の気持ちを見る鑑定結果",
    resultLabel: "FREE RESULT ①",
    form: freeFeelingsForm,
    input: consultationInput,
    message: inputMessage,
    characterCount,
    drawButton,
    fields: freeFeelingsFields,
    themes: freeFeelingsThemes,
  },
  {
    key: "freeSelf",
    title: "無料② 今のあなたを見る鑑定",
    resultTitle: "無料② 今のあなたを見る鑑定結果",
    resultLabel: "FREE RESULT ②",
    form: document.querySelector("#freeSelfForm"),
    input: document.querySelector("#freeSelfConsultation"),
    message: document.querySelector("#freeSelfInputMessage"),
    characterCount: document.querySelector("#freeSelfCharacterCount"),
    drawButton: document.querySelector("#freeSelfDrawButton"),
    fields: freeSelfFields,
    themes: freeSelfThemes,
  },
  {
    key: "freeBoth",
    title: "無料③ 両方を見る鑑定",
    resultTitle: "無料③ 両方を見る鑑定結果",
    resultLabel: "FREE RESULT ③",
    form: document.querySelector("#freeBothForm"),
    input: document.querySelector("#freeBothConsultation"),
    message: document.querySelector("#freeBothInputMessage"),
    characterCount: document.querySelector("#freeBothCharacterCount"),
    drawButton: document.querySelector("#freeBothDrawButton"),
    fields: freeBothFields,
    themes: freeBothThemes,
  },
];

// 無料①〜③の相談内容と3枚の結果を、専用AIへ貼れる文章にします。
function createFreeResult(mode, formData, cards) {
  const consultationLines = mode.fields.map((field) => {
    const label = field.label.replace(/^[①-⑳]\s*/, "");
    return `${label}：${formData[field.key]}`;
  });
  const cardText = cards
    .map(
      (card, index) =>
        `${index + 1}枚目：\nテーマ：${mode.themes[index]}\nカード：${card.name}（${card.position}）\nカードメッセージ：${card.message}`,
    )
    .join("\n\n");

  return `【鑑定メニュー】
${mode.title}

【相談内容】
${consultationLines.join("\n")}

【タロット3枚】
${cardText}

【依頼】
「${mode.title}」をお願いします。`;
}

const consultationFields = [
  {
    key: "basePurchaserName",
    label: "① BASEで購入したお名前",
    pattern: /^①\s*BASEで購入したお名前\s*[：:]\s*(.*)$/i,
    required: true,
  },
  {
    key: "nickname",
    label: "② ニックネーム",
    pattern: /^②\s*ニックネーム\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "relationship",
    label: "③ お相手との関係",
    pattern: /^③\s*お相手との関係\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "mainQuestion",
    label: "④ 今いちばん知りたいこと",
    pattern: /^④\s*今いちばん知りたいこと\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "recentSituation",
    label: "⑤ 最近の状況",
    pattern: /^⑤\s*最近の状況\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "consultantBirthdate",
    label: "⑥ あなたの生年月日",
    pattern: /^⑥\s*あなたの生年月日\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "partnerBirthdate",
    label: "⑦ お相手の生年月日",
    pattern: /^⑦\s*お相手の生年月日\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "history",
    label: "⑧ これまでの経緯",
    pattern: /^⑧\s*これまでの経緯\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "recentBehavior",
    label: "⑨ お相手の最近の具体的な言動",
    pattern: /^⑨\s*お相手の最近の具体的な言動\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "desiredFuture",
    label: "⑩ 今後、お相手とどうなっていきたいか",
    pattern: /^⑩\s*今後、お相手とどうなっていきたいか\s*[：:]\s*(.*)$/,
    required: true,
  },
];

const currentSelfFields = [
  {
    key: "basePurchaserName",
    label: "① BASEで購入したお名前",
    pattern: /^①\s*BASEで購入したお名前\s*[：:]\s*(.*)$/i,
    required: true,
  },
  {
    key: "nickname",
    label: "② ニックネーム",
    pattern: /^②\s*ニックネーム\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "mainConcern",
    label: "③ 今いちばん悩んでいること",
    pattern: /^③\s*今いちばん悩んでいること\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "recentChange",
    label: "④ 最近、気持ちや状況にどんな変化があったか",
    pattern: /^④\s*最近、気持ちや状況にどんな変化があったか\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "desiredFuture",
    label: "⑤ これからどうなっていきたいか",
    pattern: /^⑤\s*これからどうなっていきたいか\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "consultantBirthdate",
    label: "⑥ あなたの生年月日",
    pattern: /^⑥\s*あなたの生年月日\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "additionalNotes",
    label: "⑦ 補足したいこと",
    pattern: /^⑦\s*補足したいこと\s*[：:]\s*(.*)$/,
    required: true,
  },
];

const futureSelfFields = [
  {
    key: "basePurchaserName",
    label: "① BASEで購入したお名前",
    pattern: /^①\s*BASEで購入したお名前\s*[：:]\s*(.*)$/i,
    required: true,
  },
  {
    key: "nickname",
    label: "② ニックネーム",
    pattern: /^②\s*ニックネーム\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "mainConcern",
    label: "③ 今いちばん悩んでいること",
    pattern: /^③\s*今いちばん悩んでいること\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "recentChange",
    label: "④ 最近、気持ちや状況にどんな変化があったか",
    pattern: /^④\s*最近、気持ちや状況にどんな変化があったか\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "futureQuestion",
    label: "⑤ 今後について特に知りたいこと",
    pattern: /^⑤\s*今後について特に知りたいこと\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "desiredFuture",
    label: "⑥ これからどうなっていきたいか",
    pattern: /^⑥\s*これからどうなっていきたいか\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "consultantBirthdate",
    label: "⑦ あなたの生年月日",
    pattern: /^⑦\s*あなたの生年月日\s*[：:]\s*(.*)$/,
    required: true,
  },
  {
    key: "additionalNotes",
    label: "⑧ 補足したいこと",
    pattern: /^⑧\s*補足したいこと\s*[：:]\s*(.*)$/,
    required: true,
  },
];

const additionalPaidModes = [
  {
    key: "futureLove",
    title: "二人の未来・総合恋愛鑑定",
    resultTitle: "二人の未来・総合恋愛鑑定結果",
    resultLabel: "PREMIUM RESULT ②",
    form: document.querySelector("#futureLoveForm"),
    input: document.querySelector("#futureLoveConsultation"),
    message: document.querySelector("#futureLoveInputMessage"),
    characterCount: document.querySelector("#futureLoveCharacterCount"),
    drawButton: document.querySelector("#futureLoveDrawButton"),
    fields: consultationFields,
    birthdateFields: [
      { key: "consultantBirthdate", label: "⑥ あなたの生年月日" },
      { key: "partnerBirthdate", label: "⑦ お相手の生年月日" },
    ],
    numerologyPeople: [
      { key: "consultantBirthdate", heading: "相談者の詳細数秘" },
      { key: "partnerBirthdate", heading: "お相手の詳細数秘", allowUnknown: true },
    ],
    themes: futureLoveThemes,
    cardCount: 10,
  },
  {
    key: "currentSelf",
    title: "今のあなた・詳細恋愛鑑定",
    resultTitle: "今のあなた・詳細恋愛鑑定結果",
    resultLabel: "PREMIUM RESULT ③",
    form: document.querySelector("#currentSelfForm"),
    input: document.querySelector("#currentSelfConsultation"),
    message: document.querySelector("#currentSelfInputMessage"),
    characterCount: document.querySelector("#currentSelfCharacterCount"),
    drawButton: document.querySelector("#currentSelfDrawButton"),
    fields: currentSelfFields,
    birthdateFields: [{ key: "consultantBirthdate", label: "⑥ あなたの生年月日" }],
    numerologyPeople: [{ key: "consultantBirthdate", heading: "相談者の数秘" }],
    themes: currentSelfThemes,
    cardCount: 7,
  },
  {
    key: "futureSelf",
    title: "あなたの未来・総合鑑定",
    resultTitle: "あなたの未来・総合鑑定結果",
    resultLabel: "PREMIUM RESULT ④",
    form: document.querySelector("#futureSelfForm"),
    input: document.querySelector("#futureSelfConsultation"),
    message: document.querySelector("#futureSelfInputMessage"),
    characterCount: document.querySelector("#futureSelfCharacterCount"),
    drawButton: document.querySelector("#futureSelfDrawButton"),
    fields: futureSelfFields,
    birthdateFields: [{ key: "consultantBirthdate", label: "⑦ あなたの生年月日" }],
    numerologyPeople: [{ key: "consultantBirthdate", heading: "相談者の詳細数秘" }],
    themes: futureSelfThemes,
    cardCount: 10,
  },
];

// 全角数字を半角へ直し、入力された日付をYYYY-MM-DD形式にそろえます。
function normalizeBirthdate(value) {
  const normalized = value
    .replace(/[０-９]/g, (digit) => String(digit.charCodeAt(0) - 0xfee0))
    .trim();

  if (!normalized || /^(不明|不詳|わからない|なし|[-ー])$/.test(normalized)) {
    return "";
  }

  const match = normalized.match(
    /^(\d{4})\s*(?:[/.\-]|年)\s*(\d{1,2})\s*(?:[/.\-]|月)\s*(\d{1,2})\s*日?$/,
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ①〜⑩の見出しを探し、次の見出しまでを1つの回答として読み取ります。
function parsePurchasedConsultation(text) {
  const values = Object.fromEntries(consultationFields.map((field) => [field.key, ""]));
  let currentKey = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const matchedField = consultationFields.find((field) => field.pattern.test(line));

    if (matchedField) {
      const match = line.match(matchedField.pattern);
      currentKey = matchedField.key;
      values[currentKey] = match[1].trim();
      continue;
    }

    if (currentKey && line) {
      values[currentKey] += `${values[currentKey] ? "\n" : ""}${line}`;
    }
  }

  const missingFields = consultationFields
    .filter((field) => field.required && !values[field.key].trim())
    .map((field) => field.label);

  const consultantBirthdate = normalizeBirthdate(values.consultantBirthdate);
  const partnerBirthdate = normalizeBirthdate(values.partnerBirthdate);
  const invalidDates = [];

  if (values.consultantBirthdate && consultantBirthdate === null) {
    invalidDates.push("⑥ あなたの生年月日");
  }

  if (values.partnerBirthdate && partnerBirthdate === null) {
    invalidDates.push("⑦ お相手の生年月日");
  }

  return {
    data: {
      ...values,
      consultantBirthdate: consultantBirthdate || "",
      partnerBirthdate: partnerBirthdate || "",
    },
    missingFields,
    invalidDates,
  };
}

// 有料②〜④の番号付き回答を、モードごとの項目定義に沿って読み取ります。
function parseStructuredConsultation(text, fields, birthdateFields) {
  const values = Object.fromEntries(fields.map((field) => [field.key, ""]));
  let currentKey = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    const matchedField = fields.find((field) => field.pattern.test(line));

    if (matchedField) {
      const match = line.match(matchedField.pattern);
      currentKey = matchedField.key;
      values[currentKey] = match[1].trim();
      continue;
    }

    if (currentKey && line) {
      values[currentKey] += `${values[currentKey] ? "\n" : ""}${line}`;
    }
  }

  const missingFields = fields
    .filter((field) => field.required && !values[field.key].trim())
    .map((field) => field.label);
  const invalidDates = [];

  for (const birthdateField of birthdateFields) {
    const rawBirthdate = values[birthdateField.key];
    const normalizedBirthdate = normalizeBirthdate(rawBirthdate);

    if (rawBirthdate && normalizedBirthdate === null) {
      invalidDates.push(birthdateField.label);
    }

    values[birthdateField.key] = normalizedBirthdate || "";
  }

  return { data: values, missingFields, invalidDates };
}

// 生年月日の数字を合計し、1桁または11・22・33になるまで足し直します。
function calculateLifePath(birthdate) {
  const digits = birthdate.replace(/\D/g, "");
  let total = [...digits].reduce((sum, digit) => sum + Number(digit), 0);
  const masterNumbers = [11, 22, 33];

  while (total > 9 && !masterNumbers.includes(total)) {
    total = [...String(total)].reduce((sum, digit) => sum + Number(digit), 0);
  }

  return total;
}

// 数秘の合計値を、1桁またはマスターナンバーになるまで還元します。
function reduceNumerologyNumber(value) {
  let total = Number(value);
  const masterNumbers = [11, 22, 33];

  while (total > 9 && !masterNumbers.includes(total)) {
    total = [...String(total)].reduce((sum, digit) => sum + Number(digit), 0);
  }

  return total;
}

// 生まれた日からバースデーナンバーを計算します。
function calculateBirthdayNumber(birthdate) {
  const day = Number(birthdate.split("-")[2]);
  return reduceNumerologyNumber(day);
}

// 誕生月・誕生日・実行年を合計し、その年の個人年ナンバーを計算します。
function calculatePersonalYear(birthdate, year) {
  const [, month, day] = birthdate.split("-");
  const total = [...`${month}${day}${year}`].reduce(
    (sum, digit) => sum + Number(digit),
    0,
  );
  return reduceNumerologyNumber(total);
}

// YYYY-MM-DD形式の日付を、日本語で読みやすい形にします。
function formatBirthdate(birthdate) {
  if (!birthdate) {
    return "不明";
  }

  const [year, month, day] = birthdate.split("-").map(Number);
  return `${year}年${month}月${day}日`;
}

// 有料7枚引きと数秘を、ChatGPTへ渡せる1つの文章にします。
function createDetailedResult(formData, cards) {
  const consultantLifePath = calculateLifePath(formData.consultantBirthdate);
  const partnerLifePath = formData.partnerBirthdate
    ? calculateLifePath(formData.partnerBirthdate)
    : null;

  const consultationText = `【相談内容】
BASEで購入したお名前：${formData.basePurchaserName}
ニックネーム：${formData.nickname}
お相手との関係：${formData.relationship}
今いちばん知りたいこと：${formData.mainQuestion}
最近の状況：${formData.recentSituation}
あなたの生年月日：${formatBirthdate(formData.consultantBirthdate)}
お相手の生年月日：${formatBirthdate(formData.partnerBirthdate)}
これまでの経緯：${formData.history}
お相手の最近の具体的な言動：${formData.recentBehavior}
今後、お相手とどうなっていきたいか：${formData.desiredFuture}`;

  const numerologyLines = [
    "【相談者の数秘】",
    `ライフパス：${consultantLifePath}`,
  ];

  if (partnerLifePath !== null) {
    numerologyLines.push("", "【相手の数秘】", `ライフパス：${partnerLifePath}`);
  }

  const cardText = cards
    .map(
      (card, index) =>
        `${index + 1}枚目：\nテーマ：${detailedThemes[index]}\nカード：${card.name}（${card.position}）\n恋愛メッセージ：${card.message}`,
    )
    .join("\n\n");

  return `${consultationText}

${numerologyLines.join("\n")}

【タロット7枚】
${cardText}

${detailedRequest}`;
}

// 有料②〜④の入力・詳細数秘・カード結果を、専用AIへ貼れる文章にまとめます。
function createPremiumResult(mode, formData, cards) {
  const birthdateKeys = new Set(mode.birthdateFields.map((field) => field.key));
  const consultationLines = mode.fields.map((field) => {
    const label = field.label.replace(/^[①-⑳]\s*/, "");
    const value = birthdateKeys.has(field.key)
      ? formatBirthdate(formData[field.key])
      : formData[field.key];
    return `${label}：${value}`;
  });

  const currentYear = new Date().getFullYear();
  const numerologySections = mode.numerologyPeople.map((person) => {
    const birthdate = formData[person.key];

    if (!birthdate && person.allowUnknown) {
      return `【${person.heading}】\n生年月日不明のため算出なし`;
    }

    return `【${person.heading}】
ライフパス：${calculateLifePath(birthdate)}
バースデーナンバー：${calculateBirthdayNumber(birthdate)}
個人年ナンバー（${currentYear}年）：${calculatePersonalYear(birthdate, currentYear)}`;
  });

  const cardText = cards
    .map(
      (card, index) =>
        `${index + 1}枚目：\nテーマ：${mode.themes[index]}\nカード：${card.name}（${card.position}）\nカードメッセージ：${card.message}`,
    )
    .join("\n\n");

  return `【鑑定メニュー】
${mode.title}

【相談内容】
${consultationLines.join("\n")}

${numerologySections.join("\n\n")}

【タロット${mode.cardCount}枚】
${cardText}

【依頼】
「${mode.title}」をお願いします。`;
}

// 結果を共通の結果欄へ表示します。
function showResult(text, title, label) {
  resultText.textContent = text;
  resultTitle.textContent = title;
  resultStepLabel.textContent = label;
  resultSection.hidden = false;
  copyMessage.textContent = "";
  copyButton.textContent = "ChatGPT用にコピー";
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

const modeViews = [
  { key: "free", button: freeModeButton, panel: freePanel },
  { key: "freeSelf", button: freeSelfModeButton, panel: freeSelfPanel },
  { key: "freeBoth", button: freeBothModeButton, panel: freeBothPanel },
  { key: "detailed", button: detailedModeButton, panel: detailedPanel },
  { key: "futureLove", button: futureLoveModeButton, panel: futureLovePanel },
  { key: "currentSelf", button: currentSelfModeButton, panel: currentSelfPanel },
  { key: "futureSelf", button: futureSelfModeButton, panel: futureSelfPanel },
];

// 無料・有料①〜④の入力画面を切り替えます。
function switchMode(mode) {
  modeViews.forEach((view) => {
    const isActive = view.key === mode;
    view.panel.hidden = !isActive;
    view.button.classList.toggle("is-active", isActive);
    view.button.setAttribute("aria-selected", String(isActive));
  });

  resultSection.hidden = true;
  copyMessage.textContent = "";
}

freeModeButton.addEventListener("click", () => switchMode("free"));
freeSelfModeButton.addEventListener("click", () => switchMode("freeSelf"));
freeBothModeButton.addEventListener("click", () => switchMode("freeBoth"));
detailedModeButton.addEventListener("click", () => switchMode("detailed"));
futureLoveModeButton.addEventListener("click", () => switchMode("futureLove"));
currentSelfModeButton.addEventListener("click", () => switchMode("currentSelf"));
futureSelfModeButton.addEventListener("click", () => switchMode("futureSelf"));

// 無料①〜③の入力確認、3枚引き、専用プロンプト生成を設定します。
freeModes.forEach((mode) => {
  mode.input.addEventListener("input", () => {
    mode.characterCount.textContent = `${mode.input.value.length}文字`;
    mode.message.textContent = mode.input.value.trim()
      ? "貼り付け内容を確認できます"
      : `${mode.fields.length}項目を自動で読み取ります`;
    mode.message.classList.remove("error");
  });

  mode.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const parsed = parseStructuredConsultation(mode.input.value, mode.fields, []);

    if (parsed.missingFields.length > 0) {
      mode.message.textContent = `不足している項目：${parsed.missingFields.join("、")}`;
      mode.message.classList.add("error");
      resultSection.hidden = true;
      mode.input.focus();
      return;
    }

    mode.message.textContent = "";
    mode.message.classList.remove("error");
    const selectedCards = createCardResults(3);
    showResult(
      createFreeResult(mode, parsed.data, selectedCards),
      mode.resultTitle,
      mode.resultLabel,
    );
  });
});

// 有料7枚引きとライフパス計算を実行します。
detailedForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const parsed = parsePurchasedConsultation(purchasedConsultation.value);

  if (parsed.missingFields.length > 0 || parsed.invalidDates.length > 0) {
    const messages = [];

    if (parsed.missingFields.length > 0) {
      messages.push(`不足している項目：${parsed.missingFields.join("、")}`);
    }

    if (parsed.invalidDates.length > 0) {
      messages.push(`日付の形式を確認してください：${parsed.invalidDates.join("、")}`);
    }

    detailedInputMessage.textContent = messages.join(" ／ ");
    detailedInputMessage.classList.add("error");
    purchasedConsultation.focus();
    return;
  }

  detailedInputMessage.textContent = "";
  detailedInputMessage.classList.remove("error");
  const selectedCards = createCardResults(7);
  showResult(
    createDetailedResult(parsed.data, selectedCards),
    "相手の本音・詳細恋愛鑑定結果",
    "DETAILED RESULT",
  );
});

// 貼り付けた相談文の文字数を表示し、入力エラーをいったん解除します。
purchasedConsultation.addEventListener("input", () => {
  paidCharacterCount.textContent = `${purchasedConsultation.value.length}文字`;
  detailedInputMessage.textContent = purchasedConsultation.value.trim()
    ? "貼り付け内容を確認できます"
    : "10項目を自動で読み取ります";
  detailedInputMessage.classList.remove("error");
});

// 有料②〜④の入力確認、抽選、プロンプト生成をモードごとに設定します。
additionalPaidModes.forEach((mode) => {
  mode.input.addEventListener("input", () => {
    mode.characterCount.textContent = `${mode.input.value.length}文字`;
    mode.message.textContent = mode.input.value.trim()
      ? "貼り付け内容を確認できます"
      : `${mode.fields.length}項目を自動で読み取ります`;
    mode.message.classList.remove("error");
  });

  mode.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const parsed = parseStructuredConsultation(
      mode.input.value,
      mode.fields,
      mode.birthdateFields,
    );

    if (parsed.missingFields.length > 0 || parsed.invalidDates.length > 0) {
      const messages = [];

      if (parsed.missingFields.length > 0) {
        messages.push(`不足している項目：${parsed.missingFields.join("、")}`);
      }

      if (parsed.invalidDates.length > 0) {
        messages.push(`日付の形式を確認してください：${parsed.invalidDates.join("、")}`);
      }

      mode.message.textContent = messages.join(" ／ ");
      mode.message.classList.add("error");
      mode.input.focus();
      return;
    }

    mode.message.textContent = "";
    mode.message.classList.remove("error");
    const selectedCards = createCardResults(mode.cardCount);
    showResult(
      createPremiumResult(mode, parsed.data, selectedCards),
      mode.resultTitle,
      mode.resultLabel,
    );
  });
});

// クリップボードAPIが使えない場合にもコピーできる予備処理です。
function fallbackCopy(text) {
  const temporaryArea = document.createElement("textarea");
  temporaryArea.value = text;
  temporaryArea.setAttribute("readonly", "");
  temporaryArea.style.position = "fixed";
  temporaryArea.style.opacity = "0";
  document.body.appendChild(temporaryArea);
  temporaryArea.select();
  const copied = document.execCommand("copy");
  temporaryArea.remove();

  if (!copied) {
    throw new Error("コピーに失敗しました");
  }
}

// 現在表示している結果全文をコピーします。
copyButton.addEventListener("click", async () => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(resultText.textContent);
    } else {
      fallbackCopy(resultText.textContent);
    }

    copyMessage.textContent = "コピーしました。ChatGPTへ貼り付けてください。";
    copyButton.textContent = "コピーしました ✓";

    window.setTimeout(() => {
      copyButton.textContent = "ChatGPT用にコピー";
    }, 2200);
  } catch (error) {
    copyMessage.textContent = "コピーできませんでした。結果を長押ししてコピーしてください。";
  }
});

loadTarotCards();

// tarot_cards.jsonから読み込んだ78枚を保存する一覧です。
let tarotCards = [];

const freeRequest = `【依頼】
無料鑑定をお願いします。`;

const detailedRequest = `【依頼】
有料詳細鑑定をお願いします。`;

const detailedThemes = [
  "相手の今の気持ち",
  "相談者への印象",
  "相手が隠している本音",
  "なぜ今動けないのか",
  "二人の間にある障害",
  "近い未来の流れ",
  "相談者が次にどう動くべきか",
];

const freeModeButton = document.querySelector("#freeModeButton");
const detailedModeButton = document.querySelector("#detailedModeButton");
const freePanel = document.querySelector("#freePanel");
const detailedPanel = document.querySelector("#detailedPanel");

const consultationInput = document.querySelector("#consultation");
const drawButton = document.querySelector("#drawButton");
const inputMessage = document.querySelector("#inputMessage");
const characterCount = document.querySelector("#characterCount");

const detailedForm = document.querySelector("#detailedForm");
const detailedDrawButton = document.querySelector("#detailedDrawButton");
const detailedInputMessage = document.querySelector("#detailedInputMessage");

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

    drawButton.disabled = false;
    drawButton.textContent = "✦ 3枚引く";
    detailedDrawButton.disabled = false;
    detailedDrawButton.textContent = "✦ 詳細鑑定の7枚を引く";
  } catch (error) {
    drawButton.textContent = "カードを読み込めませんでした";
    detailedDrawButton.textContent = "カードを読み込めませんでした";
    inputMessage.textContent = "ページを読み直してください";
    inputMessage.classList.add("error");
    detailedInputMessage.textContent = "カードデータを読み込めませんでした。ページを読み直してください。";
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

// 無料3枚引き用の文章を作ります。
function createFreeResult(consultation, cards) {
  const cardText = cards
    .map(
      (card, index) =>
        `${index + 1}枚目：${card.name}（${card.position}）\n恋愛メッセージ：${card.message}`,
    )
    .join("\n\n");

  return `【相談内容】
${consultation}

【カード結果】

${cardText}

${freeRequest}`;
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
ニックネーム：${formData.nickname}
相手との関係：${formData.relationship}
一番知りたいこと：${formData.mainQuestion}
最近の状況：${formData.recentSituation}
相談者の生年月日：${formatBirthdate(formData.consultantBirthdate)}
相手の生年月日：${formatBirthdate(formData.partnerBirthdate)}`;

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

// 無料と有料の入力画面を切り替えます。
function switchMode(mode) {
  const isFree = mode === "free";

  freePanel.hidden = !isFree;
  detailedPanel.hidden = isFree;
  freeModeButton.classList.toggle("is-active", isFree);
  detailedModeButton.classList.toggle("is-active", !isFree);
  freeModeButton.setAttribute("aria-selected", String(isFree));
  detailedModeButton.setAttribute("aria-selected", String(!isFree));
  resultSection.hidden = true;
  copyMessage.textContent = "";
}

freeModeButton.addEventListener("click", () => switchMode("free"));
detailedModeButton.addEventListener("click", () => switchMode("detailed"));

// 無料3枚引きを実行します。
drawButton.addEventListener("click", () => {
  const consultation = consultationInput.value.trim();

  if (!consultation) {
    inputMessage.textContent = "相談内容を入力してから、3枚引いてください";
    inputMessage.classList.add("error");
    consultationInput.focus();
    return;
  }

  inputMessage.textContent = "相談内容を受け取りました";
  inputMessage.classList.remove("error");
  const selectedCards = createCardResults(3);
  showResult(createFreeResult(consultation, selectedCards), "無料3枚の結果", "FREE RESULT");
});

// 無料相談の入力文字数を表示します。
consultationInput.addEventListener("input", () => {
  characterCount.textContent = `${consultationInput.value.length}文字`;

  if (consultationInput.value.trim()) {
    inputMessage.textContent = "相談文を入力中です";
    inputMessage.classList.remove("error");
  } else {
    inputMessage.textContent = "相談文を入力してください";
  }
});

// 有料7枚引きとライフパス計算を実行します。
detailedForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!detailedForm.reportValidity()) {
    detailedInputMessage.textContent = "必須項目を入力してください。";
    return;
  }

  const formData = {
    nickname: document.querySelector("#nickname").value.trim(),
    relationship: document.querySelector("#relationship").value.trim(),
    mainQuestion: document.querySelector("#mainQuestion").value.trim(),
    recentSituation: document.querySelector("#recentSituation").value.trim(),
    consultantBirthdate: document.querySelector("#consultantBirthdate").value,
    partnerBirthdate: document.querySelector("#partnerBirthdate").value,
  };

  detailedInputMessage.textContent = "";
  const selectedCards = createCardResults(7);
  showResult(
    createDetailedResult(formData, selectedCards),
    "詳細7枚＋数秘の結果",
    "DETAILED RESULT",
  );
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

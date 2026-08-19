// Python版のtarot_cards.jsonを参考にした、3枚分のカードデータです。
const tarotCards = [
  {
    name: "愚者",
    loveUpright: "新しい恋の始まりや、自由で素直な気持ちを表しています。",
    loveReversed: "勢いだけで進まず、相手との関係を落ち着いて考えましょう。",
  },
  {
    name: "魔術師",
    loveUpright: "自分から行動することで、恋が良い方向へ進みそうです。",
    loveReversed: "言葉だけにならないよう、誠実な行動を心がけましょう。",
  },
  {
    name: "女教皇",
    loveUpright: "焦らず相手を見つめることで、深い信頼が育ちそうです。",
    loveReversed: "考えすぎや心の閉ざしすぎに注意し、素直な気持ちを大切にしましょう。",
  },
];

const chatGptRequest = `【ChatGPTへの依頼】

あなたは恋愛相談に強いタロット占い師です。
以下の相談内容と3枚のカード結果をもとに、
相談者へ送る無料恋愛タロット鑑定文を作成してください。

ルール：
・600〜1000文字程度
・優しく自然な日本語
・相談内容にきちんと触れる
・カード1枚ずつの意味を説明する
・最後に3枚をまとめた総合鑑定を書く
・今できるアドバイスを1つ伝える
・未来を断定しない
・不安を煽らない
・そのまま相談者へ送れる文章だけを出力する`;

const consultationInput = document.querySelector("#consultation");
const drawButton = document.querySelector("#drawButton");
const resultSection = document.querySelector("#resultSection");
const resultText = document.querySelector("#resultText");
const copyButton = document.querySelector("#copyButton");
const copyMessage = document.querySelector("#copyMessage");
const inputMessage = document.querySelector("#inputMessage");
const characterCount = document.querySelector("#characterCount");

// 元の配列を壊さず、カードの順番をランダムに並べ替えます。
function shuffleCards(cards) {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

// 選んだカードに、正位置または逆位置と恋愛メッセージを付けます。
function createCardResults() {
  return shuffleCards(tarotCards)
    .slice(0, 3)
    .map((card) => {
      const isUpright = Math.random() < 0.5;

      return {
        name: card.name,
        position: isUpright ? "正位置" : "逆位置",
        message: isUpright ? card.loveUpright : card.loveReversed,
      };
    });
}

// 相談内容、カード結果、ChatGPTへの依頼を1つの文章にします。
function createFullResult(consultation, cards) {
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

${chatGptRequest}`;
}

// 「3枚引く」ボタンが押されたときの処理です。
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
  copyMessage.textContent = "";

  const selectedCards = createCardResults();
  resultText.textContent = createFullResult(consultation, selectedCards);
  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
});

// 入力中の文字数を表示します。
consultationInput.addEventListener("input", () => {
  characterCount.textContent = `${consultationInput.value.length}文字`;

  if (consultationInput.value.trim()) {
    inputMessage.textContent = "相談文を入力中です";
    inputMessage.classList.remove("error");
  } else {
    inputMessage.textContent = "相談文を入力してください";
  }
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

// 結果全文をChatGPTへ貼り付けられるようにコピーします。
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

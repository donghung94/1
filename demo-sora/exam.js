(function () {
  const t = (k, v) => (window.I18N && window.I18N.t) ? window.I18N.t(k, v) : k;
  const LANG = (window.I18N && window.I18N.getLang) ? window.I18N.getLang() : 'vi';
  function pickExplain(q) {
    if (!q) return "";
    if (LANG === 'id' && q.explain_id) return q.explain_id;
    if (LANG === 'en' && q.explain_en) return q.explain_en;
    return q.explain || "";
  }
  function pickVi(q) {
    if (!q) return { text: "", translated: false };
    if (LANG === 'id' && q.vi_id) return { text: q.vi_id, translated: true };
    if (LANG === 'en' && q.vi_en) return { text: q.vi_en, translated: true };
    return { text: q.vi || "", translated: false };
  }
  function pickTip(q) {
    if (!q) return "";
    if (LANG === 'id' && q.tip_id) return q.tip_id;
    if (LANG === 'en' && q.tip_en) return q.tip_en;
    return q.tip || "";
  }
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);

  const setId = params.get("set");
  const practiceId = params.get("practice");
  let DATA = [];

  // ================== HỖ TRỢ g1_ & g2_ ==================
  let normalizedPracticeId = practiceId;
  if (practiceId && (practiceId.startsWith("g1_") || practiceId.startsWith("g2_"))) {
    normalizedPracticeId = practiceId;
  }

  // ================== LẤY DỮ LIỆU ==================
  if (normalizedPracticeId && window.PRACTICE_SETS && window.PRACTICE_SETS[normalizedPracticeId]) {
    DATA = JSON.parse(JSON.stringify(window.PRACTICE_SETS[normalizedPracticeId]));
    window.questions = window.PRACTICE_SETS[normalizedPracticeId];
  }
  else if (setId && window.QUESTION_SETS && window.QUESTION_SETS[setId]) {
    DATA = JSON.parse(JSON.stringify(window.QUESTION_SETS[setId]));
    window.questions = window.QUESTION_SETS[setId];
  }
  else {
    DATA = [];
    window.questions = [];
  }

  const quizEl = $("#quiz");
  const resEl = $("#result");
  const submitBtn = $("#submitBtn");
  const redoBtn = $("#redoWrong");
  const timerEl = $("#timer");

  // ---------------- TIMER ----------------
  let timeLeft = 3600;
  const tick = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (timeLeft <= 0) { submitQuiz(); return; }
    timeLeft--;
    setTimeout(tick, 1000);
  };
  tick();

  // ---------------- SHUFFLE (Fisher-Yates) ----------------
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

// ================== KIỂM TRA CHẾ ĐỘ ĐẢO CÂU ==================
  const isShuffleActive = localStorage.getItem('user_shuffle') === 'true';
  let sourceQuestions = DATA.questions || DATA; // Chú ý: Đổi const thành let ở đây

  // ================== KIỂM TRA BẢN QUYỀN ==================
  const isPremiumUser = localStorage.getItem('isPremium') === 'true';
  
  // Nếu tài khoản KHÔNG phải Premium và đang làm Bộ đề 1 (Lý thuyết chung) -> Chỉ lấy 30 câu đầu
  if (!isPremiumUser && setId === '1') {
      sourceQuestions = sourceQuestions.slice(0, 30);
  }

  // ================== BUILD QUESTIONS ==================
  const questions = sourceQuestions.map(q => {
    const correctIndex = q.answer;

    let opts = q.options.map((t, i) => ({
      text: t,
      correct: i === correctIndex
    }));

    if (isShuffleActive) shuffle(opts);
    return { ...q, options: opts };
  });

  if (isShuffleActive) shuffle(questions);

  let cur = 0;
  const user = new Array(questions.length).fill(null);

  // ================== FURIGANA ==================
  function convertFurigana(text) {
    if (!text) return text;
    return text.replace(
      /([一-龯々〆ヶ]+)\s*[（(]([^）)]+)[）)]/g,
      (m, kanji, kana) => `<ruby>${kanji}<rt>${kana}</rt></ruby>`
    );
  }

  function applyFuriganaToPage() {
    document.querySelectorAll(".q-text, .opt, .answer-line, .explain-box").forEach(el => {
      el.innerHTML = convertFurigana(el.innerHTML);
    });
  }

  // ================== RENDER ================
  function render() {
    if (!questions.length) {
      quizEl.innerHTML = "<p>" + t("no_data") + "</p>";
      return;
    }

    const q = questions[cur];
    const hasAnswered = user[cur] !== null;
    const viPick = pickVi(q);
    const tipText = pickTip(q);

    const html = `
      <div class="q-head"><div class="q-index">${t("q_index", {a: cur+1, b: questions.length})}</div></div>
      <div class="q-text">${q.q}</div>
      ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
      ${q.img ? `<div class="q-img"><img src="../${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>`: ""}
      <div class="options">
        ${q.options.map((op,i)=>{
          let cls="opt", mark="";
          if(hasAnswered){
            if(op.correct){ cls+=" correct"; mark="✅"; }
            else if(user[cur]===i){ cls+=" incorrect"; mark="❌"; }
          }
          return `<div class="${cls}" data-idx="${i}">${op.text} <span class="mark">${mark}</span></div>`;
        }).join("")}
      </div>
      <div class="nav">
        <button class="btn" id="backBtn" ${cur===0?"disabled":""}>${t("btn_back")}</button>
        <button class="btn" id="explainBtn">${t("btn_explain")}</button>
        <button class="btn" id="nextBtn" ${cur===questions.length-1?"disabled":""}>${t("btn_next")}</button>
      </div>
      <div id="explainBox" class="explain-box" style="display:${hasAnswered?"block":"none"};">
        ${viPick.text ? `<div><b>${viPick.translated ? t("label_translate_plain") : t("label_translate")}</b> ${viPick.text}</div>` : ""}
       ${pickExplain(q) ? `<div><b>${t("label_explain")}</b> ${pickExplain(q).replace(/\n/g, '<br>')}</div>` : ""}
        ${tipText ? `<div class="tip">${tipText}</div>` : ""}
      </div>
    `;

    quizEl.innerHTML = html;
    applyFuriganaToPage();

    quizEl.querySelectorAll(".opt").forEach(el => {
      el.addEventListener("click", () => {
        if (user[cur] !== null) return;
        const idx = parseInt(el.dataset.idx);
        user[cur] = idx;
        quizEl.querySelectorAll(".opt").forEach((optEl, j) => {
          const mark = optEl.querySelector(".mark");
          if (questions[cur].options[j].correct) {
            optEl.classList.add("correct");
            mark.textContent = "✅";
          } else if (j === idx) {
            optEl.classList.add("incorrect");
            mark.textContent = "❌";
          }
          optEl.style.pointerEvents = "none";
        });
        $("#explainBox").style.display = "block";
        applyFuriganaToPage();
      });
    });

    $("#backBtn").onclick = () => { if (cur > 0) { cur--; render(); } };
    
    // Nút Tiếp theo
    $("#nextBtn").onclick = () => { 
      if (user[cur] !== null && cur < questions.length - 1) { 
        cur++; 
        render(); 
      } 
    };

    $("#explainBtn").onclick = () => {
      const box = $("#explainBox");
      box.style.display = (box.style.display === "none") ? "block" : "none";
      applyFuriganaToPage();
    };
  }

  render();
  submitBtn.onclick = submitQuiz;

  function submitQuiz() {
    let correct = 0;
    const wrongs = [];
    const html = questions.map((q,i)=>{
      const picked = user[i];
      const right = q.options.find(o=>o.correct);
      const isRight = picked!==null && q.options[picked] && q.options[picked].correct;
      if(isRight){ correct++; return ""; }
      wrongs.push(q);
      const viPick = pickVi(q);
      const tipText = pickTip(q);
      return `
        <div class="result-item">
          <div class="q-text">${q.q}</div>
          ${q.hira?`<div class="hira">${q.hira}</div>`:""}
          ${q.img?`<div class="q-img"><img src="../${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>`:""}
          <div class="answer-line">❌ <b>${t("label_you_chose")}</b> ${picked!==null?q.options[picked].text:t("label_not_chosen")}</div>
          <div class="answer-line">✅ <b>${t("label_correct_answer")}</b> ${right.text}</div>
          ${viPick.text?`<div><b>${viPick.translated ? t("label_translate_plain") : t("label_translate")}</b> ${viPick.text}</div>`:""}
         ${pickExplain(q) ? `<div><b>${t("label_explain")}</b> ${pickExplain(q).replace(/\n/g, '<br>')}</div>` : ""}
          ${tipText?`<div class="tip">${tipText}</div>`:""}
        </div>
      `;
    }).join("");

    quizEl.style.display="none";
    
    resEl.style.display="block";
    resEl.innerHTML = `
      <div class="result-title">${t("result_score", {c: correct, n: questions.length})}</div>
      ${wrongs.length?`<div><b>${t("result_wrong_list")}</b></div>${html}`:`<div>${t("result_perfect")}</div>`}
    `;
    applyFuriganaToPage();
    redoBtn.style.display = wrongs.length ? "block" : "none";
    redoBtn.onclick = () => {
      shuffle(wrongs);
      questions.length = 0;
      wrongs.forEach(q=>questions.push(q));
      cur = 0;
      user.length = questions.length;
      user.fill(null);
      quizEl.style.display="block";
      resEl.style.display="none";
      redoBtn.style.display="none";
      render();
    };
  }
})();

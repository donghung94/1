(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);
  const setId = params.get("set");
  const practiceId = params.get("practice");
  let DATA = [];

  if (practiceId && window.PRACTICE_SETS?.[practiceId]) {
    DATA = JSON.parse(JSON.stringify(window.PRACTICE_SETS[practiceId]));
  } else if (setId && window.QUESTION_SETS?.[setId]) {
    DATA = JSON.parse(JSON.stringify(window.QUESTION_SETS[setId]));
  } else {
    let all = [];
    Object.values(window.PRACTICE_SETS || {}).forEach((v) => (all = all.concat(v)));
    Object.values(window.QUESTION_SETS || {}).forEach((v) => (all = all.concat(v)));
    DATA = shuffle(all).slice(0, 40);
  }

  const quizEl = $("#quiz");
  const resEl = $("#result");
  const submitBtn = $("#submitBtn");
  const timerEl = $("#timer");

  // Đồng hồ đếm ngược 60 phút
  let timeLeft = 60 * 60;
  const tick = () => {
    const m = Math.floor(timeLeft / 60),
      s = timeLeft % 60;
    timerEl.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    if (timeLeft <= 0) submitQuiz();
    else setTimeout(() => {
      timeLeft--;
      tick();
    }, 1000);
  };
  tick();

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const questions = DATA.map((q) => {
    const opts = q.options.map((t, i) => ({
      text: t,
      correct: i === q.answer,
    }));
    shuffle(opts);
    return { ...q, options: opts };
  });
  shuffle(questions);

  let cur = 0;
  const user = new Array(questions.length).fill(null);
  let showExplain = false;

  function render() {
    const q = questions[cur];
    const header = `<div class="q-head"><div class="q-index">Câu ${cur + 1}/${questions.length}</div></div>`;

    const optionsHtml = q.options
      .map((op, i) => {
        const selected = user[cur] === i;
        let cls = "";
        let icon = "";
        if (user[cur] !== null) {
          if (op.correct && selected) {
            cls = "correct";
            icon = "✅";
          } else if (!op.correct && selected) {
            cls = "incorrect";
            icon = "❌";
          } else if (op.correct && !selected) {
            // Đáp án đúng vẫn bình thường
            icon = "";
          }
        }
        return `
          <label class="opt ${cls}">
            <input type="radio" name="q${cur}" value="${i}" ${selected ? "checked" : ""}>
            <div class="opt-text">${op.text}</div>
            <span class="opt-icon">${icon}</span>
          </label>`;
      })
      .join("");

    const explainHtml =
      showExplain && (q.explain || q.tip)
        ? `
        <div class="explain-box">
          <div><strong>✅ Đáp án đúng:</strong> ${q.options.find((o) => o.correct)?.text || ""}</div>
          ${q.explain ? `<div class="explain-title">📘 Giải thích:</div><div>${q.explain}</div>` : ""}
          ${q.tip ? `<div class="tip">${q.tip}</div>` : ""}
        </div>`
        : "";

    const body = `
      <div class="q-text">${q.q}</div>
      ${q.img ? `<div class="q-img"><img src="${q.img}" alt="" style="max-width:100%;border-radius:8px;"></div>` : ""}
      ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
      <div class="options">${optionsHtml}</div>
      ${explainHtml}
      <div class="nav">
        <button class="btn nav-left" id="backBtn">⬅️ Quay lại</button>
        <button class="btn nav-center" id="explainBtn">📘 Giải thích</button>
        <button class="btn nav-right" id="nextBtn">➡️ Tiếp theo</button>
      </div>
    `;

    quizEl.innerHTML = header + body;

    // Khi chọn đáp án
    quizEl.querySelectorAll(`input[name="q${cur}"]`).forEach((el) => {
      el.addEventListener("change", (e) => {
        user[cur] = parseInt(e.target.value);
        render();
      });
    });

    // Nút quay lại
    $("#backBtn").onclick = () => {
      if (cur > 0) {
        cur--;
        showExplain = false;
        render();
      }
    };

    // Nút tiếp theo
    $("#nextBtn").onclick = () => {
      if (cur < questions.length - 1) {
        cur++;
        showExplain = false;
        render();
      } else {
        submitQuiz();
      }
    };

    // Nút giải thích
    $("#explainBtn").onclick = () => {
      showExplain = !showExplain;
      render();
    };
  }

  render();
  submitBtn.onclick = submitQuiz;

  // Phần nộp bài (giữ nguyên)
  function submitQuiz() {
    let correct = 0;
    const detailHtml = questions
      .map((q, i) => {
        const correctOpt = q.options.find((o) => o.correct);
        const picked = user[i];
        const isCorrect = picked !== null && q.options[picked]?.correct;
        if (isCorrect) correct++;

        return `
        <div class="result-item">
          <div class="q-text">${q.q}</div>
          ${q.img ? `<div class="q-img"><img src="${q.img}" alt=""></div>` : ""}
          <div class="answer-line">Bạn chọn: ${
            picked === null
              ? "<em>(chưa chọn)</em>"
              : `<span class="${isCorrect ? "correct" : "incorrect"}">${q.options[picked].text}</span>`
          }</div>
          <div class="answer-line">Đáp án đúng: <strong>${correctOpt.text}</strong></div>
          ${q.vi ? `<div class="answer-line"><strong>Dịch:</strong> ${q.vi}</div>` : ""}
          ${
            q.explain || q.tip
              ? `<div class="result-explain-box">
                   ${q.explain ? `<div class="explain-title">📘 Giải thích:</div><div>${q.explain}</div>` : ""}
                   ${q.tip ? `<div class="tip">${q.tip}</div>` : ""}
                 </div>`
              : ""
          }
        </div>`;
      })
      .join("");

    quizEl.style.display = "none";
    resEl.style.display = "block";
    resEl.innerHTML = `
      <div class="result-title">Bạn làm đúng ${correct}/${questions.length}</div>
      ${detailHtml}
      <div style="margin-top:12px;">
        <a class="btn" href="index.html">Trang Chủ</a>
      </div>
    `;
  }
})();

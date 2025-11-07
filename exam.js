(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);

  const setId = params.get("set");
  const practiceId = params.get("practice");
  let DATA = [];

  // ✅ Hỗ trợ đề thực hành nhóm 1 (g1_x)
  let normalizedPracticeId = practiceId;
  if (practiceId && practiceId.startsWith("g1_")) {
    normalizedPracticeId = practiceId;
  }

  // ✅ Ưu tiên thực hành
  if (normalizedPracticeId && window.PRACTICE_SETS && window.PRACTICE_SETS[normalizedPracticeId]) {
    DATA = JSON.parse(JSON.stringify(window.PRACTICE_SETS[normalizedPracticeId]));
    window.questions = window.PRACTICE_SETS[normalizedPracticeId];
  }
  // ✅ Lý thuyết
  else if (setId && window.QUESTION_SETS && window.QUESTION_SETS[setId]) {
    DATA = JSON.parse(JSON.stringify(window.QUESTION_SETS[setId]));
    window.questions = window.QUESTION_SETS[setId];
  }
  // ✅ Nếu không có id cụ thể → chọn ngẫu nhiên
  else {
    let allQs = [];
    if (window.PRACTICE_SETS) {
      Object.values(window.PRACTICE_SETS).forEach((arr) => (allQs = allQs.concat(arr)));
    }
    if (window.QUESTION_SETS) {
      Object.values(window.QUESTION_SETS).forEach((arr) => (allQs = allQs.concat(arr)));
    }
    DATA = shuffle(allQs).slice(0, 40);
    window.questions = DATA;
  }

  const quizEl = $("#quiz");
  const resEl = $("#result");
  const submitBtn = $("#submitBtn");
  const redoBtn = $("#redoWrong");
  const timerEl = $("#timer");

  // ⏱️ 60 phút đếm ngược
  let timeLeft = 60 * 60;
  const tick = () => {
    const m = Math.floor(timeLeft / 60),
      s = timeLeft % 60;
    timerEl.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }
    timeLeft--;
    setTimeout(tick, 1000);
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
    if (!questions.length) {
      quizEl.innerHTML = "<p>Chưa có câu hỏi cho đề này.</p>";
      return;
    }

    const q = questions[cur];
    const header = `<div class="q-head"><div class="q-index">Câu ${cur + 1}/${questions.length}</div></div>`;
    const optionsHtml = q.options
      .map((op, i) => {
        const selected = user[cur] === i;
        let cls = "";
        if (user[cur] !== null) {
          if (op.correct) cls = "correct";
          else if (selected && !op.correct) cls = "incorrect";
        }
        return `
          <label class="opt ${cls}">
            <input type="radio" name="q${cur}" value="${i}" ${selected ? "checked" : ""}>
            <div>${op.text}</div>
          </label>`;
      })
      .join("");

    const explainHtml =
      showExplain && (q.explain || q.tip)
        ? `<div class="explain-box">
              ${q.explain ? `<div class="explain-title">📘 Giải thích:</div><div>${q.explain}</div>` : ""}
              ${q.tip ? `<div class="tip">${q.tip}</div>` : ""}
           </div>`
        : "";

    const body = `
      <div class="q-text">${q.q}</div>
      ${
        q.img
          ? `<div class="q-img">
              <img src="${q.img}" alt="question image"
                   onerror="this.style.display='none';"
                   style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;">
             </div>`
          : ""
      }
      ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
      <div class="options">${optionsHtml}</div>
      ${explainHtml}
      <div class="nav">
        <button class="btn" id="backBtn">⬅️ Quay lại</button>
        <button class="btn" id="explainBtn">📘 Giải thích</button>
        <button class="btn" id="nextBtn">➡️ Tiếp theo</button>
      </div>
    `;

    quizEl.innerHTML = header + body;

    // 🔹 Lắng nghe chọn đáp án
    quizEl.querySelectorAll(`input[name="q${cur}"]`).forEach((el) => {
      el.addEventListener("change", (e) => {
        user[cur] = parseInt(e.target.value);
        render(); // vẽ lại để hiển thị màu đúng/sai
      });
    });

    // 🔹 Nút điều hướng
    $("#backBtn").onclick = () => {
      if (cur > 0) {
        cur--;
        showExplain = false;
        render();
      }
    };

    $("#nextBtn").onclick = () => {
      if (cur < questions.length - 1) {
        cur++;
        showExplain = false;
        render();
      } else {
        submitQuiz();
      }
    };

    $("#explainBtn").onclick = () => {
      showExplain = !showExplain;
      render();
    };
  }

  render();

  submitBtn.onclick = submitQuiz;

  function submitQuiz() {
    let correct = 0;
    const wrongs = [];

    const detailHtml = questions
      .map((q, i) => {
        const correctOpt = q.options.find((o) => o.correct);
        const picked = user[i];
        const isCorrect = picked !== null && q.options[picked]?.correct;

        if (isCorrect) correct++;
        else wrongs.push(i);

        const pickedHtml =
          picked === null
            ? "<em>(chưa chọn)</em>"
            : `<span class="selected ${isCorrect ? "correct" : "incorrect"}">${q.options[picked].text}</span>`;

        return `
        <div class="result-item">
          <div class="q-text">${q.q}</div>
          ${
            q.img
              ? `<div class="q-img"><img src="${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>`
              : ""
          }
          ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
          <div class="answer-line">Bạn chọn: ${pickedHtml}</div>
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
      <div style="margin-top:12px;display:flex;gap:8px">
        <a class="btn" href="index.html">Trang Chủ</a>
      </div>
    `;

    redoBtn.style.display = wrongs.length ? "block" : "none";
  }
})();

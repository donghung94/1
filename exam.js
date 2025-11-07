(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);

  const setId = params.get("set");
  const practiceId = params.get("practice");
  let DATA = [];

  // ✅ Load dữ liệu
  if (practiceId && window.PRACTICE_SETS && window.PRACTICE_SETS[practiceId]) {
    DATA = JSON.parse(JSON.stringify(window.PRACTICE_SETS[practiceId]));
  } else if (setId && window.QUESTION_SETS && window.QUESTION_SETS[setId]) {
    DATA = JSON.parse(JSON.stringify(window.QUESTION_SETS[setId]));
  } else {
    let allQs = [];
    if (window.PRACTICE_SETS)
      Object.values(window.PRACTICE_SETS).forEach((arr) => (allQs = allQs.concat(arr)));
    if (window.QUESTION_SETS)
      Object.values(window.QUESTION_SETS).forEach((arr) => (allQs = allQs.concat(arr)));
    allQs = shuffle(allQs);
    DATA = allQs.slice(0, 40);
  }

  const quizEl = $("#quiz");
  const resEl = $("#result");
  const submitBtn = $("#submitBtn");
  const redoBtn = $("#redoWrong");
  const timerEl = $("#timer");

  // ⏱️ Timer
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

  // 🔁 Trộn mảng
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ✅ Chuẩn bị dữ liệu
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

  function render() {
    const q = questions[cur];
    const header = `<div class="q-head"><div class="q-index">Câu ${cur + 1}/${questions.length}</div></div>`;
    const body = `
      <div class="q-text">${q.q}</div>
      ${q.img ? `<div class="q-img"><img src="${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>` : ""}
      ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
      <div class="options">
        ${q.options
          .map(
            (op, i) => `
          <label class="opt" data-idx="${i}">
            <input type="radio" name="q${cur}" value="${i}" ${user[cur] === i ? "checked" : ""} ${user[cur] !== null ? "disabled" : ""}>
            <div>${op.text}</div>
            <span class="mark"></span>
          </label>`
          )
          .join("")}
      </div>
      <div class="nav">
        <button class="btn" id="backBtn">⬅️ Quay lại</button>
        <button class="btn" id="explainBtn">📘 Giải thích</button>
        <button class="btn" id="nextBtn">➡️ Tiếp theo</button>
      </div>
      <div id="explainBox" class="explain-box" style="display:none;">
        ${
          q.explain || q.tip || q.vi
            ? `
            ${q.vi ? `<div><b>Dịch:</b> ${q.vi}</div>` : ""}
            ${q.explain ? `<div><b>📘 Giải thích:</b> ${q.explain}</div>` : ""}
            ${q.tip ? `<div class="tip">${q.tip}</div>` : ""}
          `
            : "<em>Không có giải thích</em>"
        }
      </div>
    `;

    quizEl.innerHTML = header + body;

    const optionEls = quizEl.querySelectorAll(".opt");
    optionEls.forEach((el) =>
      el.addEventListener("click", () => {
        if (user[cur] !== null) return; // 🔒 Đã chọn rồi thì khoá

        const idx = parseInt(el.dataset.idx);
        user[cur] = idx;
        const op = q.options[idx];

        // ✅ Hiển thị đúng/sai
        optionEls.forEach((optEl, j) => {
          const mark = optEl.querySelector(".mark");
          if (q.options[j].correct) {
            optEl.classList.add("correct");
            mark.textContent = "✅";
          }
          if (j === idx && !op.correct) {
            optEl.classList.add("incorrect");
            mark.textContent = "❌";
          }
          optEl.querySelector("input").disabled = true;
        });
      })
    );

    $("#explainBtn").onclick = () => {
      const box = $("#explainBox");
      box.style.display = box.style.display === "none" ? "block" : "none";
    };

    $("#backBtn").onclick = () => {
      if (cur > 0) {
        cur--;
        render();
      }
    };

    $("#nextBtn").onclick = () => {
      if (cur < questions.length - 1) {
        cur++;
        render();
      }
    };
  }

  render();
  submitBtn.onclick = submitQuiz;

  function submitQuiz() {
    let correct = 0;
    const wrongs = [];

    const wrongHtml = questions
      .map((q, i) => {
        const picked = user[i];
        const correctOpt = q.options.find((o) => o.correct);
        const isCorrect = picked !== null && q.options[picked]?.correct;
        if (isCorrect) correct++;
        else wrongs.push(i);

        if (isCorrect) return "";

        return `
          <div class="result-item">
            <div class="q-text">${q.q}</div>
            ${q.img ? `<img src="${q.img}" style="max-width:100%;border-radius:8px;margin:8px 0;">` : ""}
            <div class="answer-line">❌ <b>Đáp án bạn chọn:</b> ${picked !== null ? q.options[picked].text : "(chưa chọn)"}</div>
            <div class="answer-line">✅ <b>Đáp án đúng:</b> ${correctOpt.text}</div>
            ${q.vi ? `<div><b>Dịch:</b> ${q.vi}</div>` : ""}
            ${q.explain ? `<div><b>📘 Giải thích:</b> ${q.explain}</div>` : ""}
            ${q.tip ? `<div class="tip">${q.tip}</div>` : ""}
          </div>
        `;
      })
      .filter(Boolean)
      .join("");

    quizEl.style.display = "none";
    resEl.style.display = "block";

    resEl.innerHTML = `
      <div class="result-title">✅ Bạn làm đúng ${correct}/${questions.length}</div>
      ${wrongs.length ? `<div><b>Bạn đã làm sai các câu sau:</b></div>${wrongHtml}` : "<div>🎉 Bạn làm đúng tất cả!</div>"}
    `;
  }

  // 🟩 Nút làm lại câu sai luôn hiển thị
  const floatingRedo = document.createElement("button");
  floatingRedo.id = "floatingRedo";
  floatingRedo.textContent = "🔄 Làm lại câu sai";
  floatingRedo.className = "btn";
  Object.assign(floatingRedo.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    zIndex: 1000,
    display: "none",
  });
  document.body.appendChild(floatingRedo);

  floatingRedo.onclick = () => {
    const wrongs = user
      .map((v, i) => (!questions[i].options[v]?.correct ? questions[i] : null))
      .filter(Boolean);
    if (!wrongs.length) return alert("Không có câu sai để làm lại!");
    questions.length = 0;
    wrongs.forEach((q) => questions.push(q));
    cur = 0;
    user.fill(null);
    quizEl.style.display = "block";
    resEl.style.display = "none";
    floatingRedo.style.display = "none";
    render();
  };

  // Hiện nút khi nộp bài
  const originalSubmitQuiz = submitQuiz;
  submitQuiz = function () {
    originalSubmitQuiz();
    floatingRedo.style.display = "block";
  };
})();

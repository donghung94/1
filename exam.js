<script>
document.addEventListener("DOMContentLoaded", () => {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);

  const setId = params.get("set");
  const practiceId = params.get("practice");
  let DATA = [];

  // --- Load dữ liệu ---
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

  console.log("DATA length:", DATA.length, DATA);

  const quizEl = $("#quiz");
  const resEl = $("#result");
  const submitBtn = $("#submitBtn");
  const timerEl = $("#timer");

  // ⏱️ Timer
  let timeLeft = 60 * 60;
  let timerRunning = true;
  const tick = () => {
    if (!timerRunning) return;
    const m = Math.floor(timeLeft / 60),
      s = timeLeft % 60;
    if (timerEl) {
      timerEl.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }
    timeLeft--;
    setTimeout(tick, 1000);
  };

  if (timerEl) tick();

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
  let user = new Array(questions.length).fill(null);

  const isCorrectAnswer = (qIndex) => {
    const picked = user[qIndex];
    if (picked === null) return false;
    return questions[qIndex].options[picked]?.correct;
  };

  function render() {
    if (!questions[cur]) {
      quizEl.innerHTML = "<p>Không có dữ liệu câu hỏi.</p>";
      return;
    }

    const q = questions[cur];
    const header = `<div class="q-head"><div class="q-index">Câu ${cur + 1}/${questions.length}</div></div>`;
    const hasAnswered = user[cur] !== null;

    const body = `
      <div class="q-text">${q.q}</div>
      ${q.img ? `<div class="q-img"><img src="${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>` : ""}
      ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
      <div class="options">
        ${q.options.map((op, i) => {
          let optionClass = "opt";
          let markText = "";

          if (hasAnswered) {
            if (op.correct) {
              optionClass += " correct-answer";
              markText = "✅";
            } else if (user[cur] === i) {
              optionClass += " incorrect-picked";
              markText = "❌";
            }
          }

          return `
            <div class="${optionClass}" data-idx="${i}">
              <div>${op.text}</div>
              <span class="mark">${markText}</span>
            </div>`;
        }).join("")}
      </div>

      <div class="nav">
        <button class="btn" id="backBtn" ${cur === 0 ? 'disabled' : ''}>⬅️ Quay lại</button>
        <button class="btn" id="explainBtn">📘 Giải thích</button>
        <button class="btn" id="nextBtn" ${cur === questions.length - 1 ? 'disabled' : ''}>➡️ Tiếp theo</button>
      </div>

      <div id="explainBox" class="explain-box" style="display:${hasAnswered ? 'block' : 'none'};">
        ${
          q.vi || q.explain || q.tip
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
    optionEls.forEach((el) => {
      el.addEventListener("click", () => {
        if (user[cur] !== null) return;

        const idx = parseInt(el.dataset.idx);
        user[cur] = idx;

        optionEls.forEach((optEl, j) => {
          const mark = optEl.querySelector(".mark");
          if (q.options[j].correct) {
            optEl.classList.add("correct-answer");
            mark.textContent = "✅";
          } else if (j === idx) {
            optEl.classList.add("incorrect-picked");
            mark.textContent = "❌";
          }
        });

        const explainBox = $("#explainBox");
        if (explainBox) explainBox.style.display = "block";
      });
    });

    $("#explainBtn").onclick = () => {
      if (user[cur] !== null) {
        const box = $("#explainBox");
        box.style.display = box.style.display === "none" ? "block" : "none";
      } else {
        alert("Hãy chọn đáp án trước khi xem giải thích.");
      }
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
    timerRunning = false;
    let correct = 0;
    const wrongQuestions = [];

    const wrongHtml = questions.map((q, i) => {
      const picked = user[i];
      const correctOpt = q.options.find((o) => o.correct);
      const isCorrect = isCorrectAnswer(i);
      if (isCorrect) correct++;
      else wrongQuestions.push(q);

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
    }).filter(Boolean).join("");

    quizEl.style.display = "none";
    resEl.style.display = "block";

    if (floatingRedo) {
      floatingRedo.style.display = wrongQuestions.length > 0 ? "block" : "none";
    }

    resEl.innerHTML = `
      <div class="result-title">✅ Bạn làm đúng ${correct}/${questions.length}</div>
      ${wrongQuestions.length ? `<div><b>Bạn đã làm sai các câu sau:</b></div>${wrongHtml}` : "<div>🎉 Bạn làm đúng tất cả!</div>"}
    `;

    window.lastWrongQuestions = wrongQuestions;
  }

  // --- Nút Làm Lại Câu Sai ---
  const floatingRedo = document.createElement("button");
  floatingRedo.id = "floatingRedo";
  floatingRedo.textContent = "🔄 Làm lại câu sai";
  floatingRedo.style.display = "none";
  document.body.appendChild(floatingRedo);

  floatingRedo.onclick = () => {
    const wrongs = window.lastWrongQuestions || [];
    if (wrongs.length === 0) {
      alert("Không có câu sai để làm lại!");
      return;
    }

    questions.length = 0;
    shuffle(wrongs).forEach((q) => questions.push(q));
    cur = 0;
    user = new Array(questions.length).fill(null);
    timeLeft = 60 * 60;
    timerRunning = true;

    quizEl.style.display = "block";
    resEl.style.display = "none";
    floatingRedo.style.display = "none";
    render();
    tick();
  };
});
</script>

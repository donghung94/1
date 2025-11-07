(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);

  const setId = params.get("set");
  const practiceId = params.get("practice");
  let DATA = [];

  // Nếu có practice cụ thể
  if (practiceId && window.PRACTICE_SETS && window.PRACTICE_SETS[practiceId]) {
    DATA = JSON.parse(JSON.stringify(window.PRACTICE_SETS[practiceId]));
  } 
  // Nếu có set lý thuyết
  else if (setId && window.QUESTION_SETS && window.QUESTION_SETS[setId]) {
    DATA = JSON.parse(JSON.stringify(window.QUESTION_SETS[setId]));
  } 
  // Nếu không, lấy chung từ các bộ (lấy tối đa 40)
  else {
    let allQs = [];
    if (window.PRACTICE_SETS) Object.values(window.PRACTICE_SETS).forEach(a => allQs = allQs.concat(a));
    if (window.QUESTION_SETS) Object.values(window.QUESTION_SETS).forEach(a => allQs = allQs.concat(a));
    DATA = shuffle(allQs).slice(0, 40);
  }

  const quizEl = $("#quiz");
  const resEl = $("#result");
  const submitBtn = $("#submitBtn");
  const redoBtn = $("#redoWrong");
  const timerEl = $("#timer");

  // ⏱️ 60 phút
  let timeLeft = 60 * 60;
  const tick = () => {
    const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
    if (timerEl) timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (timeLeft <= 0) { submitQuiz(); return; }
    timeLeft--; setTimeout(tick, 1000);
  };
  tick();

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // chuẩn hoá dữ liệu: chuyển options thành object {text, correct}
  const questions = DATA.map((q) => {
    const opts = q.options.map((t, i) => ({ text: t, correct: i === q.answer }));
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
    // render header
    const header = `<div class="q-head"><div class="q-index">Câu ${cur+1}/${questions.length}</div></div>`;

    // render options — thêm class correct/incorrect nếu user đã chọn
    const optionsHtml = q.options.map((op, i) => {
      const selected = user[cur] === i;
      let cls = "";
      let icon = "";
      if (user[cur] !== null) {
        if (op.correct && selected) { cls = "correct"; icon = "✅"; }
        else if (!op.correct && selected) { cls = "incorrect"; icon = "❌"; }
        // Không đổi class cho đáp án đúng nếu chưa chọn — chỉ hiển thị khi bấm Giải thích hoặc sau nộp bài
      }
      return `
        <label class="opt ${cls}" data-index="${i}">
          <input type="radio" name="q${cur}" value="${i}" ${selected ? "checked" : ""}>
          <div class="opt-text">${op.text}</div>
          <span class="opt-icon">${icon}</span>
        </label>`;
    }).join("");

    // nếu showExplain thì hiện phần giải thích + đáp án đúng + tip
    const explainHtml = showExplain ? `
      <div class="explain-box">
        <div><strong>✅ Đáp án đúng:</strong> ${q.options.find(o=>o.correct)?.text || ""}</div>
        ${q.explain ? `<div class="explain-title">📘 Giải thích:</div><div>${q.explain}</div>` : ""}
        ${q.tip ? `<div class="tip">${q.tip}</div>` : ""}
      </div>` : "";

    const body = `
      <div class="q-text">${q.q}</div>
      ${ q.img ? `<div class="q-img"><img src="${q.img}" alt="question image" onerror="this.style.display='none';" style="max-width:100%;border-radius:8px;margin:8px 0;"></div>` : "" }
      ${ q.hira ? `<div class="hira">${q.hira}</div>` : "" }
      <div class="options">${optionsHtml}</div>
      ${explainHtml}
      <div class="nav">
        <button class="btn nav-left" id="backBtn">⬅️ Quay lại</button>
        <button class="btn nav-center" id="explainBtn">📘 Giải thích</button>
        <button class="btn nav-right" id="nextBtn">➡️ Tiếp theo</button>
      </div>
    `;

    quizEl.innerHTML = header + body;

    // gắn sự kiện cho radio: không tự chuyển câu nữa, chỉ lưu lựa chọn và đổi màu ngay
    quizEl.querySelectorAll(`input[name="q${cur}"]`).forEach((el) => {
      el.addEventListener("change", (e) => {
        const val = parseInt(e.target.value);
        user[cur] = val;
        // khi chọn — cập nhật UI: thêm class correct/incorrect phù hợp
        // render lại phần cùng câu (giữ trên cùng để không di chuyển trang)
        render();
      });
    });

    // nút quay lại
    $("#backBtn").onclick = () => {
      if (cur > 0) {
        cur--; showExplain = false; render();
      }
    };

    // nút tiếp theo (chỉ chuyển khi bấm)
    $("#nextBtn").onclick = () => {
      if (cur < questions.length - 1) { cur++; showExplain = false; render(); }
      else { submitQuiz(); }
    };

    // nút giải thích — toggling phần giải thích
    $("#explainBtn").onclick = () => {
      showExplain = !showExplain;
      // khi bật giải thích — cũng sẽ hiển thị trực tiếp đáp án đúng (màu) trong giao diện
      // chúng ta chỉ rerender để áp class nếu cần (mà class đáp án đúng khác với class khi đã chọn)
      render();
    };

    // Sau render, đảm bảo các label đúng/ sai được highlight (nếu user đã chọn)
    // (đã xử lý trong template thông qua class correct/incorrect)
  }

  render();

  // -------- submitQuiz: chỉ hiển thị các câu sai (đã chọn sai hoặc chưa chọn) ----------
  function submitQuiz() {
    let correctCount = 0;
    const wrongIndexes = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const picked = user[i];
      const isCorrect = picked !== null && q.options[picked] && q.options[picked].correct;
      if (isCorrect) correctCount++;
      else wrongIndexes.push(i);
    }

    // Hiển thị số làm đúng / tổng
    quizEl.style.display = "none";
    resEl.style.display = "block";

    // Nếu không có lỗi (tất cả đúng)
    if (!wrongIndexes.length) {
      resEl.innerHTML = `
        <div class="result-title">Bạn làm đúng ${correctCount}/${questions.length} — tuyệt vời! ✅</div>
        <div style="margin-top:12px;display:flex;gap:8px">
          <a class="btn" href="index.html">Trang Chủ</a>
        </div>
      `;
      redoBtn.style.display = "none";
      return;
    }

    // Build HTML chỉ cho các câu sai
    const wrongHtml = wrongIndexes.map((idx) => {
      const q = questions[idx];
      const picked = user[idx];
      const pickedText = picked === null ? '<em>(chưa chọn)</em>' : q.options[picked].text;
      const pickedIsCorrect = picked !== null && q.options[picked] && q.options[picked].correct;
      // Tạo hiển thị: đáp án bạn chọn màu đỏ; đáp án đúng màu xanh
      // For clarity: wrap picked in span.incorrect; correct in strong with green class
      const correctOpt = q.options.find(o => o.correct);
      const pickedHtml = picked === null ? '<em>(chưa chọn)</em>' : `<span class="selected incorrect">${pickedText}</span>`;
      const correctHtml = `<span class="selected correct">${correctOpt ? correctOpt.text : ''}</span>`;

      return `
        <div class="result-item">
          <div class="q-text">Câu ${idx+1}: ${q.q}</div>
          ${ q.img ? `<div class="q-img"><img src="${q.img}" alt="img" style="max-width:100%;border-radius:8px;margin:8px 0;"></div>` : "" }
          ${ q.hira ? `<div class="hira">${q.hira}</div>` : "" }
          <div class="answer-line"><strong>Bạn chọn:</strong> ${pickedHtml}</div>
          <div class="answer-line"><strong>Đáp án đúng:</strong> ${correctHtml}</div>
          ${ q.vi ? `<div class="answer-line"><strong>Dịch:</strong> ${q.vi}</div>` : "" }
          ${ q.explain || q.tip ? `<div class="result-explain-box">
              ${ q.explain ? `<div class="explain-title">📘 Giải thích:</div><div>${q.explain}</div>` : "" }
              ${ q.tip ? `<div class="tip">${q.tip}</div>` : "" }
            </div>` : "" }
        </div>
      `;
    }).join("");

    resEl.innerHTML = `
      <div class="result-title">Bạn làm đúng ${correctCount}/${questions.length}. Bạn sai ${wrongIndexes.length} câu.</div>
      <div class="wrong-list">${wrongHtml}</div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <a class="btn" href="index.html">Trang Chủ</a>
        <button id="retryWrongBtn" class="btn">Làm lại câu sai</button>
      </div>
    `;

    // Hiện nút làm lại (nếu có)
    redoBtn.style.display = "none"; // ẩn nút floating cũ nếu có; dùng nút trong result
    // Lấy nút "Làm lại câu sai" trong result
    const retryBtn = document.getElementById("retryWrongBtn");
    retryBtn.onclick = () => {
      // Tạo bộ câu hỏi mới chỉ từ wrongIndexes (giữ nguyên thứ tự hiện tại)
      const subset = wrongIndexes.map(i => questions[i]);
      // reset questions array in-place
      questions.length = 0;
      subset.forEach(q => questions.push(q));
      // reset user answers
      user.length = questions.length;
      for (let i = 0; i < questions.length; i++) user[i] = null;
      // reset state
      cur = 0;
      showExplain = false;
      // hiển thị lại quiz
      resEl.style.display = "none";
      quizEl.style.display = "block";
      render();
    };
  }

  // gắn submit
  if (submitBtn) submitBtn.onclick = submitQuiz;
})();

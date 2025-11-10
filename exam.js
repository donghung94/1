(function () {
  const $ = (sel) => document.querySelector(sel);
  const params = new URLSearchParams(location.search);

  const setId = params.get("set");
  const practiceId = params.get("practice");
  let DATA = [];

  // --- Cài đặt & Load dữ liệu ---
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
  
  if(timerEl) tick();


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
    // Trộn đáp án để tránh thứ tự cố định
    shuffle(opts);
    return { ...q, options: opts };
  });
  shuffle(questions); // Trộn thứ tự câu hỏi

  let cur = 0;
  let user = new Array(questions.length).fill(null); // Lưu trữ đáp án người dùng (index)

  // Hàm kiểm tra câu hỏi đã được trả lời đúng hay chưa
  const isCorrectAnswer = (qIndex) => {
    const picked = user[qIndex];
    if (picked === null) return false;
    return questions[qIndex].options[picked]?.correct;
  };

  function render() {
    const q = questions[cur];
    const header = `<div class="q-head"><div class="q-index">Câu ${cur + 1}/${questions.length}</div></div>`;
    const hasAnswered = user[cur] !== null;

    const body = `
      <div class="q-text">${q.q}</div>
      ${q.img ? `<div class="q-img"><img src="${q.img}" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>` : ""}
      ${q.hira ? `<div class="hira">${q.hira}</div>` : ""}
      <div class="options">
        ${q.options
          .map(
            (op, i) => {
              let optionClass = "opt"; // Bắt đầu bằng class 'opt' (từ CSS mới)
              let markText = "";

              if (hasAnswered) {
                // Nếu đã trả lời, áp dụng class tô màu (logic này vẫn đúng)
                if (op.correct) {
                  optionClass += " correct-answer"; // Đáp án đúng
                  markText = "✅";
                } else if (user[cur] === i) {
                  optionClass += " incorrect-picked"; // Đáp án sai người dùng chọn
                  markText = "❌";
                }
              } 

              // --- SỬA 1 (HTML): Bỏ <input> và thay <label> bằng <div> ---
              return `
              <div class="${optionClass}" data-idx="${i}">
                                <div>${op.text}</div>
                <span class="mark">${markText}</span>
              </div>`;
            }
          )
          .join("")}
      </div>

            <div class="nav">
        <button class="btn" id="backBtn" ${cur === 0 ? 'disabled' : ''}>⬅️ Quay lại</button>
                <button class="btn" id="explainBtn">📘 Giải thích</button>
                <button class="btn" id="nextBtn" ${cur === questions.length - 1 ? 'disabled' : ''}>➡️ Tiếp theo</button>
      </div>

            <div id="explainBox" class="explain-box" style="display:${hasAnswered ? 'block' : 'none'};">
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
    optionEls.forEach((el) => {
      el.addEventListener("click", () => {
        // Nếu đã trả lời, không làm gì (Đây là logic "Không thể thay đổi" của bạn)
        if (user[cur] !== null) return; 

        const idx = parseInt(el.dataset.idx);
        user[cur] = idx;
        const op = q.options[idx];
        const hasAnswered = true; // (Biến này không còn cần thiết nhưng giữ lại cũng không sao)

        // ✅ Hiển thị đúng/sai, áp dụng màu nền và khoá (Giữ nguyên logic)
        optionEls.forEach((optEl, j) => {
          const mark = optEl.querySelector(".mark");
          
          // --- SỬA 2 (LOGIC): Bỏ dòng disable input ---
          // optEl.querySelector("input").disabled = true; // Dòng này bị xóa

          if (q.options[j].correct) {
            // Đáp án đúng
            optEl.classList.add("correct-answer");
            mark.textContent = "✅";
          } else if (j === idx) {
            // Đáp án sai người dùng chọn
            if (!op.correct) {
              optEl.classList.add("incorrect-picked");
              mark.textContent = "❌";
            } else {
              // Trường hợp chọn đúng (cần làm lại để đảm bảo class)
              optEl.classList.add("correct-answer");
              mark.textContent = "✅";
            }
          }
        });
        
        // Hiện giải thích sau khi chọn đáp án
        const explainBox = $("#explainBox");
        if (explainBox) explainBox.style.display = "block";
      })
    });

    // Logic nút Giải thích (Giữ nguyên)
    $("#explainBtn").onclick = () => {
      if (user[cur] !== null) {
        const box = $("#explainBox");
        box.style.display = box.style.display === "none" ? "block" : "none";
      } else {
        // Sửa: Dùng alert thay vì console.log để thông báo rõ hơn
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

  // --- HÀM NỘP BÀI (Giữ nguyên) ---

  function submitQuiz() {
    timerRunning = false; // Dừng timer
    let correct = 0;
    const wrongQuestions = []; // Lưu trữ các đối tượng câu hỏi sai

    const wrongHtml = questions
      .map((q, i) => {
        const picked = user[i];
        const correctOpt = q.options.find((o) => o.correct);
        const isCorrect = isCorrectAnswer(i);
        if (isCorrect) correct++;
        else {
          wrongQuestions.push(q);
        }

        if (isCorrect) return "";

        // Hiển thị chi tiết câu sai
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
    
    // Hiển thị nút làm lại câu sai
    if (floatingRedo) {
      floatingRedo.style.display = wrongQuestions.length > 0 ? "block" : "none";
    }

    resEl.innerHTML = `
      <div class="result-title">✅ Bạn làm đúng ${correct}/${questions.length}</div>
      ${wrongQuestions.length ? `<div><b>Bạn đã làm sai các câu sau:</b></div>${wrongHtml}` : "<div>🎉 Bạn làm đúng tất cả!</div>"}
    `;

    // Lưu lại danh sách câu sai để làm lại
    window.lastWrongQuestions = wrongQuestions;
  }

  // --- Nút Làm Lại Câu Sai (fixed) (Giữ nguyên) ---
  const floatingRedo = document.createElement("button");
  floatingRedo.id = "floatingRedo";
  floatingRedo.textContent = "🔄 Làm lại câu sai";
  document.body.appendChild(floatingRedo);


  floatingRedo.onclick = () => {
SI    const wrongs = window.lastWrongQuestions || [];

    if (wrongs.length === 0) {
      console.log("Không có câu sai để làm lại!");
      return;
    }
    
    // Thiết lập lại bộ câu hỏi chỉ gồm các câu sai
    questions.length = 0; 
    shuffle(wrongs).forEach((q) => questions.push(q)); // Trộn và thêm lại

    cur = 0;
    user = new Array(questions.length).fill(null); // Reset đáp án người dùng
SI    timeLeft = 60 * 60; // Reset timer
    timerRunning = true; // Bật lại timer

    quizEl.style.display = "block";
    resEl.style.display = "none";
    floatingRedo.style.display = "none";
    render();
    tick(); // Bắt đầu lại timer
  };
})();

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
  // isShuffleActive được định nghĩa ở khối TẦNG NGƯỜI DÙNG bên dưới (sau khi biết tầng),
  // vì đảo câu chỉ dành cho Premium/Admin.
  let sourceQuestions = DATA.questions || DATA; // Chú ý: Đổi const thành let ở đây

  // ================== GIỚI HẠN THEO TẦNG NGƯỜI DÙNG ==================
  // Mọi đề đều mở cho tất cả, nhưng mỗi đề chỉ làm được FREE_LIMIT câu đầu nếu chưa Premium.
  // Chạm câu thứ FREE_LIMIT + 1 -> hiện "bức tường" theo tầng:
  // - guest (chưa đăng nhập): BẢNG ĐĂNG NHẬP (mời đăng nhập / đăng ký để học tiếp).
  // - free (đã đăng nhập): BẢNG NÂNG CẤP Premium.
  // - Premium / Admin (exam.html đã gộp admin vào cờ isPremium): không giới hạn, không đổi hành vi.
  // Tầng do exam.html / index.html ghi vào localStorage 'userTier'; thiếu thì suy ra:
  // isPremium=true -> 'premium', ngược lại -> 'guest' (người mới chưa từng đăng nhập).
  const FREE_LIMIT = 5;
  const storedTier = localStorage.getItem('userTier');
  const isPremiumUser = storedTier ? storedTier === 'premium' : (localStorage.getItem('isPremium') === 'true');
  const userTier = storedTier || (isPremiumUser ? 'premium' : 'guest');
  const isGuestUser = userTier === 'guest';
  const isFreeUser = !isPremiumUser; // cả guest lẫn free đều bị giới hạn FREE_LIMIT câu

  function showUpgradeModal() {
    const modal = document.getElementById('premium-modal');
    if (modal) modal.style.display = 'flex';
  }

  function showLoginWall() {
    const modal = document.getElementById('login-wall-modal');
    if (modal) modal.style.display = 'flex';
  }

  // Chọn bức tường theo tầng người dùng
  function showLimitWall() {
    if (isGuestUser) showLoginWall();
    else showUpgradeModal();
  }

  // Đảo câu CHỈ dành cho Premium/Admin: khách & tài khoản free luôn làm bài theo
  // thứ tự gốc của ngân hàng, bất kể trạng thái công tắc đã lưu trên máy (user_shuffle).
  const isShuffleActive = isPremiumUser && localStorage.getItem('user_shuffle') === 'true';

  // ================== BUILD QUESTIONS ==================
  const questions = sourceQuestions.map((q, bankIdx) => {
    const correctIndex = q.answer;
    // Định danh ỔN ĐỊNH của câu hỏi trong ngân hàng (dùng để lưu/khôi phục tiến trình):
    // ưu tiên field "id" của ngân hàng; câu nào thiếu id thì dùng vị trí gốc trong bộ đề.
    // Nhờ qid + oi (vị trí gốc của đáp án), khôi phục không bao giờ tô nhầm đáp án
    // sang câu khác — kể cả khi Premium bật đảo câu/đảo đáp án.
    const qid = (q.id !== undefined && q.id !== null) ? ('id:' + q.id) : ('ix:' + bankIdx);

    let opts = q.options.map((t, i) => ({
      text: t,
      correct: i === correctIndex,
      oi: i
    }));

    if (isShuffleActive) shuffle(opts);
    return { ...q, qid, options: opts };
  });

  if (isShuffleActive) shuffle(questions);

  let cur = 0;
  const user = new Array(questions.length).fill(null);

  // ================== LƯU TIẾN TRÌNH HỌC ==================
  // - Đã đăng nhập: Firestore users/{uid}.exam_progress (qua cầu nối window.__progressStore
  //   do exam.html cấp sau khi xác thực xong).
  // - Khách: cùng cấu trúc trong localStorage của máy (exam_progress_guest).
  // Cấu trúc: { sets: { <setKey>: { answers: {<qid>: <vị trí đáp án gốc>}, lastQid, lastPos,
  //               totalQ, bestScore, bestTotal, completed, updatedAt } },
  //             mockHistory: [ { at, score, total, mode } ] } — mới nhất trước, tối đa 20.
  // Đề ngẫu nhiên (randomExam / *_random): mỗi lần mở là một tổ hợp câu khác nhau nên
  // KHÔNG khôi phục giữa chừng — chỉ ghi điểm cao nhất + lịch sử thi thử khi nộp bài.
  const SET_KEY = setId ? ('set_' + setId) : ('practice_' + (practiceId || ''));
  const IS_MOCK = setId === 'randomExam' || (!!practiceId && practiceId.endsWith('_random'));
  let PROG = { sets: {}, mockHistory: [] };
  let progRec = null;
  let progStore = null;
  let progressReady = false;
  let inRedo = false;
  let saveTimer = null;

  function normalizeProgress(raw) {
    const out = { sets: {}, mockHistory: [] };
    if (raw && typeof raw === 'object') {
      if (raw.sets && typeof raw.sets === 'object') out.sets = raw.sets;
      if (Array.isArray(raw.mockHistory)) out.mockHistory = raw.mockHistory;
      // Hồ sơ cũ dạng khung {doboku: 0, kenchiku: 0} -> coi như chưa có tiến trình.
    }
    return out;
  }

  function ensureRec() {
    if (!PROG.sets[SET_KEY]) {
      PROG.sets[SET_KEY] = { answers: {}, lastQid: null, lastPos: 0, totalQ: questions.length, bestScore: null, bestTotal: null, completed: false, updatedAt: 0 };
    }
    progRec = PROG.sets[SET_KEY];
    return progRec;
  }

  function flushProgress() {
    if (!progStore) return;
    try {
      const r = progStore.save(JSON.parse(JSON.stringify(PROG)));
      if (r && r.catch) r.catch(() => {});
    } catch (e) {}
  }

  function saveProgress() {
    if (!progressReady || inRedo) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(flushProgress, 500);
  }

  function recordPosition() {
    if (!progressReady || IS_MOCK || inRedo || !questions.length) return;
    const rec = ensureRec();
    rec.lastQid = questions[cur].qid;
    rec.lastPos = cur + 1;
    rec.totalQ = questions.length;
    rec.updatedAt = Date.now();
    saveProgress();
  }

  function recordSubmit(correct, total) {
    if (!progressReady || inRedo) return;
    const rec = ensureRec();
    if (rec.bestScore === null || rec.bestScore === undefined || correct > rec.bestScore) {
      rec.bestScore = correct;
      rec.bestTotal = total;
    }
    rec.completed = true;
    rec.answers = {};
    rec.lastQid = null;
    rec.updatedAt = Date.now();
    if (IS_MOCK) {
      PROG.mockHistory.unshift({ at: Date.now(), score: correct, total: total, mode: SET_KEY });
      if (PROG.mockHistory.length > 20) PROG.mockHistory.length = 20;
    }
    if (saveTimer) clearTimeout(saveTimer);
    flushProgress();
  }

  function showResumeNotice() {
    const main = document.querySelector('main.container');
    if (!main || document.getElementById('resume-notice')) return;
    const div = document.createElement('div');
    div.id = 'resume-notice';
    div.textContent = t('progress_resumed');
    div.style.cssText = 'background:#FBF0DA;border:1.5px solid #C9A24B;color:#2A2118;padding:10px 14px;border-radius:10px;margin-bottom:12px;font-size:14px;font-weight:600;text-align:center;';
    main.insertBefore(div, main.firstChild);
    setTimeout(() => { div.style.transition = 'opacity .5s'; div.style.opacity = '0'; setTimeout(() => div.remove(), 550); }, 4500);
  }

  function applyRestore() {
    if (IS_MOCK || !progRec || !progRec.answers) return;
    // Người dùng đã kịp trả lời trong lúc chờ nạp tiến trình -> tôn trọng phiên hiện tại.
    if (user.some(u => u !== null)) return;
    const answers = progRec.answers;
    let applied = 0;
    questions.forEach((q, pos) => {
      if (!Object.prototype.hasOwnProperty.call(answers, q.qid)) return;
      // Free/khách: chỉ khôi phục trong FREE_LIMIT câu đầu — đáp án của các câu sau
      // (vd còn sót từ thời Premium) không được hiển thị.
      if (isFreeUser && pos >= FREE_LIMIT) return;
      const j = q.options.findIndex(o => o.oi === answers[q.qid]);
      if (j >= 0) { user[pos] = j; applied++; }
    });
    if (!applied) return;
    let target = -1;
    if (progRec.lastQid) target = questions.findIndex(q => q.qid === progRec.lastQid);
    if (target < 0) {
      const firstBlank = user.findIndex(u => u === null);
      target = firstBlank >= 0 ? firstBlank : questions.length - 1;
    }
    if (isFreeUser && target >= FREE_LIMIT) target = FREE_LIMIT - 1;
    cur = Math.max(0, target);
    showResumeNotice();
    render();
  }

  if (!window.__progressStore) {
    // exam.js (script thường) chạy TRƯỚC module xác thực của exam.html (module bị defer),
    // nên tự tạo promise chờ ở đây; module sẽ resolve nó qua window.__resolveProgressStore.
    window.__progressStore = new Promise((resolve) => { window.__resolveProgressStore = resolve; });
  }
  if (window.__progressStore) {
    window.__progressStore.then(async (store) => {
      if (!store) return;
      progStore = store;
      try { PROG = normalizeProgress(await store.load()); }
      catch (e) { PROG = { sets: {}, mockHistory: [] }; }
      progRec = PROG.sets[SET_KEY] || null;
      progressReady = true;
      applyRestore();
    }).catch(() => {});
  }

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

    // Chốt an toàn: tài khoản free không bao giờ hiển thị câu quá FREE_LIMIT
    if (isFreeUser && cur >= FREE_LIMIT) cur = FREE_LIMIT - 1;

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
        // Lưu tiến trình: ghi đáp án theo qid + vị trí đáp án gốc (oi)
        if (progressReady && !IS_MOCK && !inRedo) {
          const rec = ensureRec();
          rec.answers[questions[cur].qid] = questions[cur].options[idx].oi;
          rec.lastQid = questions[cur].qid;
          rec.lastPos = cur + 1;
          rec.totalQ = questions.length;
          rec.updatedAt = Date.now();
          saveProgress();
        }
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

    $("#backBtn").onclick = () => { if (cur > 0) { cur--; recordPosition(); render(); } };

    // Nút Tiếp theo
    $("#nextBtn").onclick = () => {
      if (user[cur] === null) return;
      // Chưa Premium (guest/free): bấm qua câu thứ FREE_LIMIT + 1 -> hiện bức tường theo tầng
      // (khách: bảng đăng nhập; free: bảng nâng cấp), đứng yên ở câu cuối miễn phí
      if (isFreeUser && cur + 1 >= FREE_LIMIT) { showLimitWall(); return; }
      if (cur < questions.length - 1) {
        cur++;
        recordPosition();
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
    // Chặn rò rỉ khi xem lại: tài khoản free chỉ được chấm & xem đáp án/giải thích
    // của FREE_LIMIT câu đầu — các câu sau không xuất hiện ở màn hình kết quả.
    const scope = isFreeUser ? questions.slice(0, FREE_LIMIT) : questions;
    let correct = 0;
    const wrongs = [];
    const html = scope.map((q,i)=>{
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

    // Ghi nhận kết quả vào tiến trình: điểm cao nhất + hoàn thành (+ lịch sử thi thử
    // nếu là đề ngẫu nhiên). Đáp án dở dang được xóa để lần làm sau bắt đầu sạch.
    recordSubmit(correct, scope.length);

    quizEl.style.display="none";

    resEl.style.display="block";
    resEl.innerHTML = `
      <div class="result-title">${t("result_score", {c: correct, n: scope.length})}</div>
      ${wrongs.length?`<div><b>${t("result_wrong_list")}</b></div>${html}`:`<div>${t("result_perfect")}</div>`}
    `;
    applyFuriganaToPage();
    redoBtn.style.display = wrongs.length ? "block" : "none";
    redoBtn.onclick = () => {
      inRedo = true; // Làm lại câu sai là chế độ riêng — không ghi đè tiến trình của bộ đề gốc
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

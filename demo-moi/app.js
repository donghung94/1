/* ============================================================
   BẢN DEMO GIAO DIỆN MỚI — hướng B "Công trường chuyên nghiệp"
   - Đăng nhập: STUB (không gọi Firebase, bấm là vào).
   - Dữ liệu: data.js chuyển từ ngân hàng câu hỏi thật của repo.
   - Các tham số ?shot=... chỉ phục vụ chụp ảnh kiểm tra giao diện.
   ============================================================ */
'use strict';
const $app = document.getElementById('app');
const BANK = window.BANK;
const LETTERS = ['A', 'B', 'C', 'D'];

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
/* Kanji + （よみ） -> <ruby> */
function ruby(s) {
  return esc(s).replace(/([一-鿿々ヶ]+)[（(]([ぁ-んァ-ヶー・]+)[）)]/g, '<ruby>$1<rt>$2</rt></ruby>');
}
function catTotal(cat) { return BANK[cat].sets.reduce((a, s) => a + s.questions.length, 0); }
function allTotal() { return Object.keys(BANK).reduce((a, c) => a + catTotal(c), 0); }
function allSets() { return Object.keys(BANK).reduce((a, c) => a + BANK[c].sets.length, 0); }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

const HAT = '<svg width="25" height="25" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 3h5.6v4H9.2z" fill="#ff7a1a"/><path d="M6.3 14.2v-1.4C6.3 9.4 8.9 6.9 12 6.9s5.7 2.5 5.7 5.9v1.4" fill="#ff8c3a"/><rect x="2.6" y="14" width="18.8" height="2.8" rx="1.4" fill="#ff7a1a"/><rect x="2.6" y="19.4" width="18.8" height="1.6" rx=".8" fill="#2a3c5f"/></svg>';

function topbar(back) {
  if (back) {
    return '<div class="hazard"></div><div class="topbar compact">' +
      '<button class="iconbtn" onclick="history.back()">\u2039 Quay l\u1EA1i</button>' +
      '<div class="logo"><div class="mark">' + HAT + '</div><div><div class="name">TOKUTEI <b>X\u00C2Y D\u1EF0NG</b></div></div></div>' +
      '<div class="userchip"><span class="badge">\u2B50 PREMIUM</span></div></div>';
  }
  return '<div class="hazard"></div><div class="topbar">' +
    '<div class="logo"><div class="mark">' + HAT + '</div><div><div class="name">TOKUTEI <b>X\u00C2Y D\u1EF0NG</b></div>' +
    '<div class="tag">Luy\u1EC7n thi K\u1EF9 n\u0103ng \u0111\u1EB7c \u0111\u1ECBnh s\u1ED1 2</div></div></div>' +
    '<div class="userchip"><div class="uname">H\u1ECDc vi\u00EAn</div><span class="badge">\u2B50 PREMIUM</span></div></div>';
}

/* ---------------- LOGIN (STUB — no Firebase) ---------------- */
function vLogin() {
  document.title = 'Đăng nhập — Bản test giao diện mới';
  $app.innerHTML =
    '<div class="login"><div class="hazard"></div><div class="hero">' +
    '<div class="mark">' + HAT.replace('25', '46').replace('25', '46') + '</div>' +
    '<h1>TOKUTEI <b>XÂY DỰNG</b></h1>' +
    '<p class="sub">Luyện thi Kỹ năng đặc định số 2 — ngành Xây dựng</p></div>' +
    '<form class="form" onsubmit="event.preventDefault();location.hash=\'#/home\'">' +
    '<div class="field"><label>Email</label><input type="email" placeholder="example@gmail.com" autocomplete="off"></div>' +
    '<div class="field"><label>Mật khẩu</label><input type="password" placeholder="••••••••"></div>' +
    '<button class="btn btn-acc" type="submit">Vào bản test</button>' +
    '<button class="btn btn-ghost" type="button" style="margin-top:10px" onclick="location.hash=\'#/home\'">Đăng ký tài khoản</button></form>' +
    '<div class="demo-note">🧪 <b>Bản demo giao diện mới</b> — đăng nhập đang ở chế độ thử (không kết nối Firebase), cứ bấm “Vào bản test” để xem.</div>' +
    '<div class="foot">Lưu ý: Tài khoản chỉ sử dụng tối đa <b>01 thiết bị</b>.<br>© 2025 • Quiz APP CENTER</div></div>';
}

/* ---------------- HOME ---------------- */
function vHome() {
  document.title = 'Trang chủ — Tokutei Xây Dựng (demo)';
  const groups = [
    ['g1', '🔩', 'Nhóm 1', 'Thực hành ' + BANK.g1.sets.length + ' bộ đề · ' + catTotal('g1') + ' câu hỏi'],
    ['g2', '🪜', 'Nhóm 2', 'Thực hành ' + BANK.g2.sets.length + ' bộ đề · ' + catTotal('g2') + ' câu hỏi'],
    ['g3', '🦺', 'Nhóm 3', 'Thực hành ' + BANK.g3.sets.length + ' bộ đề · ' + catTotal('g3') + ' câu hỏi']
  ];
  $app.innerHTML = topbar(false) + '<div class="wrap">' +
    '<div class="promo"><div class="k">⭐ PREMIUM</div><h3>Mở khóa toàn bộ ' + allTotal() + ' câu hỏi</h3>' +
    '<p>Toàn bộ lý thuyết + thực hành 3 nhóm, thi thử mô phỏng Prometric và video giải đề.</p>' +
    '<button class="btn btn-acc">Mở khóa ngay</button></div>' +
    '<div class="stats">' +
    '<div class="stat"><div class="n">' + allTotal() + '</div><div class="l">Câu hỏi</div></div>' +
    '<div class="stat"><div class="n">' + allSets() + '</div><div class="l">Bộ đề</div></div>' +
    '<div class="stat"><div class="n"><em>3</em> nhóm</div><div class="l">Nhóm thi</div></div></div>' +
    '<div class="notice">📢 <b>Thông báo từ Admin:</b> Chào mừng các học viên đến với hệ thống luyện đề <b>Tokutei Gino 2 Xây dựng</b> cấp tốc. Các bạn học nhóm 3 chỉ cần học 2 đề tinh gọn mới nhất nhé.</div>' +
    '<div class="sec-title">Chọn nhóm thi của bạn</div>' +
    groups.map(c => '<button class="cat" onclick="location.hash=\'#/group/' + c[0] + '\'"><span class="ic">' + c[1] + '</span><span><span class="tt">' + c[2] + '</span><div class="ds">' + c[3] + '</div></span><span class="chev">›</span></button>').join('') +
    '<button class="cat shared" onclick="location.hash=\'#/sets/theory\'"><span class="ic">📘</span><span><span class="tt">Lý thuyết chung</span><div class="ds">Đề chung cho cả 3 nhóm · ' + BANK.theory.sets.length + ' bộ đề · ' + catTotal('theory') + ' câu hỏi</div></span><span class="sharedtag">CHUNG</span></button>' +
    '<button class="cat hot" onclick="location.hash=\'#/exam\'"><span class="ic">⏱️</span><span><span class="tt">Thi thử mô phỏng</span><div class="ds">40 câu ngẫu nhiên · bấm giờ 60 phút · giống kỳ thi thật</div></span><span class="chev">›</span></button>' +
    '<div class="foot-ver">Giao diện mới — bản test thử · Dữ liệu: ngân hàng đề thật của app</div></div>';
}

/* ---------------- SET PICKER ---------------- */
function vSets(cat) {
  const C = BANK[cat]; if (!C) return vHome();
  document.title = C.label + ' — chọn bộ đề';
  const rows = C.sets.map((s, i) =>
    '<button class="setrow" onclick="startPractice(\'' + cat + '\',\'' + s.id + '\')">' +
    '<span class="no">' + (i + 1) + '</span><span><span class="tt">' + esc(s.title) + (i < 3 && cat === 'theory' ? '<span class="free">MIỄN PHÍ</span>' : '') + '</span>' +
    '<div class="ds">' + s.questions.length + ' câu hỏi</div></span><span class="chev">›</span></button>').join('');
  $app.innerHTML = topbar(true) + '<div class="wrap">' +
    '<div class="sec-title" style="margin-top:6px">' + esc(C.label) + '</div>' +
    '<p class="muted small" style="margin:0 2px 14px">Chọn một bộ đề để luyện tập. Đáp án và giải thích hiện ngay sau mỗi câu.</p>' +
    rows + '</div>';
}

/* ---------------- GROUP SCREEN ---------------- */
const GNAME = { g1: 'Nhóm 1', g2: 'Nhóm 2', g3: 'Nhóm 3' };
function vGroup(g) {
  const C = BANK[g]; if (!C) return vHome();
  document.title = GNAME[g] + ' — Tokutei Xây Dựng (demo)';
  const rows = C.sets.map((s, i) =>
    '<button class="setrow" onclick="startPractice(\'' + g + '\',\'' + s.id + '\')">' +
    '<span class="no">' + (i + 1) + '</span><span><span class="tt">' + esc(s.title) + '</span>' +
    '<div class="ds">' + s.questions.length + ' câu hỏi</div></span><span class="chev">›</span></button>').join('');
  $app.innerHTML = topbar(true) + '<div class="wrap">' +
    '<div class="sec-title" style="margin-top:6px">' + GNAME[g] + '</div>' +
    '<button class="cat shared" onclick="location.hash=\'#/sets/theory\'"><span class="ic">📘</span><span><span class="tt">Lý thuyết chung</span><div class="ds">Đề chung cho cả 3 nhóm · ' + BANK.theory.sets.length + ' bộ đề · ' + catTotal('theory') + ' câu hỏi</div></span><span class="sharedtag">CHUNG</span></button>' +
    '<div class="sec-title">Bộ đề thực hành — ' + GNAME[g] + '</div>' +
    rows + '</div>';
}

/* ---------------- EXAM SCOPE PICKER ---------------- */
function vExam() {
  document.title = 'Thi thử mô phỏng';
  const scopes = [['g1', 'Nhóm 1'], ['g2', 'Nhóm 2'], ['g3', 'Nhóm 3']];
  $app.innerHTML = topbar(true) + '<div class="wrap">' +
    '<div class="sec-title" style="margin-top:6px">Thi thử mô phỏng</div>' +
    '<p class="muted small" style="margin:0 2px 14px">Đề thi thử theo nhóm gồm <b style="color:var(--txt)">lý thuyết chung + thực hành của nhóm</b> — <b style="color:var(--txt)">40 câu ngẫu nhiên</b>, bấm giờ <b style="color:var(--txt)">60 phút</b>. Chỉ xem đáp án sau khi nộp bài — giống kỳ thi thật.</p>' +
    scopes.map(s => '<button class="cat" onclick="startExam(\'' + s[0] + '\')"><span class="ic">⏱️</span><span><span class="tt">Thi thử — ' + s[1] + '</span><div class="ds">Lý thuyết chung + thực hành ' + s[1].toLowerCase() + ' · 40 câu · 60 phút</div></span><span class="chev">›</span></button>').join('') +
    '</div>';
}

/* ---------------- QUIZ ---------------- */
let S = null;       // session
let timerInt = null;
function stopTimer() { if (timerInt) { clearInterval(timerInt); timerInt = null; } }

function startPractice(cat, setId) {
  const set = BANK[cat].sets.find(s => s.id === setId);
  S = { mode: 'practice', title: BANK[cat].label + ' — ' + set.title, qs: set.questions, idx: 0, picked: -1, checked: false, answers: [] };
  location.hash = '#/quiz';
  vQuiz();
}
function startExam(group) {
  const pool = BANK.theory.sets.flatMap(s => s.questions).concat(BANK[group].sets.flatMap(s => s.questions));
  S = { mode: 'exam', title: 'Thi thử mô phỏng — ' + GNAME[group], qs: shuffle(pool).slice(0, 40), idx: 0, picked: -1, checked: true, answers: [], remain: 60 * 60 };
  location.hash = '#/quiz';
  vQuiz();
}
function fmtTime(t) { const m = Math.floor(t / 60), s2 = t % 60; return String(m).padStart(2, '0') + ':' + String(s2).padStart(2, '0'); }

function splitExplain(ex) {
  const parts = String(ex || '').split(/Từ vựng[:：]/);
  return { body: (parts[0] || '').trim(), vocab: parts.length > 1 ? parts.slice(1).join('Từ vựng:').trim() : '' };
}

function vQuiz() {
  if (!S) return vHome();
  stopTimer();
  const q = S.qs[S.idx];
  const isExam = S.mode === 'exam';
  const pct = Math.round(((S.idx) / S.qs.length) * 100);
  let opts = q.options.map((op, i) => {
    let cls = 'opt';
    if (isExam) { if (S.answers[S.idx] === i) cls += ' sel'; }
    else {
      if (S.picked === i && !S.checked) cls += ' sel';
      if (S.checked) {
        cls += ' locked';
        if (i === q.answer) cls += ' correct';
        else if (S.picked === i) cls += ' wrong';
      }
    }
    return '<button class="' + cls + '" onclick="pick(' + i + ')"><span class="k">' + LETTERS[i] + '</span><span>' + ruby(op) + '</span></button>';
  }).join('');

  let explainHtml = '';
  if (!isExam && S.checked) {
    const ok = S.picked === q.answer;
    const ex = splitExplain(q.explain);
    explainHtml = '<div class="explain"><div class="verdict ' + (ok ? 'ok' : 'bad') + '">' +
      (ok ? '✅ Chính xác!' : '❌ Chưa đúng — đáp án đúng là ' + LETTERS[q.answer]) + '</div>' +
      (q.vi ? '<div class="body" style="margin-bottom:4px"><b>Dịch nghĩa câu hỏi:</b> ' + esc(q.vi) + '</div>' : '') +
      (ex.body ? '<h4>Giải thích</h4><div class="body">' + esc(ex.body) + '</div>' : '') +
      (ex.vocab ? '<h4>Từ vựng</h4><div class="vocab">' + esc(ex.vocab) + '</div>' : '') +
      (q.tip ? '<div class="tipbox">' + esc(q.tip) + '</div>' : '') + '</div>';
  }

  const last = S.idx === S.qs.length - 1;
  let actions;
  if (isExam) {
    actions = (S.idx > 0 ? '<button class="btn btn-ghost" onclick="prevQ()">‹ Câu trước</button>' : '') +
      (last ? '<button class="btn btn-acc" onclick="finish()">Nộp bài</button>' : '<button class="btn btn-acc" onclick="nextQ()">Câu tiếp theo ›</button>');
  } else if (!S.checked) {
    actions = '<button class="btn btn-acc" id="checkBtn" ' + (S.picked < 0 ? 'disabled' : '') + ' onclick="check()">Kiểm tra đáp án</button>';
  } else {
    actions = last ? '<button class="btn btn-acc" onclick="finish()">Xem kết quả ›</button>' : '<button class="btn btn-acc" onclick="nextQ()">Câu tiếp theo ›</button>';
  }

  $app.innerHTML = topbar(true) +
    '<div class="qhead"><div class="qmeta"><span class="qn">Câu ' + (S.idx + 1) + '/' + S.qs.length + '</span>' +
    (isExam ? '<span class="timer" id="timer">⏱ ' + fmtTime(S.remain) + '</span>' : '<span class="timer static">' + esc(S.title) + '</span>') + '</div>' +
    '<div class="progress"><i style="width:' + pct + '%"></i></div></div>' +
    '<div class="qcard"><div class="qstem">' + ruby(q.q) + '</div>' +
    (q.img ? '<div class="qimg"><img src="' + esc(q.img) + '" alt="Hình minh họa" onerror="this.parentNode.style.display=\'none\'"></div>' : '') +
    '</div>' +
    '<div class="opts">' + opts + '</div>' +
    explainHtml +
    '<div class="qactions">' + actions + '</div>';

  if (isExam) {
    timerInt = setInterval(() => {
      S.remain--; const t = document.getElementById('timer');
      if (t) t.textContent = '⏱ ' + fmtTime(Math.max(0, S.remain));
      if (S.remain <= 0) { stopTimer(); finish(); }
    }, 1000);
  }
  // Screenshot helper: ?shot=expl auto-answers the current question correctly and shows the explanation
  if (!isExam && window.__shot === 'expl' && !S.checked) {
    S.picked = q.answer; check();
  }
  window.scrollTo(0, 0);
}
function pick(i) {
  if (!S) return;
  if (S.mode === 'exam') { S.answers[S.idx] = i; vQuiz(); return; }
  if (S.checked) return;
  S.picked = i; vQuiz();
}
function check() {
  if (!S || S.picked < 0) return;
  S.answers[S.idx] = S.picked; S.checked = true; vQuiz();
}
function nextQ() { if (S && S.idx < S.qs.length - 1) { S.idx++; S.picked = -1; S.checked = S.mode === 'exam'; vQuiz(); } }
function prevQ() { if (S && S.idx > 0) { S.idx--; vQuiz(); } }
function finish() {
  stopTimer();
  const items = S.qs.map((q, i) => ({ q: q.q, options: q.options, answer: q.answer, picked: (S.answers[i] == null ? -1 : S.answers[i]), explain: q.explain, tip: q.tip, vi: q.vi }));
  const correct = items.filter(it => it.picked === it.answer).length;
  sessionStorage.setItem('demoResult', JSON.stringify({ title: S.title, total: items.length, correct, items }));
  S = null;
  location.hash = '#/results';
  vResults();
}

/* ---------------- RESULTS ---------------- */
function vResults() {
  stopTimer();
  let R = null;
  try { R = JSON.parse(sessionStorage.getItem('demoResult') || 'null'); } catch (e) { }
  // Screenshot helper: ?shot=demo fabricates a finished session (first 10 Qs of Theory set 1, 7 correct)
  if (!R && new URLSearchParams(location.hash.split('?')[1] || '').get('shot') === 'demo') {
    const qs = BANK.theory.sets[0].questions.slice(0, 10);
    const items = qs.map((q, i) => ({ q: q.q, options: q.options, answer: q.answer, picked: [2, 5, 8].includes(i) ? (q.answer + 1) % 4 : q.answer, explain: q.explain, tip: q.tip, vi: q.vi }));
    R = { title: 'Lý thuyết chung — Bộ 1 · 問1〜問30', total: items.length, correct: items.filter(it => it.picked === it.answer).length, items };
  }
  if (!R) return vHome();
  const pct = Math.round(R.correct / R.total * 100);
  const C = 2 * Math.PI * 62;
  const ring = '<svg class="ring" viewBox="0 0 150 150"><circle cx="75" cy="75" r="62" fill="none" stroke="#1b2a47" stroke-width="12"/>' +
    '<circle cx="75" cy="75" r="62" fill="none" stroke="' + (pct >= 60 ? '#2fbf71' : '#ff7a1a') + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (C * pct / 100) + ' ' + C + '" transform="rotate(-90 75 75)"/>' +
    '<text x="75" y="76" text-anchor="middle" fill="#e9eff8" class="big">' + pct + '%</text>' +
    '<text x="75" y="98" text-anchor="middle" class="sm">điểm số</text></svg>';
  const rev = R.items.map((it, i) => {
    const ok = it.picked === it.answer;
    return '<div class="rev"><div class="rh"><span class="st ' + (ok ? 'ok' : 'bad') + '">' + (ok ? 'ĐÚNG' : 'SAI') + '</span>' +
      '<span class="rq">Câu ' + (i + 1) + '. ' + ruby(it.q) + '</span></div>' +
      '<div class="ra">Bạn chọn: <b>' + (it.picked >= 0 ? LETTERS[it.picked] + '. ' + ruby(it.options[it.picked]) : '—') + '</b>' +
      (ok ? '' : '<br>Đáp án đúng: <b>' + LETTERS[it.answer] + '. ' + ruby(it.options[it.answer]) + '</b>') + '</div></div>';
  }).join('');
  $app.innerHTML = topbar(false) +
    '<div class="scorewrap">' + ring +
    '<div class="msg">' + (pct >= 80 ? '🎉 Rất tốt! Sẵn sàng đi thi' : pct >= 60 ? '👍 Khá tốt — ôn thêm một chút nữa' : '💪 Cố lên — xem lại các câu sai nhé') + '</div>' +
    '<div class="sub">' + esc(R.title) + '<br>Đúng <b style="color:var(--txt)">' + R.correct + '/' + R.total + '</b> câu</div></div>' +
    '<div class="wrap"><div style="display:flex;gap:10px"><button class="btn btn-ghost" style="flex:1" onclick="location.hash=\'#/home\'">Về trang chủ</button>' +
    '<button class="btn btn-acc" style="flex:1" onclick="location.hash=\'#/exam\'">Thi thử tiếp</button></div>' +
    '<div class="sec-title">Xem lại bài làm</div><div class="review">' + rev + '</div>' +
    '<div class="foot-ver">Giao diện mới — bản test thử</div></div>';
  window.scrollTo(0, 0);
}

/* ---------------- ROUTER ---------------- */
function route() {
  stopTimer();
  window.__shot = new URLSearchParams(location.hash.split('?')[1] || '').get('shot');
  const h = location.hash.split('?')[0] || '#/login';
  const parts = h.replace(/^#\//, '').split('/');
  if (parts[0] === 'home') vHome();
  else if (parts[0] === 'group') vGroup(parts[1]);
  else if (parts[0] === 'sets') vSets(parts[1]);
  else if (parts[0] === 'exam') vExam();
  else if (parts[0] === 'quiz') { if (!S && parts[1] && BANK[parts[1]] && parts[2]) startPractice(parts[1], parts[2]); else vQuiz(); }
  else if (parts[0] === 'results') vResults();
  else vLogin();
}
window.addEventListener('hashchange', route);
route();

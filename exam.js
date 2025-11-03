(function(){
  const $ = (sel)=>document.querySelector(sel);
  const params = new URLSearchParams(location.search);

  const setId = params.get('set');
  const practiceId = params.get('practice');

  let DATA = [];

  // ✅ Thêm hỗ trợ load nhóm thực hành đặc biệt "g1_x" hoặc random
  let normalizedPracticeId = practiceId;

  // 👉 Nếu là random nhóm 1
  if (practiceId === "g1_random" && window.PRACTICE_SETS) {
    const allKeys = ["g1_1", "g1_2", "g1_3", "g1_4"].filter(k => window.PRACTICE_SETS[k]);
    let combined = [];
    allKeys.forEach(k=>{
      const arr = window.PRACTICE_SETS[k];
      if (arr && arr.length) {
        // chọn ngẫu nhiên 10 câu từ mỗi đề
        const shuffled = arr.sort(()=>0.5-Math.random()).slice(0,10);
        combined = combined.concat(shuffled);
      }
    });
    // Trộn tổng thể
    DATA = combined.sort(()=>0.5-Math.random());
    window.questions = DATA;
  }

  // 👉 Nếu là đề nhóm 1 cụ thể (g1_1,...)
  else if (practiceId && practiceId.startsWith("g1_") && window.PRACTICE_SETS && window.PRACTICE_SETS[practiceId]) {
    normalizedPracticeId = practiceId;
    DATA = JSON.parse(JSON.stringify(window.PRACTICE_SETS[normalizedPracticeId]));
    window.questions = window.PRACTICE_SETS[normalizedPracticeId];
  }

  // 👉 Nếu là đề lý thuyết (set=)
  else if (setId && window.QUESTION_SETS && window.QUESTION_SETS[setId]) {
    DATA = JSON.parse(JSON.stringify(window.QUESTION_SETS[setId]));
    window.questions = window.QUESTION_SETS[setId];
  }

  // 👉 Không có gì
  else {
    DATA = [];
    window.questions = [];
  }

  const quizEl = $('#quiz');
  const resEl = $('#result');
  const submitBtn = $('#submitBtn');
  const redoBtn = $('#redoWrong');
  const timerEl = $('#timer');

  // 60 minutes countdown
  let timeLeft = 60 * 60;
  const tick = ()=>{
    const m = Math.floor(timeLeft/60), s = timeLeft%60;
    timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(timeLeft<=0){ submitQuiz(); return; }
    timeLeft--; setTimeout(tick, 1000);
  };
  tick();

  // shuffle helper
  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }

  // Random hóa đáp án
  const questions = DATA.map((q,i)=>{
    const idx = q.answer;
    const opts = q.options.map((t,oi)=>({text:t, correct:(oi===idx)}));
    shuffle(opts);
    return { ...q, options: opts };
  });
  shuffle(questions);

  let cur = 0;
  const user = new Array(questions.length).fill(null);

  function render(){
    if(!questions.length){
      quizEl.innerHTML = '<p>❌ Chưa có câu hỏi cho đề này.</p>';
      return;
    }
    const q = questions[cur];
    const header = `<div class="q-head"><div class="q-index">Câu ${cur+1}/${questions.length}</div><div></div></div>`;
    const body = `
      <div class="q-text">${q.q}</div>
      ${(q.img && q.img.trim() !== '') ? 
        `<div class="q-img"><img src="${q.img}" alt="question image" onerror="this.style.display='none';" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>` 
        : ''}
      ${q.hira ? `<div class="hira">${q.hira}</div>`:''}
      <div class="options">
        ${q.options.map((op, i)=>`
          <label class="opt">
            <input type="radio" name="q${cur}" value="${i}" ${user[cur]===i?'checked':''}>
            <div>${op.text}</div>
          </label>`).join('')}
      </div>
      <div class="nav">
        <button class="btn" id="backBtn">Quay lại</button>
      </div>
    `;
    quizEl.innerHTML = header+body;

    quizEl.querySelectorAll(`input[name="q${cur}"]`).forEach(el=>{
      el.addEventListener('change', e=>{
        user[cur] = parseInt(e.target.value);
        if(cur < questions.length-1){ cur++; render(); }
      });
    });

    $('#backBtn').onclick = ()=>{ if(cur>0){ cur--; render(); } };
  }
  render();

  submitBtn.onclick = submitQuiz;

  function submitQuiz(){
    let correct = 0;
    const wrongs = [];

    const detailHtml = questions.map((q, i)=>{
      const ansIndex = q.options.findIndex(o=>o.correct);
      const ansText = q.options[ansIndex].text;
      const picked = user[i];
      const isCorrect = (picked!==null && q.options[picked] && q.options[picked].correct);

      if(isCorrect) correct++; else wrongs.push(i);

      const pickedHtml = picked===null ? '<em>(chưa chọn)</em>' :
        `<span class="selected ${isCorrect?'correct':'incorrect'}">${q.options[picked].text}</span>`;

      return `
        <div class="result-item">
          <div class="q-text">${q.q}</div>
          ${(q.img && q.img.trim() !== '') ? 
            `<div class="q-img"><img src="${q.img}" alt="question image" style="max-width:100%;border:1px solid #ccc;border-radius:8px;margin:8px 0;"></div>` 
            : ''}
          ${q.hira ? `<div class="hira">${q.hira}</div>`:''}
          <div class="answer-line">Bạn chọn: ${pickedHtml}</div>
          <div class="answer-line">Đáp án đúng: <strong>${ansText}</strong></div>
          ${q.vi ? `<div class="answer-line"><strong>Dịch:</strong> ${q.vi}</div>` : ''}
          ${q.explain || q.tip ? `
            <div class="result-explain-box">
              ${q.explain ? `<div class="explain-title">📘 Giải thích:</div><div>${q.explain}</div>` : ''} 
              ${q.tip ? `<div class="tip">${q.tip}</div>` : ''}
            </div>` : ''}
        </div>
      `;
    }).join('');

    quizEl.style.display = 'none';
    resEl.style.display = 'block';
    resEl.innerHTML = `
      <div class="result-title">✅ Bạn làm đúng ${correct}/${questions.length}</div>
      ${detailHtml}
      <div style="margin-top:12px;display:flex;gap:8px">
        <a class="btn" href="index.html">Trang Chủ</a>
      </div>
    `;
    redoBtn.style.display = wrongs.length ? 'block' : 'none';

    redoBtn.onclick = ()=>{
      if(!wrongs.length) return;
      const subset = wrongs.map(i=>questions[i]);
      questions.length = 0; subset.forEach(q=>questions.push(q));
      for(let i=0;i<user.length;i++) user[i]=null;
      cur = 0;
      quizEl.style.display = 'block'; resEl.style.display = 'none';
      redoBtn.style.display = 'none';
      render();
    };
  }
})();

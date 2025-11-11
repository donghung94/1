(function(){
  const $ = (sel)=>document.querySelector(sel);
  const params = new URLSearchParams(location.search);
  const setId = params.get('set') || '1';
  const DATA = (window.QUESTION_SETS && window.QUESTION_SETS[setId])
    ? JSON.parse(JSON.stringify(window.QUESTION_SETS[setId])) : [];

  const quizEl = $('#quiz');
  const resEl = $('#result');
  const submitBtn = $('#submitBtn');
  const redoBtn = $('#redoWrong');
  const timerEl = $('#timer');

  // ==== 1. Countdown ====
  let timeLeft = 60 * 60; // 60 phút
  const tick = ()=>{
    const m = Math.floor(timeLeft/60), s = timeLeft%60;
    timerEl.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if(timeLeft<=0){ submitQuiz(); return; }
    timeLeft--; setTimeout(tick, 1000);
  };
  tick();

  // ==== 2. Shuffle helper ====
  function shuffle(arr){
    for(let i=arr.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }
    return arr;
  }

  // ==== 3. Chuẩn bị dữ liệu ====
  const questions = DATA.map(q=>{
    const correctIndex = q.answer;
    const opts = q.options.map((t,i)=>({text:t, correct:(i===correctIndex)}));
    shuffle(opts);
    return {...q, options:opts};
  });
  shuffle(questions);

  let cur = 0;
  const user = new Array(questions.length).fill(null);

  // ==== 4. Render câu hỏi ====
  function render(){
    if(!questions.length){
      quizEl.innerHTML = '<p>Chưa có câu hỏi cho đề này.</p>';
      return;
    }

    const q = questions[cur];
    const qNumber = `Câu ${cur+1}/${questions.length}`;
    const header = `<div class="q-head"><div class="q-index">${qNumber}</div></div>`;

    const body = `
      <div class="q-text">${q.q}</div>
      ${q.hira ? `<div class="hira">${q.hira}</div>`:''}
      <div class="options">
        ${q.options.map((op,i)=>`
          <label class="opt ${user[cur]!==null ? (op.correct?'correct': (user[cur]===i?'incorrect':'')) : ''}">
            <input type="radio" name="q${cur}" value="${i}" ${user[cur]===i?'checked':''} ${user[cur]!==null?'disabled':''}>
            <div>${op.text}</div>
          </label>
        `).join('')}
      </div>

      <div class="extra" style="display:${user[cur]!==null?'block':'none'}">
        ${q.vi ? `<div class="answer-line">🇻🇳 ${q.vi}</div>`:''}
        ${q.explain ? `<div class="explain">💡 ${q.explain}</div>`:''}
        ${q.tip ? `<div class="tip">📘 ${q.tip}</div>`:''}
      </div>

      <div class="nav" style="margin-top:16px;display:flex;justify-content:center;gap:10px">
        <button class="btn" id="backBtn">⬅️ Quay lại</button>
        <div style="position:absolute;right:20px;display:flex;gap:8px">
          <button class="btn" id="explainBtn">Giải thích</button>
          <button class="btn" id="nextBtn">Tiếp theo ➡️</button>
        </div>
      </div>
    `;

    quizEl.innerHTML = header + body;

    // ==== Khi người dùng chọn đáp án ====
    quizEl.querySelectorAll(`input[name="q${cur}"]`).forEach(el=>{
      el.addEventListener('change', e=>{
        const val = parseInt(e.target.value);
        user[cur] = val;

        // Hiển thị màu và khóa tất cả lựa chọn
        quizEl.querySelectorAll(`.opt`).forEach((optEl,i)=>{
          const isCorrect = q.options[i].correct;
          if(isCorrect) optEl.classList.add('correct');
          else if(i===val) optEl.classList.add('incorrect');
          optEl.querySelector('input').disabled = true;
        });

        // Hiện giải thích
        quizEl.querySelector('.extra').style.display = 'block';
      });
    });

    // ==== Nút Quay lại ====
    $('#backBtn').onclick = ()=>{
      if(cur>0){ cur--; render(); }
    };

    // ==== Nút Giải thích ====
    $('#explainBtn').onclick = ()=>{
      const extra = quizEl.querySelector('.extra');
      if(extra) extra.style.display = (extra.style.display==='none'?'block':'none');
    };

    // ==== Nút Tiếp theo ====
    $('#nextBtn').onclick = ()=>{
      if(user[cur]===null) return alert('Hãy chọn đáp án trước khi tiếp theo!');
      if(cur < questions.length-1){
        cur++;
        render();
      } else {
        submitQuiz();
      }
    };
  }

  render();

  // ==== 5. Nút Nộp bài ====
  submitBtn.onclick = submitQuiz;

  function submitQuiz(){
    let correct = 0;
    const wrongs = [];

    const detailHtml = questions.map((q,i)=>{
      const ansIndex = q.options.findIndex(o=>o.correct);
      const ansText = q.options[ansIndex].text;
      const picked = user[i];
      const isCorrect = (picked!==null && q.options[picked] && q.options[picked].correct);
      if(isCorrect) correct++; else wrongs.push(i);

      const pickedHtml = picked===null ? '<em>(chưa chọn)</em>' :
        `<span class="${isCorrect?'correct':'incorrect'}">${q.options[picked].text}</span>`;

      return `
        <div class="result-item">
          <div class="q-text">${q.q}</div>
          ${q.hira ? `<div class="hira">${q.hira}</div>`:''}
          <div class="answer-line">Bạn chọn: ${pickedHtml}</div>
          <div class="answer-line">Đáp án đúng: <strong>${ansText}</strong></div>
          ${q.vi ? `<div class="answer-line">🇻🇳 ${q.vi}</div>`:''}
          ${q.explain ? `<div class="explain">💡 ${q.explain}</div>`:''}
          ${q.tip ? `<div class="tip">📘 ${q.tip}</div>`:''}
        </div>
      `;
    }).join('');

    quizEl.style.display = 'none';
    resEl.style.display = 'block';
    resEl.innerHTML = `
      <div class="result-title">Bạn làm đúng ${correct}/${questions.length}</div>
      ${detailHtml}
      <div style="margin-top:12px;display:flex;gap:8px">
        <a class="btn" href="index.html">🏠 Trang chủ</a>
      </div>
    `;

    // Hiện nút Làm lại câu sai
    redoBtn.style.display = wrongs.length ? 'block' : 'none';
    redoBtn.onclick = ()=>{
      if(!wrongs.length) return;
      const subset = wrongs.map(i=>questions[i]);
      questions.length = 0;
      subset.forEach(q=>questions.push(q));
      cur = 0;
      for(let i=0;i<user.length;i++) user[i]=null;
      quizEl.style.display = 'block';
      resEl.style.display = 'none';
      redoBtn.style.display = 'none';
      render();
    };
  }

  // ==== 6. Đảm bảo nút redo luôn hiển thị góc phải dưới ====
  redoBtn.style.position = 'fixed';
  redoBtn.style.bottom = '20px';
  redoBtn.style.right = '20px';
  redoBtn.style.background = '#007bff';
  redoBtn.style.color = '#fff';
})();

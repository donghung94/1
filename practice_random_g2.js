// File: practice_random_g2.js
window.PRACTICE_SETS = window.PRACTICE_SETS || {};

(function() {
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 🧩 Gộp toàn bộ câu hỏi từ 6 file practice nhóm 2
  const allQuestions = [
    ...(window.PRACTICE_SETS["1"] || []),
    ...(window.PRACTICE_SETS["2"] || []),
    ...(window.PRACTICE_SETS["3"] || []),
    ...(window.PRACTICE_SETS["4"] || []),
    ...(window.PRACTICE_SETS["5"] || []),
    ...(window.PRACTICE_SETS["6"] || [])
  ];

  // 🧮 Chọn ngẫu nhiên 40 câu (ít hơn thì lấy hết)
  const randomCount = Math.min(40, allQuestions.length);
  const randomQuestions = shuffle(allQuestions).slice(0, randomCount);

  // 🟢 Gán vào bộ đề thi nhóm 2
  window.PRACTICE_SETS["2_random"] = randomQuestions;

  console.log(`✅ Tạo đề ngẫu nhiên nhóm 2: ${randomQuestions.length} câu`);
})();

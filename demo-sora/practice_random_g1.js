window.PRACTICE_SETS = window.PRACTICE_SETS || {};

(function() {
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

// 🧩 Gộp toàn bộ câu hỏi từ các file (Truy cập vào thuộc tính .questions)
const allQuestions = [
  ...(window.PRACTICE_SETS["g1_1"]?.questions || []),
  ...(window.PRACTICE_SETS["g1_2"]?.questions || []),
  ...(window.PRACTICE_SETS["g1_3"]?.questions || []),
  ...(window.PRACTICE_SETS["g1_4"]?.questions || [])
];

  // 🧮 Chọn ngẫu nhiên 40 câu (nếu ít hơn thì lấy hết)
  const randomCount = Math.min(40, allQuestions.length);
  const randomQuestions = shuffle(allQuestions).slice(0, randomCount);

  // 🟢 Gán vào bộ đề thi
  window.PRACTICE_SETS["g1_random"] = randomQuestions;

  console.log(`✅ Tạo đề ngẫu nhiên nhóm 1: ${randomQuestions.length} câu`);
})();

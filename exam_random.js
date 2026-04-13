window.QUESTION_SETS = window.QUESTION_SETS || {};

(function() {
  // 🔹 Hàm gộp tất cả câu hỏi từ các bộ đã load
  function getAllQuestions() {
    let all = [];
    for (let key in window.QUESTION_SETS) {
      // 1. Bỏ qua bộ đề randomExam để tránh bị lặp vô tận
      if (key === "randomExam") continue;

      const data = window.QUESTION_SETS[key];

      // 2. Nếu dữ liệu là mảng trực tiếp (Dành cho bộ đề không video)
      if (Array.isArray(data)) {
        all = all.concat(data);
      } 
      // 3. Nếu dữ liệu là Object và có chứa mảng questions (Dành cho bộ có video)
      else if (data && Array.isArray(data.questions)) {
        all = all.concat(data.questions);
      }
    }
    return all;
  }

  // 🔹 Hàm trộn ngẫu nhiên mảng (Fisher–Yates shuffle)
  function shuffle(array) {
    let newArr = [...array]; // Sao chép mảng để không ảnh hưởng dữ liệu gốc
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  }

  // 🔹 Lấy ngẫu nhiên số lượng câu chỉ định
  function generateRandomExam(count) {
    const all = getAllQuestions();
    
    if (all.length === 0) {
      console.warn("⚠️ Không tìm thấy dữ liệu câu hỏi nào trong window.QUESTION_SETS!");
      return [];
    }

    const shuffled = shuffle(all);
    return shuffled.slice(0, Math.min(count, all.length));
  }

  // 🔹 Thực thi tạo đề 40 câu
  window.QUESTION_SETS["randomExam"] = generateRandomExam(40);

  console.log(`✅ Đã tạo đề ngẫu nhiên: ${window.QUESTION_SETS["randomExam"].length} câu.`);
})();

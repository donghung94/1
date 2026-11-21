window.QUESTION_SETS = window.QUESTION_SETS || {};

(function() {
  // 🔹 Hàm trộn mảng
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[arr[j]]] = [arr[j], arr[i]]; // Cách viết cũ bạn hay dùng
    }
    return arr;
  }

  // 🧩 Gộp câu hỏi từ bộ 1 đến bộ 9
  // Sử dụng ?.questions để tránh lỗi nếu thiếu file
  const allQuestions = [
    ...(window.QUESTION_SETS["1"]?.questions || []),
    ...(window.QUESTION_SETS["2"]?.questions || []),
    ...(window.QUESTION_SETS["3"]?.questions || []),
    ...(window.QUESTION_SETS["4"]?.questions || []),
    ...(window.QUESTION_SETS["5"]?.questions || []),
    ...(window.QUESTION_SETS["6"]?.questions || []),
    ...(window.QUESTION_SETS["7"]?.questions || []),
    ...(window.QUESTION_SETS["8"]?.questions || []),
    ...(window.QUESTION_SETS["9"]?.questions || [])
  ];

  // 🧮 Chọn ngẫu nhiên 40 câu
  const randomCount = Math.min(40, allQuestions.length);
  // Tạo bản sao để trộn cho an toàn dữ liệu gốc
  const finalExam = shuffle([...allQuestions]).slice(0, randomCount);

  // 🟢 Gán vào bộ đề thi ngẫu nhiên
  window.QUESTION_SETS["randomExam"] = finalExam;

  console.log(`✅ Đã nạp ${allQuestions.length} câu. Tạo đề ngẫu nhiên thành công: ${finalExam.length} câu.`);
})();

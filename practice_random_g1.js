// Tạo nếu chưa có
window.PRACTICE_SETS = window.PRACTICE_SETS || {};

// Hàm trộn mảng
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Hàm chọn ngẫu nhiên n phần tử
function pickRandom(arr, n) {
  if (!arr || !arr.length) return [];
  return shuffle([...arr]).slice(0, n);
}

// 🕐 Đảm bảo chỉ chạy sau khi 4 file practice g1 đã load
window.addEventListener("load", () => {
  const all_g1 = [
    ...(window.PRACTICE_SETS["g1_1"] || []),
    ...(window.PRACTICE_SETS["g1_2"] || []),
    ...(window.PRACTICE_SETS["g1_3"] || []),
    ...(window.PRACTICE_SETS["g1_4"] || []),
  ];

  const random_g1 = pickRandom(all_g1, 40);
  window.PRACTICE_SETS["g1_random"] = random_g1;

  console.log(`✅ practice_random_g1.js loaded: ${random_g1.length} câu hỏi`);
});

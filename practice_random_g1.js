// Tạo nếu chưa có
window.PRACTICE_SETS = window.PRACTICE_SETS || {};

// Hàm trộn mảng (shuffle)
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

// Gộp 10 câu từ mỗi đề practice g1_1 → g1_4
const random_g1 = shuffle([
  ...pickRandom(window.PRACTICE_SETS["g1_1"], 10),
  ...pickRandom(window.PRACTICE_SETS["g1_2"], 10),
  ...pickRandom(window.PRACTICE_SETS["g1_3"], 10),
  ...pickRandom(window.PRACTICE_SETS["g1_4"], 10),
]);

// Tạo bộ đề ngẫu nhiên nhóm 1
window.PRACTICE_SETS["g1_random"] = random_g1;

console.log(`✅ practice_random_g1.js loaded: ${random_g1.length} câu hỏi`);

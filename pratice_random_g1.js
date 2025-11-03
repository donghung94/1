window.PRACTICE_SETS = window.PRACTICE_SETS || {};

// Gộp tất cả đề nhóm 1
const all_g1 = [
  ...(window.PRACTICE_SETS["g1_1"] || []),
  ...(window.PRACTICE_SETS["g1_2"] || []),
  ...(window.PRACTICE_SETS["g1_3"] || []),
  ...(window.PRACTICE_SETS["g1_4"] || []),
];

// Hàm shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Random 40 câu (hoặc bao nhiêu tùy bạn)
const random_g1 = shuffle([...all_g1]).slice(0, 40);

// Tạo bộ đề mới
window.PRACTICE_SETS["g1_random"] = random_g1;

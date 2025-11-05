window.PRACTICE_SETS = window.PRACTICE_SETS || {};

(function() {
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickRandom(arr, n) {
    if (!arr || !arr.length) return [];
    return shuffle([...arr]).slice(0, n);
  }

  // 🔹 Gộp ngẫu nhiên 10 câu mỗi đề (tổng 40 câu)
  const random_g1 = shuffle([
    ...pickRandom(window.PRACTICE_SETS["g1_1"], 40),
    ...pickRandom(window.PRACTICE_SETS["g1_2"], 40),
    ...pickRandom(window.PRACTICE_SETS["g1_3"], 40),
    ...pickRandom(window.PRACTICE_SETS["g1_4"], 40)
  ]);

  window.PRACTICE_SETS["g1_random"] = random_g1;
  console.log("✅ Random practice g1:", random_g1.length, "câu");
})();

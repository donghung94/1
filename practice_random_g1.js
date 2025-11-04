// practice_random_g1.js
window.PRACTICE_SETS = window.PRACTICE_SETS || {};

(function() {

  // 🔹 Gom tất cả câu hỏi từ các bộ thực hành nhóm 1
  function getAllPractice() {
    let all = [];
    const keys = ["g1_1", "g1_2", "g1_3", "g1_4"];
    keys.forEach(k => {
      if (Array.isArray(window.PRACTICE_SETS[k])) {
        all = all.concat(window.PRACTICE_SETS[k]);
      }
    });
    return all;
  }

  // 🔹 Hàm trộn mảng ngẫu nhiên (Fisher–Yates shuffle)
  function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  // 🔹 Lấy ngẫu nhiên số lượng câu chỉ định
  function getRandomPractice(count) {
    const all = getAllPractice();
    const shuffled = shuffle(all);
    return shuffled.slice(0, count);
  }

  // 🔹 Chờ các file practice1_g1.js → practice4_g1.js load xong
  function waitForPracticeSets(callback) {
    const check = () => {
      if (
        window.PRACTICE_SETS["g1_1"]?.length &&
        window.PRACTICE_SETS["g1_2"]?.length &&
        window.PRACTICE_SETS["g1_3"]?.length &&
        window.PRACTICE_SETS["g1_4"]?.length
      ) {
        callback();
      } else {
        setTimeout(check, 200);
      }
    };
    check();
  }

  // 🔹 Tạo bộ đề ngẫu nhiên 40 câu
  waitForPracticeSets(() => {
    window.PRACTICE_SETS["g1_random"] = getRandomPractice(40);
    console.log("✅ G1 Random Practice loaded:", window.PRACTICE_SETS["g1_random"].length, "câu hỏi");
  });

})();

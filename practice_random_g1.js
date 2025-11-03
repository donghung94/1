// ✅ practice_random_g1.js — tạo đề random 40 câu từ 4 file g1_1 → g1_4

window.PRACTICE_SETS = window.PRACTICE_SETS || {};

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

// 🕐 Hàm chờ cho đến khi dữ liệu 4 đề có sẵn
function waitForPracticeSets() {
  return new Promise((resolve) => {
    const check = () => {
      if (
        window.PRACTICE_SETS["g1_1"]?.length &&
        window.PRACTICE_SETS["g1_2"]?.length &&
        window.PRACTICE_SETS["g1_3"]?.length &&
        window.PRACTICE_SETS["g1_4"]?.length
      ) {
        resolve();
      } else {
        setTimeout(check, 200); // chờ 0.2 giây rồi kiểm tra lại
      }
    };
    check();
  });
}

async function createRandomPractice() {
  await waitForPracticeSets();

  const all = [
    ...window.PRACTICE_SETS["g1_1"],
    ...window.PRACTICE_SETS["g1_2"],
    ...window.PRACTICE_SETS["g1_3"],
    ...window.PRACTICE_SETS["g1_4"],
  ];

  const random40 = pickRandom(all, 40);
  window.PRACTICE_SETS["g1_random"] = random40;

  console.log(`✅ practice_random_g1.js loaded thành công: ${random40.length} câu`);
}

createRandomPractice();

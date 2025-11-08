<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Đồng Hùng Quiz APP - Demo Sửa Lỗi</title>
    <!-- Tải Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Tùy chỉnh Font */
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f7f7f7;
        }

        /* Container chính giữa màn hình */
        .quiz-container {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }

        /* Style cho mỗi lựa chọn đáp án */
        .opt {
            display: flex;
            align-items: center;
            padding: 14px;
            margin-bottom: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
        }
        .opt:hover {
            background-color: #f9fafb;
            border-color: #d1d5db;
        }
        .opt input[type="radio"] {
            margin-right: 15px;
            min-width: 20px;
            min-height: 20px;
        }
        .opt div {
            flex-grow: 1;
        }
        .mark {
            margin-left: 10px;
            font-size: 1.2rem;
            width: 30px;
            text-align: center;
        }
        
        /* CÁC CLASS QUAN TRỌNG ĐÃ SỬA ĐỂ TÔ MÀU */
        /* Đáp án đúng (Tô màu xanh lá) */
        .opt.correct-answer {
            background-color: #d4edda; /* Nền xanh nhạt */
            border-color: #155724; /* Viền xanh đậm */
            font-weight: 500;
        }

        /* Đáp án sai do người dùng chọn (Tô màu đỏ) */
        .opt.incorrect-picked {
            background-color: #f8d7da; /* Nền đỏ nhạt */
            border-color: #721c24; /* Viền đỏ đậm */
            font-weight: 500;
            opacity: 1; 
        }

        /* Header Quiz */
        .q-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }

        /* Nút nav */
        .nav button {
            transition: background-color 0.2s;
        }

        .btn-explain {
             /* Thiết lập màu cho nút Giải thích ở giữa */
            background-color: #007bff !important;
            color: white !important;
        }
    </style>
</head>
<body>

    <div class="header bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 class="text-xl font-bold">Đồng Hùng Quiz APP</h1>
        <div class="flex items-center space-x-4">
            <span id="timer" class="text-lg font-mono">60:00</span>
            <button id="submitBtn" class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md">Nộp bài</button>
            <a href="#" class="text-white hover:text-gray-200">Trang chủ</a>
        </div>
    </div>

    <div class="quiz-container">
        <div id="quiz">
            <!-- Nội dung Quiz được chèn bằng JS -->
        </div>
        <div id="result" style="display:none;" class="p-4">
            <!-- Kết quả Quiz được chèn bằng JS -->
        </div>
    </div>

    <!-- Script mô phỏng dữ liệu -->
    <script>
        // Dữ liệu mô phỏng cho bài kiểm tra (giả lập từ window.QUESTION_SETS)
        window.QUESTION_SETS = {
            "demo": [
                {
                    q: "機械 (きかい) を用いる土工事（どこうじ）についてふさわしいものを選（えら）びなさい。",
                    hira: "きかいをもちいるどこうじについてふさわしいものをえらびなさい。",
                    options: [
                        "作業終了後、すぐにエンジンを切って帰宅の準備をする。",
                        "１日の作業終了後、安全な場所に駐車する。",
                        "日常のメンテナンスの結果を点検記録します。",
                        "バケットなどの装置を地上に降ろします。",
                    ],
                    answer: 1, // 0-indexed, đáp án đúng là "１日の作業終了後、安全な場所に駐車する。"
                    vi: "Chọn câu phù hợp về công việc đất đai sử dụng máy móc.",
                    explain: "Nguyên tắc an toàn là sau khi kết thúc công việc trong ngày, máy móc phải được đỗ ở nơi an toàn, và các bộ phận làm việc phải được hạ xuống đất.",
                    tip: "Luôn ưu tiên các quy tắc an toàn trong câu hỏi Tokutei Gino.",
                },
                {
                    q: "どの単語が正しい発音ですか？",
                    options: [
                        "ひっしつ", 
                        "ひしつ", 
                        "ひつしつ", 
                        "ひっしゅう"
                    ],
                    answer: 3, // Đáp án đúng là ひっしゅう (必修 - Bắt buộc)
                    vi: "Từ nào có phát âm đúng?",
                    explain: "Từ chính xác là 必修 (ひっしゅう), có nghĩa là bắt buộc. Các từ khác không tồn tại hoặc không phù hợp.",
                    tip: "",
                },
                {
                    q: "安全帯を着用する必要があるのは、次のうちどれですか？",
                    options: [
                        "Làm việc ở độ cao 1.5 mét trên giàn giáo.",
                        "Làm việc trong một hố sâu 1 mét.",
                        "Làm việc trên mặt đất bằng phẳng.",
                        "Làm việc trong nhà xưởng.",
                    ],
                    answer: 0, 
                    vi: "Điều nào sau đây cần thiết phải đeo đai an toàn?",
                    explain: "Theo quy định an toàn lao động, khi làm việc ở độ cao trên 2 mét, người lao động phải đeo đai an toàn. Tuy nhiên, trong nhiều tình huống, trên 1.5 mét cũng được yêu cầu nghiêm ngặt.",
                    tip: "Quy tắc an toàn về độ cao là rất quan trọng.",
                }
            ]
        };

        // --- BẮT ĐẦU CODE exam.js CỦA BẠN (ĐÃ CHỈNH SỬA) ---

        (function () {
            const $ = (sel) => document.querySelector(sel);
            const params = new URLSearchParams(location.search);

            const setId = params.get("set");
            const practiceId = params.get("practice");
            let DATA = [];

            // ✅ Load dữ liệu (Đã điều chỉnh để dùng DATA mô phỏng)
            if (practiceId && window.PRACTICE_SETS && window.PRACTICE_SETS[practiceId]) {
                DATA = JSON.parse(JSON.stringify(window.PRACTICE_SETS[practiceId]));
            } else if (setId && window.QUESTION_SETS && window.QUESTION_SETS[setId]) {
                DATA = JSON.parse(JSON.stringify(window.QUESTION_SETS[setId]));
            } else {
                // Mặc định load từ DEMO
                DATA = JSON.parse(JSON.stringify(window.QUESTION_SETS["demo"]));
            }

            const quizEl = $("#quiz");
            const resEl = $("#result");
            const submitBtn = $("#submitBtn");
            const timerEl = $("#timer");

            // ⏱️ Timer
            let timeLeft = 60 * 60;
            let timerRunning = true; // Biến kiểm soát Timer
            const tick = () => {
                if (!timerRunning) return;
                const m = Math.floor(timeLeft / 60),
                    s = timeLeft % 60;
                if (timerEl) {
                    timerEl.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
                }
                
                if (timeLeft <= 0) {
                    submitQuiz();
                    return;
                }
                timeLeft--;
                setTimeout(tick, 1000);
            };
            
            if(timerEl) tick();


            // 🔁 Trộn mảng
            function shuffle(arr) {
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }

            // ✅ Chuẩn bị dữ liệu (Áp dụng shuffle cho options)
            const questions = DATA.map((q) => {
                const opts = q.options.map((t, i) => ({
                    text: t,
                    correct: i === q.answer,
                }));
                shuffle(opts);
                return { ...q, options: opts };
            });
            shuffle(questions);

            let cur = 0;
            let user = new Array(questions.length).fill(null); 

            // Hàm kiểm tra câu hỏi đã được trả lời đúng hay chưa
            const isCorrectAnswer = (qIndex) => {
                const picked = user[qIndex];
                if (picked === null) return false;
                return questions[qIndex].options[picked]?.correct;
            };


            function render() {
                const q = questions[cur];
                const header = `<div class="q-head"><div class="q-index text-lg font-semibold">Câu ${cur + 1}/${questions.length}</div></div>`;
                const hasAnswered = user[cur] !== null;

                const body = `
                    <div class="q-text text-xl font-medium mb-4">${q.q}</div>
                    ${q.img ? `<div class="q-img my-4"><img src="${q.img}" class="max-w-full h-auto border border-gray-300 rounded-lg"></div>` : ""}
                    ${q.hira ? `<div class="hira text-gray-500 mb-4">${q.hira}</div>` : ""}
                    <div class="options space-y-2">
                        ${q.options
                            .map(
                                (op, i) => {
                                    let optionClass = "opt";
                                    let markText = "";
                                    let isDisabled = hasAnswered ? "disabled" : "";
                                    let isChecked = user[cur] === i ? "checked" : "";

                                    if (hasAnswered) {
                                        // Áp dụng class tô màu
                                        if (op.correct) {
                                            optionClass += " correct-answer"; // Đáp án đúng
                                            markText = "✅";
                                        } else if (user[cur] === i) {
                                            optionClass += " incorrect-picked"; // Đáp án sai người dùng chọn
                                            markText = "❌";
                                        }
                                    }

                                    return `
                                    <label class="${optionClass}" data-idx="${i}">
                                        <input type="radio" name="q${cur}" value="${i}" ${isChecked} ${isDisabled}>
                                        <div>${op.text}</div>
                                        <span class="mark">${markText}</span>
                                    </label>`;
                                }
                            )
                            .join("")}
                    </div>

                    <!-- THAY ĐỔI: Sắp xếp lại Nút điều hướng -->
                    <div class="nav flex justify-between items-center mt-6 space-x-2">
                        <button class="btn btn-back bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold" id="backBtn" ${cur === 0 ? 'disabled' : ''}>⬅️ Quay lại</button>
                        
                        <!-- Nút Giải thích (vị trí giữa) -->
                        <button class="btn btn-explain bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold flex-grow" id="explainBtn">📘 Giải thích</button>

                        <!-- Nút Tiếp theo (vị trí cuối) -->
                        <button class="btn btn-next bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-semibold" id="nextBtn" ${cur === questions.length - 1 ? 'disabled' : ''}>➡️ Tiếp theo</button>
                    </div>

                    <div id="explainBox" class="explain-box mt-4 p-4 border border-gray-200 bg-gray-50 rounded-lg" style="display:none;">
                        ${
                            q.explain || q.tip || q.vi
                                ? `
                                ${q.vi ? `<div class="mb-2 text-gray-700"><b>Dịch:</b> ${q.vi}</div>` : ""}
                                ${q.explain ? `<div class="mb-2 text-gray-800"><b>📘 Giải thích:</b> ${q.explain}</div>` : ""}
                                ${q.tip ? `<div class="tip text-blue-600 font-medium">${q.tip}</div>` : ""}
                                `
                                : "<em>Không có giải thích cho câu hỏi này.</em>"
                        }
                    </div>
                `;

                quizEl.innerHTML = header + body;

                const optionEls = quizEl.querySelectorAll(".opt");
                optionEls.forEach((el) => {
                    el.addEventListener("click", () => {
                        // Nếu đã trả lời, không làm gì
                        if (user[cur] !== null) return; 

                        const idx = parseInt(el.dataset.idx);
                        user[cur] = idx;
                        const op = q.options[idx];

                        // ✅ Hiển thị đúng/sai, áp dụng màu nền và khoá các input
                        optionEls.forEach((optEl, j) => {
                            const mark = optEl.querySelector(".mark");
                            optEl.querySelector("input").disabled = true;

                            if (q.options[j].correct) {
                                // Đáp án đúng
                                optEl.classList.add("correct-answer");
                                mark.textContent = "✅";
                            } else if (j === idx) {
                                // Đáp án sai người dùng chọn
                                if (!op.correct) {
                                    optEl.classList.add("incorrect-picked");
                                    mark.textContent = "❌";
                                } else {
                                    // Trường hợp chọn đúng
                                    optEl.classList.add("correct-answer");
                                    mark.textContent = "✅";
                                }
                            }
                        });
                        
                        // Hiện giải thích sau khi chọn đáp án
                        const explainBox = $("#explainBox");
                        if (explainBox) explainBox.style.display = "block";
                    })
                });

                // Xử lý nút Giải thích
                $("#explainBtn").onclick = () => {
                    if (user[cur] !== null) {
                        const box = $("#explainBox");
                        box.style.display = box.style.display === "none" ? "block" : "none";
                    } else {
                        // Thông báo cần chọn đáp án
                        alert("Hãy chọn đáp án trước khi xem giải thích!");
                    }
                };

                // Xử lý nút Quay lại
                $("#backBtn").onclick = () => {
                    if (cur > 0) {
                        cur--;
                        render();
                    }
                };

                // Xử lý nút Tiếp theo
                $("#nextBtn").onclick = () => {
                    if (cur < questions.length - 1) {
                        cur++;
                        render();
                    }
                };
            }

            render();
            submitBtn.onclick = submitQuiz;

            function submitQuiz() {
                timerRunning = false; // Dừng timer
                let correct = 0;
                const wrongQuestions = []; 

                const wrongHtml = questions
                    .map((q, i) => {
                        const picked = user[i];
                        const correctOpt = q.options.find((o) => o.correct);
                        const isCorrect = isCorrectAnswer(i);
                        if (isCorrect) correct++;
                        else {
                            // Lưu lại đối tượng câu hỏi gốc bị sai
                            wrongQuestions.push(q);
                        }

                        if (isCorrect) return "";

                        // Hiển thị chi tiết câu sai
                        return `
                            <div class="result-item border-l-4 border-red-500 p-3 mb-4 bg-red-50 rounded-lg shadow-sm">
                                <div class="q-text font-semibold mb-2">${i + 1}. ${q.q}</div>
                                ${q.img ? `<img src="${q.img}" class="max-w-full h-auto border-gray-300 rounded-lg my-2">` : ""}
                                <div class="answer-line text-red-700">❌ <b>Đáp án bạn chọn:</b> ${picked !== null ? q.options[picked].text : "(chưa chọn)"}</div>
                                <div class="answer-line text-green-700">✅ <b>Đáp án đúng:</b> ${correctOpt.text}</div>
                                ${q.vi ? `<div class="mt-2 text-sm text-gray-700"><b>Dịch:</b> ${q.vi}</div>` : ""}
                                ${q.explain ? `<div class="mt-1 text-sm text-gray-800"><b>📘 Giải thích:</b> ${q.explain}</div>` : ""}
                                ${q.tip ? `<div class="tip mt-1 text-sm text-blue-600">${q.tip}</div>` : ""}
                            </div>
                        `;
                    })
                    .filter(Boolean)
                    .join("");

                quizEl.style.display = "none";
                resEl.style.display = "block";
                
                // Hiển thị nút làm lại câu sai
                if (floatingRedo) {
                    floatingRedo.style.display = wrongQuestions.length > 0 ? "block" : "none";
                }

                resEl.innerHTML = `
                    <div class="result-title text-3xl font-extrabold mb-6 p-4 rounded-lg text-center ${correct / questions.length > 0.8 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                        Kết Quả: Bạn làm đúng ${correct}/${questions.length} (${((correct / questions.length) * 100).toFixed(1)}%)
                    </div>
                    ${wrongQuestions.length 
                        ? `<h3 class="text-xl font-bold mb-4 text-red-600">Bạn cần ôn lại các câu sau (${wrongQuestions.length} câu):</h3>${wrongHtml}` 
                        : "<div class='text-center text-xl p-8 bg-yellow-100 rounded-lg'>🎉 Bạn làm đúng tất cả! Chúc mừng!</div>"}
                `;

                // Lưu lại danh sách câu sai để làm lại
                window.lastWrongQuestions = wrongQuestions;
            }

            // --- Nút Làm Lại Câu Sai (fixed) ---
            const floatingRedo = document.createElement("button");
            floatingRedo.id = "floatingRedo";
            floatingRedo.textContent = "🔄 Làm lại câu sai";
            floatingRedo.className = "btn fixed bottom-5 right-5 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-full shadow-lg font-bold z-50 transition duration-300 transform hover:scale-105";
            floatingRedo.style.display = "none"; // Ẩn mặc định
            document.body.appendChild(floatingRedo);

            floatingRedo.onclick = () => {
                const wrongs = window.lastWrongQuestions || [];

                if (wrongs.length === 0) {
                    // Thay thế alert bằng custom UI, nhưng ở đây dùng tạm console log
                    console.log("Không có câu sai để làm lại!");
                    return;
                }
                
                // Thiết lập lại bộ câu hỏi chỉ gồm các câu sai
                questions.length = 0; 
                shuffle(wrongs).forEach((q) => questions.push(q)); // Trộn và thêm lại

                cur = 0;
                user = new Array(questions.length).fill(null); // Reset đáp án người dùng
                timeLeft = 60 * 60; // Reset timer
                timerRunning = true; // Bật lại timer

                quizEl.style.display = "block";
                resEl.style.display = "none";
                floatingRedo.style.display = "none";
                render();
                tick(); // Bắt đầu lại timer
            };
        })();
    </script>
</body>
</html>

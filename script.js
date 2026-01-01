document.addEventListener("DOMContentLoaded", () => {
    // === KHAI BÁO BIẾN ===
    const viewHome = document.getElementById("view-home");
    const viewEmptyQuiz = document.getElementById("view-empty-quiz");
    const viewUploadQuiz = document.getElementById("view-upload-quiz");
    const startScreen = document.getElementById("start-screen");
    const appLayout = document.getElementById("app-layout");

    const navHome = document.getElementById("navHome");
    const navLogo = document.getElementById("navLogo");
    const menuEmptyQuiz = document.getElementById("menuEmptyQuiz");
    const menuUploadQuiz = document.getElementById("menuUploadQuiz");
    const homeStartBtn = document.getElementById("homeStartBtn");
    const homeUploadBtn = document.getElementById("homeUploadBtn");

    const toolStartBtn = document.getElementById("toolStartBtn");
    const inputPopup = document.getElementById("input-popup");
    const numInput = document.getElementById("numInput");
    const submitNumBtn = document.getElementById("submitNumBtn");
    const cancelNumBtn = document.getElementById("cancelNumBtn");
    const questionsBox = document.getElementById("questions");
    const exportBtn = document.getElementById("exportBtn");

    const nativeNum = document.getElementById("num");
    const manualCreateBtn = document.getElementById("manualCreateBtn");
    const navGrid = document.getElementById("nav-grid");
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");
    const pageInfo = document.getElementById("pageInfo");
    const sidebarSearch = document.getElementById("sidebarSearch");
    const btnSearch = document.getElementById("btnSearch");

    const loginBtn = document.getElementById("loginBtn");
    const loginPopup = document.getElementById("login-popup");
    const closeLogin = document.querySelector(".close-login");

    let backBtn = document.createElement("button");
    backBtn.textContent = "Quay lại nhập số";
    backBtn.className = "back-btn-dyn";
    const place = document.getElementById("backBtnPlace");
    if (place) place.appendChild(backBtn);

    let totalQuestions = 50;
    let currentPage = 1;
    const itemsPerPage = 50;

    // === CHUYỂN VIEW ===
    function switchView(viewName) {
        viewHome.classList.add("hidden");
        viewEmptyQuiz.classList.add("hidden");
        viewUploadQuiz.classList.add("hidden");
        navHome.classList.remove("active");

        if (viewName === 'home') {
            viewHome.classList.remove("hidden");
            navHome.classList.add("active");
        } else if (viewName === 'empty') {
            viewEmptyQuiz.classList.remove("hidden");
            // Khi vào tool, hiện màn hình start
            startScreen.style.display = "flex";
            appLayout.style.display = "none";
        } else if (viewName === 'upload') {
            viewUploadQuiz.classList.remove("hidden");
        }
    }

    navLogo.addEventListener("click", () => switchView('home'));
    navHome.addEventListener("click", (e) => { e.preventDefault(); switchView('home'); });
    menuEmptyQuiz.addEventListener("click", (e) => { e.preventDefault(); switchView('empty'); });
    menuUploadQuiz.addEventListener("click", (e) => { e.preventDefault(); switchView('upload'); });
    homeStartBtn.addEventListener("click", () => switchView('empty'));
    homeUploadBtn.addEventListener("click", () => switchView('upload'));

    // === LOGIC TOOL ===
    toolStartBtn.addEventListener("click", () => {
        inputPopup.classList.remove("hidden");
        inputPopup.classList.add("show");
        setTimeout(() => numInput.focus(), 100);
    });

    cancelNumBtn.addEventListener("click", () => {
        inputPopup.classList.remove("show");
        inputPopup.classList.add("hidden");
    });

    submitNumBtn.addEventListener("click", () => {
        const val = Number(numInput.value);
        if (!val || val < 1) { alert("Số lượng không hợp lệ!"); return; }
        if (val > 10000) { alert("Tối đa 10,000 câu!"); return; }

        localStorage.removeItem('gin_quiz_save'); // <--- MỚI: Xóa dữ liệu cũ

        generate(val);
        startScreen.style.display = "none";
        inputPopup.classList.remove("show");
        inputPopup.classList.add("hidden");
        appLayout.style.display = "flex";

        saveProgress(); // <--- MỚI: Lưu trạng thái mới
    });

    backBtn.addEventListener("click", () => {
        if (confirm("Dữ liệu sẽ mất. Quay lại?")) {
            appLayout.style.display = "none";
            startScreen.style.display = "flex";
            questionsBox.innerHTML = "";
        }
    });

    function generate(num) {
        totalQuestions = num;
        if (nativeNum) nativeNum.value = num;
        questionsBox.innerHTML = "";
        window.scrollTo({ top: 0, behavior: "smooth" });

        for (let i = 1; i <= totalQuestions; i++) {
            let qDiv = document.createElement("div");
            qDiv.className = "question";
            qDiv.id = `q-container-${i}`;
            qDiv.innerHTML = `<b>Câu ${i}:</b> <div class="opts" id="q${i}"></div>`;
            questionsBox.appendChild(qDiv);

            ["A", "B", "C", "D", "E", "F"].forEach(letter => {
                let opt = document.createElement("label");
                opt.className = "opt";
                opt.innerHTML = `<input type='checkbox' value='${letter}' onchange='window.handleAnswerCheck(${i}, this)'> ${letter}`;
                document.getElementById("q" + i).appendChild(opt);
            });
        }
        currentPage = 1;
        renderSidebar();
    }

    window.renderSidebar = function () {
        if (!navGrid) return;
        navGrid.innerHTML = "";
        const start = (currentPage - 1) * itemsPerPage + 1;
        const end = Math.min(start + itemsPerPage - 1, totalQuestions);
        if (pageInfo) pageInfo.textContent = `${start} - ${end} / ${totalQuestions}`;

        for (let i = start; i <= end; i++) {
            let item = document.createElement("div");
            item.className = "nav-item";
            item.textContent = i;
            item.id = `nav-item-${i}`;
            if (isAnswered(i)) item.classList.add("answered");
            item.addEventListener("click", () => scrollToQuestion(i));
            navGrid.appendChild(item);
        }
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = end >= totalQuestions;
    };

    function isAnswered(idx) { return document.querySelectorAll(`#q${idx} input:checked`).length > 0; }
    window.handleAnswerCheck = function (idx, cb) {
        cb.parentElement.classList.toggle("selected", cb.checked);
        const navItem = document.getElementById(`nav-item-${idx}`);
        if (navItem) isAnswered(idx) ? navItem.classList.add("answered") : navItem.classList.remove("answered");

        saveProgress(); // <--- MỚI: Gọi hàm lưu
    };
    function scrollToQuestion(idx) {
        const el = document.getElementById(`q-container-${idx}`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: "smooth" });
            document.querySelectorAll(".question").forEach(q => q.classList.remove("active-scroll"));
            el.classList.add("active-scroll");
        }
    }

    manualCreateBtn.addEventListener("click", () => {
        const val = Number(nativeNum.value);
        if (val && val > 0 && val <= 10000) generate(val);
    });
    prevPageBtn.addEventListener("click", () => { if (currentPage > 1) { currentPage--; renderSidebar(); } });
    nextPageBtn.addEventListener("click", () => {
        const maxPage = Math.ceil(totalQuestions / itemsPerPage);
        if (currentPage < maxPage) { currentPage++; renderSidebar(); }
    });
    btnSearch.addEventListener("click", handleSearch);
    sidebarSearch.addEventListener("keypress", (e) => { if (e.key === "Enter") handleSearch(); });
    function handleSearch() {
        const val = Number(sidebarSearch.value);
        if (!val || val < 1 || val > totalQuestions) { alert("Câu không tồn tại!"); return; }
        const targetPage = Math.ceil(val / itemsPerPage);
        if (targetPage !== currentPage) { currentPage = targetPage; renderSidebar(); }
        setTimeout(() => scrollToQuestion(val), 100);
    }

    // Login
    loginBtn.addEventListener("click", () => loginPopup.classList.add("show"));
    closeLogin.addEventListener("click", () => loginPopup.classList.remove("show"));
    loginPopup.addEventListener("click", (e) => { if (e.target === loginPopup) loginPopup.classList.remove("show"); });

    // Grading
    exportBtn.addEventListener("click", () => { showGradingPopup(); });

    function showGradingPopup() {
        const bg = document.createElement("div");
        bg.className = "popup-bg";
        let htmlContent = `
            <div class="popup-box">
                <div class="score-header">
                    <div>
                        <div style="font-size:14px; color:#666;">KẾT QUẢ</div>
                        <div style="display:flex; align-items:center;">
                            <span id="scoreDisplay" class="score-big">0/100</span>
                            <span id="passStatus" class="score-status status-fail">NOT PASS</span>
                        </div>
                        <div id="quoteDisplay" style="margin-top:8px; font-style:italic; color:#555;">...</div>
                        <div style="margin-top:5px; font-size:14px;">
                            Đúng: <b id="cntTrue" style="color:#198754">0</b> | 
                            Sai: <b id="cntFalse" style="color:#dc3545">0</b>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <button id="filterWrongBtn" style="padding:8px 15px; background:white; border:2px solid #dc3545; color:#dc3545; border-radius:6px; cursor:pointer; font-weight:bold;">Chỉ hiện câu SAI</button>
                        <button class="close-popup-btn" style="background:#333; color:white; border:none; padding:8px 15px; border-radius:6px; cursor:pointer; margin-left:10px;" onclick="this.closest('.popup-bg').remove()">Đóng</button>
                    </div>
                </div>
                <div class="answer-list" id="answerList"></div>
            </div>`;
        bg.innerHTML = htmlContent;
        document.body.appendChild(bg);
        const listDiv = document.getElementById("answerList");
        let wrongCount = 0;
        for (let i = 1; i <= totalQuestions; i++) {
            let arr = [...document.querySelectorAll(`#q${i} input:checked`)].map(x => x.value);
            let userAns = arr.join(', ');
            let isUnanswered = arr.length === 0;
            let rowClass = "";
            let lockedAttr = "";
            if (isUnanswered) { rowClass = "wrong locked"; lockedAttr = "disabled"; wrongCount++; }
            let rowHtml = `
                <div class="answer-row ${rowClass}" id="row-${i}">
                    <span style="font-size:18px; font-weight:500;">${i}. ${userAns || 'Chưa làm'}</span>
                    <div class="answer-actions">
                        <button class="btn-grade btn-true" onclick="gradeItem(${i}, true)" ${lockedAttr}>Đúng</button>
                        <button class="btn-grade btn-false" onclick="gradeItem(${i}, false)" ${lockedAttr}>Sai</button>
                    </div>
                </div>`;
            listDiv.insertAdjacentHTML('beforeend', rowHtml);
        }
        updateTotalScore();
        document.getElementById("filterWrongBtn").addEventListener("click", function () {
            this.classList.toggle("active");
            const isFiltering = this.classList.contains("active");
            this.style.background = isFiltering ? "#dc3545" : "white";
            this.style.color = isFiltering ? "white" : "#dc3545";
            const rows = document.querySelectorAll(".answer-row");
            rows.forEach(row => {
                if (isFiltering) {
                    if (row.classList.contains("wrong")) row.classList.remove("hidden");
                    else row.classList.add("hidden");
                } else {
                    row.classList.remove("hidden");
                }
            });
            this.textContent = isFiltering ? "Hiện TẤT CẢ" : "Chỉ hiện câu SAI";
        });
    }

    window.gradeItem = function (id, isCorrect) {
        const row = document.getElementById(`row-${id}`);
        if (row.classList.contains("locked")) return;
        row.classList.remove("correct", "wrong");
        if (isCorrect) row.classList.add("correct");
        else row.classList.add("wrong");
        updateTotalScore();
    };

    function updateTotalScore() {
        const rows = document.querySelectorAll(".answer-row");
        let correct = 0;
        let wrong = 0;
        rows.forEach(r => { if (r.classList.contains("correct")) correct++; if (r.classList.contains("wrong")) wrong++; });
        document.getElementById("cntTrue").textContent = correct;
        document.getElementById("cntFalse").textContent = wrong;
        let score = (totalQuestions > 0) ? (correct / totalQuestions) * 100 : 0;
        let finalScore = Math.round(score * 10) / 10;
        document.getElementById("scoreDisplay").textContent = `${finalScore}/100`;
        const statusBadge = document.getElementById("passStatus");
        const quoteBox = document.getElementById("quoteDisplay");
        if (finalScore >= 50) { statusBadge.textContent = "PASS"; statusBadge.className = "score-status status-pass"; document.getElementById("scoreDisplay").style.color = "#155724"; }
        else { statusBadge.textContent = "NOT PASS"; statusBadge.className = "score-status status-fail"; document.getElementById("scoreDisplay").style.color = "#721c24"; }
        let quote = "";
        if (finalScore === 100) quote = "Xuất sắc! Bạn là thiên tài!";
        else if (finalScore >= 80) quote = "Tuyệt vời! Giữ vững phong độ nhé!";
        else if (finalScore >= 50) quote = "Khá tốt, nhưng vẫn cần cẩn thận hơn.";
        else quote = "Kết quả chưa tốt, hãy ôn lại kiến thức ngay!";
        quoteBox.textContent = `"${quote}"`;
    }
    // === CODE MỚI: LƯU VÀ KHÔI PHỤC TIẾN ĐỘ ===
    function saveProgress() {
        let currentView = 'home';
        if (!document.getElementById("view-empty-quiz").classList.contains("hidden")) currentView = 'empty';

        let answers = {};
        if (currentView === 'empty') {
            document.querySelectorAll('.opt input:checked').forEach(box => {
                let qId = box.parentElement.parentElement.id; // Lấy ID câu hỏi (vd: q1)
                if (!answers[qId]) answers[qId] = [];
                answers[qId].push(box.value);
            });
        }

        localStorage.setItem('gin_quiz_save', JSON.stringify({
            view: currentView,
            total: totalQuestions,
            ans: answers
        }));
    }

    function loadProgress() {
        const saved = localStorage.getItem('gin_quiz_save');
        if (!saved) return;

        try {
            const data = JSON.parse(saved);
            if (data.view === 'empty' && data.total > 0) {
                switchView('empty');
                totalQuestions = data.total;
                if (document.getElementById("num")) document.getElementById("num").value = totalQuestions;

                generate(totalQuestions); // Tạo lại giao diện câu hỏi

                // Khôi phục các đáp án đã chọn
                for (const [qId, values] of Object.entries(data.ans)) {
                    let idx = qId.replace('q', ''); // Lấy số thứ tự câu
                    values.forEach(val => {
                        let input = document.querySelector(`#${qId} input[value="${val}"]`);
                        if (input) {
                            input.checked = true;
                            // Cập nhật màu sắc giao diện
                            input.parentElement.classList.add("selected");
                            let navItem = document.getElementById(`nav-item-${idx}`);
                            if (navItem) navItem.classList.add("answered");
                        }
                    });
                }

                startScreen.style.display = "none";
                appLayout.style.display = "flex";
            }
        } catch (e) { console.log("Lỗi load save:", e); }
    }

    // Tự động chạy khi tải trang
    loadProgress();
});
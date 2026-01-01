document.addEventListener("DOMContentLoaded", () => {
    const startScreen = document.getElementById("start-screen");
    const inputPopup = document.getElementById("input-popup");
    const numInput = document.getElementById("numInput");
    const startBtn = document.getElementById("startBtn");
    const submitNumBtn = document.getElementById("submitNumBtn");
    const cancelNumBtn = document.getElementById("cancelNumBtn");
    const questionsBox = document.getElementById("questions");
    const exportBtn = document.getElementById("exportBtn");
    const manualCreateBtn = document.getElementById("manualCreateBtn");

    let backToStartBtn = document.getElementById("backBtn");
    if (!backToStartBtn) {
        backToStartBtn = document.createElement("button");
        backToStartBtn.id = "backBtn";
        backToStartBtn.textContent = "Quay lại màn bắt đầu";
        backToStartBtn.className = "back-btn-dyn";
        backToStartBtn.style.display = "none";
        const main = document.getElementById("main");
        if (main) main.prepend(backToStartBtn);
    }

    function safeHide(el) { if (el) el.style.display = "none"; }
    function safeShowInline(el) { if (el) el.style.display = "inline-block"; }

    safeHide(exportBtn);
    safeHide(manualCreateBtn);
    const nativeNum = document.getElementById("num");
    if (nativeNum) nativeNum.style.display = "none";
    safeHide(backToStartBtn);

    if (inputPopup) inputPopup.classList.add("hidden");

    if (startBtn) {
        startBtn.addEventListener("click", () => {
            if (inputPopup) {
                inputPopup.classList.remove("hidden");
                inputPopup.setAttribute("aria-hidden", "false");
            }
            setTimeout(() => {
                if (startScreen) startScreen.style.display = "none";
            }, 60);
            setTimeout(() => { if (numInput) numInput.focus(); }, 120);
        });
    }

    if (cancelNumBtn) {
        cancelNumBtn.addEventListener("click", () => {
            if (inputPopup) {
                inputPopup.classList.add("hidden");
                inputPopup.setAttribute("aria-hidden", "true");
            }
            if (startScreen) startScreen.style.display = "flex";
        });
    }

    if (submitNumBtn) {
        submitNumBtn.addEventListener("click", () => {
            const val = Number(numInput.value);
            if (!val || val < 1) {
                alert("Vui lòng nhập số hợp lệ (>=1)");
                if (numInput) numInput.focus();
                return;
            }
            if (nativeNum) nativeNum.value = val;

            // ẩn popup + start screen
            if (inputPopup) {
                inputPopup.classList.add("hidden");
                inputPopup.setAttribute("aria-hidden", "true");
            }
            if (startScreen) startScreen.style.display = "none";

            safeShowInline(exportBtn);
            safeShowInline(manualCreateBtn);
            if (nativeNum) nativeNum.style.display = "inline-block";
            if (backToStartBtn) backToStartBtn.style.display = "inline-block";

            generate();

            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    if (manualCreateBtn) {
        manualCreateBtn.addEventListener("click", () => generate());
    }

    if (backToStartBtn) {
        backToStartBtn.addEventListener("click", () => {
            if (questionsBox) questionsBox.innerHTML = "";
            if (exportBtn) exportBtn.style.display = "none";
            if (manualCreateBtn) manualCreateBtn.style.display = "none";
            if (nativeNum) nativeNum.style.display = "none";
            backToStartBtn.style.display = "none";

            if (numInput) numInput.value = "";
            if (startScreen) startScreen.style.display = "flex";
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener("click", exportAnswers);
    }
});

function generate() {
    let total = Number(document.getElementById("num").value);
    let box = document.getElementById("questions");
    if (!box) return;
    box.innerHTML = "";

    window.scrollTo({ top: 0, behavior: "smooth" });

    for (let i = 1; i <= total; i++) {
        let qDiv = document.createElement("div");
        qDiv.className = "question";

        qDiv.innerHTML = `<b>Câu ${i}:</b> <div class="opts" id="q${i}"></div>`;
        box.appendChild(qDiv);

        ["A", "B", "C", "D", "E", "F"].forEach(letter => {
            let opt = document.createElement("label");
            opt.className = "opt";
            opt.innerHTML = `<input type='checkbox' value='${letter}' onchange='toggleSelect(this)'> ${letter}`;
            document.getElementById("q" + i).appendChild(opt);
        });
    }
}

function toggleSelect(cb) {
    if (!cb || !cb.parentElement) return;
    cb.parentElement.classList.toggle("selected", cb.checked);
}

function exportAnswers() {
    let total = Number(document.getElementById("num").value);
    let text = "";

    for (let i = 1; i <= total; i++) {
        let arr = [...document.querySelectorAll(`#q${i} input:checked`)].map(x => x.value);
        text += `${i}. ${arr.join(',') || '-'}\n`;
    }

    showPopup(text);
}

function showPopup(content) {
    const bg = document.createElement("div");
    bg.className = "popup-bg";
    bg.addEventListener("click", () => bg.remove());

    const box = document.createElement("div");
    box.className = "popup-box";

    box.addEventListener("click", e => e.stopPropagation());

    box.innerHTML = content.split('\n')
        .map((line, i) => `
        <div class="answer-line" id="line-${i + 1}" style="padding:6px 0;border-bottom:1px solid #d0d7ff; display:flex; justify-content:space-between; align-items:center;">
            <span>${line}</span>
            <div>
                <button class="answer-btn" onclick="markAnswer('line-${i + 1}', true)">True</button>
                <button class="answer-btn" onclick="markAnswer('line-${i + 1}', false)">False</button>
            </div>
        </div>
    `).join('');

    bg.appendChild(box);
    document.body.appendChild(bg);
}
function markAnswer(lineId, isCorrect) {
    const line = document.getElementById(lineId);

    line.classList.remove("answer-correct", "answer-wrong");

    if (isCorrect) {
        line.classList.add("answer-correct");
    } else {
        line.classList.add("answer-wrong");
    }
}

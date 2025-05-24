import { authorizedFetch } from "../../utils/auth-fetch.js";

async function loadWrongNotes() {
    const listEl = document.getElementById("wrongNoteList");
    const emptyMsgEl = document.getElementById("emptyNoteMessage");

    // ✅ mock 데이터만 사용
    const notes = [
        {
            id: 1,
            question: "안녕하세용?",
            selectedOption: "네 안녕하세요",
            correctAnswer: "소득공제 혜택이 있다",
            explanation: "신용카드는 일정 금액 이상 사용 시 소득공제 혜택이 있습니다.",
            hint: "세금 혜택",
            category: "CARD"
        },
        {
            id: 2,
            question: "적금과 예금의 차이는?",
            selectedOption: "적금은 자유롭게 넣고 뺄 수 있다",
            correctAnswer: "적금은 분할납입, 예금은 일시납",
            explanation: "적금은 매월 나눠 넣고, 예금은 한 번에 넣습니다.",
            hint: "납입 방식 비교",
            category: "DEPOSIT"
        }
    ];

    // 🔒 백엔드 API 호출

    // const res = await authorizedFetch("http://43.202.211.168:8080/api/wrong-notes");
    // const json = await res.json();
    // const notes = json?.result || [];

    // 오답노트 없을 경우
    if (notes.length === 0) {
        emptyMsgEl.style.display = "block";
        listEl.innerHTML = "";
        return;
    }

    // 오답노트 있을 경우
    emptyMsgEl.style.display = "none";
    listEl.innerHTML = "";

    notes.forEach(note => {
        const li = document.createElement("li");
        li.className = "note-item";
        li.innerHTML = `
                <a href="../pages/wrong-note.html?id=${note.id}">
                    ❌ ${note.question}
                </a>
            `;
        listEl.appendChild(li);
    });

}

document.addEventListener("DOMContentLoaded", loadWrongNotes);

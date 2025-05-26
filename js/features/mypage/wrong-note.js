import { authorizedFetch } from "../../utils/auth-fetch.js";

console.log("📡 wrong-note.js 실행됨");

const params = new URLSearchParams(window.location.search);
const noteId = params.get("id");

console.log("🆔 파라미터에서 추출한 noteId:", noteId);

const questionEl = document.getElementById("question");
const userAnswerEl = document.getElementById("user-answer");
const correctAnswerEl = document.getElementById("correct-answer");
const explanationEl = document.getElementById("explanation");

async function loadWrongNoteDetail() {

    const res = await authorizedFetch(`http://43.202.211.168:8080/api/wrong-notes/${noteId}`);
    const json = await res.json();
    console.log("📥 서버 응답:", json);

    if (res.ok && json.code === 200 && json.data) {
        const note = json.data;
        console.log("✅ note 내용:", note);

        questionEl.textContent = `Q. ${note.question}`;
        userAnswerEl.textContent = note.selectedOption;
        correctAnswerEl.textContent = note.correctAnswer;
        explanationEl.textContent = note.explanation;
    } else {
        questionEl.textContent = `❗ 데이터를 불러오지 못했습니다`;
        console.warn("⚠️ 응답 이상:", json);
    }
}
document.addEventListener("DOMContentLoaded", loadWrongNoteDetail);
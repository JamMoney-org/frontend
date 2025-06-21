import { authorizedFetch } from "../../utils/auth-fetch.js";

async function loadWrongNotes() {
    const listEl = document.getElementById("wrongNoteList");
    const emptyMsgEl = document.getElementById("emptyNoteMessage");

    // 로그인 유저 확인
    const userRes = await authorizedFetch("http://43.202.211.168:8080/Sapi/user/me");
    const userJson = await userRes.json();
    console.log("🧑 로그인 유저:", userJson);

    // 오답노트 불러오기
    const res = await authorizedFetch("http://43.202.211.168:8080/api/wrong-notes");
    const json = await res.json();
    const notes = json?.data || [];
    console.log("📦 API 응답 전체:", json);

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
            <a href="../../../pages/wrong_note.html?id=${note.id}">
                ❌ ${note.question}
            </a>
    `;
        listEl.appendChild(li);
    });
}
document.addEventListener("DOMContentLoaded", loadWrongNotes);

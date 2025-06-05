import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
    const listContainer = document.querySelector(".term-list");

    try {
        const userRes = await authorizedFetch("http://43.202.211.168:8080/api/user/me");
        if (!userRes.ok) return;

        const res = await authorizedFetch("http://43.202.211.168:8080/api/terms/my-terms");
        if (!res.ok) return;

        const terms = await res.json();

        terms.forEach((term) => {
            const card = document.createElement("div");
            card.className = "term-card";

            const termSentence = term.exampleSentences.length > 0
                ? term.exampleSentences[0]
                : "예문이 없습니다.";

            card.innerHTML = `
              <h2>${term.term}</h2>
              <p class="definition">${term.definition}</p>
              <div class="term-box">
                <span class="term-label">예시</span>
                <p class="term-sentence">${termSentence}</p>
              </div>
            `;

            listContainer.appendChild(card);
        });
    } catch (error) {
        listContainer.innerHTML = "<p>단어를 불러오지 못했습니다.</p>";
    }
});

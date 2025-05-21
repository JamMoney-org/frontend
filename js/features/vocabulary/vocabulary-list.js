// js/features/vocabulary/vocabulary-list.js
import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const categoryTitleEl = document.getElementById("category-title");
  const wordListEl = document.getElementById("word-list");

  // 로컬스토리지에서 카테고리 불러오기
  const selectedCategory = localStorage.getItem("selectedCategory");

  if (!selectedCategory) {
    categoryTitleEl.textContent = "카테고리 없음";
    return;
  }

  // 카테고리 제목 표시
  categoryTitleEl.textContent = selectedCategory;

  try {
    const response = await authorizedFetch(
      `http://43.202.211.168:8080/api/terms/categories/${selectedCategory}/days`
    );
    if (!response.ok) throw new Error("Day 목록을 불러오지 못했습니다.");

    const dayIndexes = await response.json(); // [1, 2, 3, 4, 5] 형태 예상

    // 기존 word-list 초기화
    wordListEl.innerHTML = "";

    // 각각의 day로 word-item 생성
    dayIndexes.forEach((day) => {
      const item = document.createElement("div");
      item.className = "word-item";
      item.dataset.day = day;

      item.innerHTML = `
        <div class="word-info">
          <p class="day-label">DAY${day}</p>
        </div>
      `;

      wordListEl.appendChild(item);
    });
  } catch (err) {
    console.error("데이터 불러오기 실패:", err);
  }
});

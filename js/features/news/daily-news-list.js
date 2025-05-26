import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const newsListContainer = document.getElementById("news-list");

  try {
    const response = await authorizedFetch("http://43.202.211.168:8080/api/news");

    if (!response.ok) {
      throw new Error("뉴스 목록을 불러오는 데 실패했습니다.");
    }

    const newsList = await response.json();

    // 기존 더미 뉴스 제거
    newsListContainer.innerHTML = "";

    newsList.forEach(news => {
      const newsItem = document.createElement("div");
      newsItem.classList.add("news-item");

      newsItem.innerHTML = `
        <h3>${news.title}</h3>
        <p>${news.source} · ${formatDate(news.publishDate)}</p>
      `;

      newsItem.addEventListener("click", () => {
        window.location.href = `/pages/daily_news_detail.html?id=${news.id}`;
      });

      newsListContainer.appendChild(newsItem);
    });

  } catch (error) {
    console.error("뉴스 불러오기 오류:", error);
    newsListContainer.innerHTML = "<p>뉴스를 불러오는 데 실패했습니다.</p>";
  }
});

// 날짜 포맷 함수 (예: 2025.05.24)
function formatDate(localDateStr) {
  const date = new Date(localDateStr);
  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, "0")}.${date.getDate().toString().padStart(2, "0")}`;
}

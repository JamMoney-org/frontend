import { authorizedFetch } from "../../utils/auth-fetch.js";

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${d.getDate().toString().padStart(2, "0")}`;
}

document.addEventListener("DOMContentLoaded", async () => {
  const newsListContainer = document.getElementById("news-list");

  try {
    const response = await authorizedFetch("https://jm-money.com/api/news");

    if (!response.ok) {
      throw new Error("뉴스 목록을 불러오는 데 실패했습니다.");
    }

    const newsList = await response.json();

    newsList.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));

    newsListContainer.innerHTML = "";

    newsList.forEach((news) => {
      const newsItem = document.createElement("div");
      newsItem.classList.add("news-item");

      newsItem.innerHTML = `
        <h3>${news.title}</h3>
        <p>${news.source} · ${formatDate(news.publishDate)}</p>
      `;

      newsItem.addEventListener("click", () => {
        window.location.href = `/pages/news/daily_news_detail.html?id=${news.id}`;
      });

      newsListContainer.appendChild(newsItem);
    });
  } catch (error) {
    console.error("뉴스 불러오기 오류:", error);
    newsListContainer.innerHTML = "<p>뉴스를 불러오는 데 실패했습니다.</p>";
  }
});

import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const categoryItems = document.querySelectorAll(".category-item");

  try {
    const response = await authorizedFetch(
      "https://jm-money.com/api/terms/categories",
      {
        method: "GET",
      }
    );

    const categories = await response.json();

    categoryItems.forEach((item, index) => {
      const categoryText = item.querySelector("p");

      if (index < categories.length) {
        categoryText.textContent = categories[index].category;
        item.dataset.id = categories[index].id;
      } else {
        categoryText.textContent = "나만의 금융단어장";
        item.dataset.id = "custom";
      }
    });

    categoryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const categoryId = item.dataset.id;
        const categoryName = item.querySelector("p").textContent;

        console.log("클릭된 카테고리 ID:", categoryId);
        console.log("카테고리 이름:", categoryName);

        if (categoryId === "custom") {
          window.location.href = "/pages/vocabulary/my_vocabulary.html";
        } else {
          window.location.href = `/pages/vocabulary/vocabulary_list.html?categoryId=${categoryId}&categoryName=${encodeURIComponent(
            categoryName
          )}`;
        }
      });
    });
  } catch (err) {
    console.error("카테고리 로딩 실패:", err);
  }

  const progressResponse = await authorizedFetch(
    "https://jm-money.com/api/terms/progress"
  );
  const progressData = await progressResponse.json();
  const learnedCountEl = document.getElementById("learned-count");
  if (learnedCountEl) {
    learnedCountEl.innerHTML = `🦖 벌써 <span> ${progressData.totalLearnedCount} </span>개의 단어를 익혔어요!`;
  }
});

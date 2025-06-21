import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const categoryItems = document.querySelectorAll(".category-item");

  try {
    const response = await authorizedFetch("https://jm-money.com/api/terms/categories", {
      method: "GET"
    });

    const categories = await response.json(); // [{ id: 1, category: "소비" }, ...]

    categoryItems.forEach((item, index) => {
      const categoryText = item.querySelector("p");

      // 마지막 항목은 "나만의 금융단어장"으로 하드코딩
      if (index < categories.length) {
        categoryText.textContent = categories[index].category;
        item.dataset.id = categories[index].id;
      } else {
        categoryText.textContent = "나만의 금융단어장";
        item.dataset.id = "custom";
      }
    });

    categoryItems.forEach(item => {
      item.addEventListener("click", () => {
        const categoryId = item.dataset.id;
        const categoryName = item.querySelector("p").textContent;

        console.log("클릭된 카테고리 ID:", categoryId);
        console.log("카테고리 이름:", categoryName);

        if (categoryId === "custom") {
          // "나만의 단어장"은 고정 경로로 이동
          window.location.href = "/pages/my_vocabulary.html";
        } else {
          window.location.href = `/pages/vocabulary_list.html?categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`;
        }
      });
    });

  } catch (err) {
    console.error("카테고리 로딩 실패:", err);
  }
});

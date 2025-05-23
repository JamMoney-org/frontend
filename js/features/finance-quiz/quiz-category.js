import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const categoryItems = document.querySelectorAll(".category-item");

  try {
    const response = await authorizedFetch("http://43.202.211.168:8080/api/terms/categories", {
      method: "GET"
    });

    const categories = await response.json(); // [{ id: 1, category: "소비" }, ...]

    categoryItems.forEach((item, index) => {
      const categoryText = item.querySelector("p");

      if (categories[index]) {
        categoryText.textContent = categories[index].category;
        item.dataset.id = categories[index].id; // data-id에 id 저장
      } else {
        categoryText.textContent = "알 수 없음";
      }
    });

    categoryItems.forEach(item => {
      item.addEventListener("click", () => {
        const categoryId = item.dataset.id;
        const categoryName = item.querySelector("p").textContent;
        console.log("클릭된 카테고리 ID:", categoryId);
        console.log("카테고리 이름:", categoryName);

        window.location.href = `/pages/category_words.html?categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`;
      });
    });

  } catch (err) {
    console.error("카테고리 로딩 실패:", err);
  }
});

import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const categoryItems = document.querySelectorAll(".category-item");

  const categoryEnumMap = {
    소비: "CONSUMPTION",
    저축: "SAVING",
    대출: "LOAN",
    투자: "INVESTMENT",
    세금: "TAX",
  };

  try {
    const response = await authorizedFetch(
      "http://43.202.211.168:8080/api/terms/categories",
      {
        method: "GET",
      }
    );

    const categories = await response.json();

    categoryItems.forEach((item, index) => {
      const categoryText = item.querySelector("p");

      if (categories[index]) {
        categoryText.textContent = categories[index].category;
      } else {
        categoryText.textContent = "알 수 없음";
      }
    });

    categoryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const categoryName = item.querySelector("p").textContent;
        const categoryEnum = categoryEnumMap[categoryName];

        if (!categoryEnum) {
          alert("유효하지 않은 카테고리입니다.");
          return;
        }

        localStorage.setItem("selectedCategoryName", categoryName);
        localStorage.setItem("selectedCategoryEnum", categoryEnum);

        window.location.href = `/pages/quiz_level_select.html?categoryName=${encodeURIComponent(
          categoryName
        )}&categoryEnum=${categoryEnum}`;
      });
    });
  } catch (err) {
    console.error("카테고리 로딩 실패:", err);
  }
});

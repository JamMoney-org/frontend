import { authorizedFetch } from "../../utils/auth-fetch.js";

const categoryGridEl = document.querySelector(".category-grid");

function getCategoryImagePath(name) {
  return `/assets/images/${name}.png`;
}

function navigateToScenarioList(category) {
  location.href = `/pages/scenario/scenario_list.html?category=${encodeURIComponent(
    category
  )}`;
}

function createCategoryItem(label) {
  const item = document.createElement("div");
  item.className = "category-item";

  const img = document.createElement("img");
  img.className = "category-icon";
  img.src = getCategoryImagePath(label);
  img.alt = `${label} 아이콘`;

  const text = document.createElement("p");
  text.textContent = label;

  item.appendChild(img);
  item.appendChild(text);

  item.addEventListener("click", () => navigateToScenarioList(label));

  return item;
}

async function loadCategories() {
  try {
    const response = await authorizedFetch(
      "https://jm-money.com/api/scenario/category",
      {
        method: "GET",
      }
    );
    const categories = await response.json();

    categories.forEach((label) => {
      const el = createCategoryItem(label);
      categoryGridEl.appendChild(el);
    });
  } catch (error) {
    console.error("카테고리 로딩 실패:", error);
    categoryGridEl.innerHTML = "<p>카테고리를 불러오는 데 실패했습니다.</p>";
  }
}

loadCategories();

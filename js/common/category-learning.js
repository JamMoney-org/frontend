document.addEventListener("DOMContentLoaded", () => {
  const categoryItems = document.querySelectorAll(".category-item");
  const token = localStorage.getItem("authToken");

  // 한글 카테고리를 백엔드 enum과 매핑
  const categoryMap = {
    "소비": "CONSUMPTION",
    "저축": "SAVING",
    "대출": "LOAN",
    "투자": "INVESTMENT",
    "세금": "TAX"
  };

  categoryItems.forEach(item => {
    item.addEventListener("click", () => {
      const korCategory = item.querySelector("p").textContent.trim();
      const enumCategory = categoryMap[korCategory];

      if (!enumCategory) {
        alert("카테고리 매핑 오류");
        return;
      }

      // 카테고리를 로컬스토리지에 저장
      localStorage.setItem("selectedCategory", enumCategory);

      // 난이도 선택 화면으로 이동
      window.location.href = "/pages/quiz_level_select.html";
    });
  });
});

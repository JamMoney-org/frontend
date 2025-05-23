// /js/features/scenario/category.js

const categoryGridEl = document.querySelector('.category-grid');

// 카테고리명 → 이미지 경로 생성
function getCategoryImagePath(name) {
  return `../assets/images/${name}.png`;
}

// 클릭 시 카테고리별 시나리오 리스트 페이지로 이동
function navigateToScenarioList(category) {
  location.href = `/pages/scenario-list.html?category=${encodeURIComponent(
    category
  )}`;
}

// 카테고리 아이템 DOM 생성
function createCategoryItem(label) {
  const item = document.createElement('div');
  item.className = 'category-item';

  const img = document.createElement('img');
  img.className = 'category-icon';
  img.src = getCategoryImagePath(label);
  img.alt = `${label} 아이콘`;

  const text = document.createElement('p');
  text.textContent = label;

  item.appendChild(img);
  item.appendChild(text);

  item.addEventListener('click', () => navigateToScenarioList(label));

  return item;
}

// 카테고리 불러오기
async function loadCategories() {
  try {
    const response = await authorizedFetch(
      'http://43.202.211.168:8080/api/category',
      {
        method: 'GET',
      }
    );
    const categories = await response.json();

    categoryGridEl.innerHTML = ''; // 기존 항목 제거

    categories.forEach((label) => {
      const el = createCategoryItem(label);
      categoryGridEl.appendChild(el);
    });
  } catch (error) {
    console.error('카테고리 로딩 실패:', error);
    categoryGridEl.innerHTML = '<p>카테고리를 불러오는 데 실패했습니다.</p>';
  }
}

loadCategories();

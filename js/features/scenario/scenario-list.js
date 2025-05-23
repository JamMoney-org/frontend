import { authorizedFetch } from '../../utils/auth-fetch.js';

const scenarioListEl = document.querySelector('.scenario-list');
const categoryLabelEl = document.querySelector('.category-label');

function getDifficultyStars(difficulty) {
  const levelMap = {
    EASY: 1,
    NORMAL: 2,
    HARD: 3,
  };
  const stars = '⭐'.repeat(levelMap[difficulty] || 1);
  return stars;
}

function createScenarioItem(scenario) {
  const item = document.createElement('div');
  item.className = 'scenario-item';

  const header = document.createElement('div');
  header.className = 'scenario-header';

  const title = document.createElement('div');
  title.className = 'scenario-title';
  title.textContent = scenario.title;

  const star = document.createElement('div');
  star.className = 'star';
  star.textContent = getDifficultyStars(scenario.difficulty);

  header.appendChild(title);
  header.appendChild(star);

  const desc = document.createElement('div');
  desc.className = 'scenario-desc';
  desc.textContent = scenario.description;

  item.appendChild(header);
  item.appendChild(desc);

  // 나중에 클릭 이벤트 연결하고 싶으면 여기서 추가
  return item;
}

async function loadScenarioList(category) {
  try {
    const res = await authorizedFetch(
      `http://43.202.211.168:8080/api/category/list?category=${encodeURIComponent(
        category
      )}`
    );
    const data = await res.json();

    // 헤더 타이틀 갱신
    categoryLabelEl.textContent = `${category} - 상황선택`;

    // 기존 목록 제거
    scenarioListEl.innerHTML = '';

    if (data.length === 0) {
      scenarioListEl.innerHTML = '<p>등록된 시나리오가 없습니다.</p>';
      return;
    }

    data.forEach((scenario) => {
      const item = createScenarioItem(scenario);
      scenarioListEl.appendChild(item);
    });
  } catch (error) {
    console.error('시나리오 불러오기 실패:', error);
    scenarioListEl.innerHTML = '<p>시나리오를 불러오는 데 실패했습니다.</p>';
  }
}

// 진입점
(function () {
  const params = new URLSearchParams(location.search);
  const category = params.get('category');

  if (!category) {
    scenarioListEl.innerHTML = '<p>카테고리가 지정되지 않았습니다.</p>';
    return;
  }

  loadScenarioList(category);
})();

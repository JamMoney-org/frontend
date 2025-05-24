import { authorizedFetch } from '../../utils/auth-fetch.js';

const labelToEnumMap = {
  소비: 'CONSUMPTION',
  저축: 'SAVING',
  대출: 'LOAN',
  투자: 'INVESTMENT',
  세금: 'TAX',
};

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

  item.addEventListener('click', () => {
    sessionStorage.setItem('selectedScenario', JSON.stringify(scenario));
    location.href = `/pages/scenario_intro.html?scenarioId=${scenario.id}`;
  });

  return item;
}

async function loadScenarioList(category, enumCategory) {
  try {
    const res = await authorizedFetch(
      `http://43.202.211.168:8080/api/scenario/category/list?category=${enumCategory}`
    );
    let data = await res.json();
    data = [
      {
        id: 1,
        title: '첫 월급 관리하기',
        description: '첫 월급으로 무엇을 해야 할까요?',
        difficulty: 'EASY',
      },
      {
        id: 2,
        title: '신용카드와 체크카드의 차이',
        description: '카드 사용 전 반드시 알아야 할 팁',
        difficulty: 'NORMAL',
      },
      {
        id: 3,
        title: '세금 계산서 이해하기',
        description: '소득세, 부가세를 쉽게 이해해 봅시다.',
        difficulty: 'HARD',
      },
    ];

    // 헤더 타이틀 갱신
    categoryLabelEl.textContent = `${category} - 상황선택`;

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
  const enumCategory = labelToEnumMap[category];

  if (!enumCategory) {
    scenarioListEl.innerHTML = '<p>카테고리가 지정되지 않았습니다.</p>';
    return;
  }

  loadScenarioList(category, enumCategory);
})();

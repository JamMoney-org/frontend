import { authorizedFetch } from '../../utils/auth-fetch.js';

const labelToEnumMap = {
  소비: 'CONSUMPTION',
  저축: 'SAVING',
  대출: 'LOAN',
  투자: 'INVESTMENT',
  세금: 'TAX',
};
const levelMap = {
  EASY: 1,
  NORMAL: 2,
  HARD: 3,
};

const scenarioListEl = document.querySelector('.scenario-list');
const categoryLabelEl = document.querySelector('.category-label');

function getDifficultyStars(difficulty) {
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

  const diffNum = levelMap[scenario.difficulty];

  const isLocked =
    characterLevel < 4 ||
    (characterLevel <= 4 && diffNum > 1) ||
    (characterLevel <= 5 && diffNum > 2);

  if (isLocked) {
    item.classList.add('locked');
  } else {
    item.addEventListener('click', () => {
      const rewardMap = { EASY: 10, NORMAL: 20, HARD: 30 };
      sessionStorage.setItem('reward', rewardMap[scenario.difficulty]);
      location.href = `/pages/scenario/scenario_intro.html?scenarioId=${scenario.id}`;
    });
  }
  return item;
}

async function loadScenarioList(category, enumCategory) {
  try {
    const res = await authorizedFetch(
      `https://jm-money.com/api/scenario/category/list?category=${enumCategory}`
    );
    const data = await res.json();

    categoryLabelEl.textContent = `${category}`;

    if (data.length === 0) {
      scenarioListEl.innerHTML = '<p>등록된 시나리오가 없습니다.</p>';
      return;
    }

    data.sort((a, b) => levelMap[a.difficulty] - levelMap[b.difficulty]);

    data.forEach((scenario) => {
      const item = createScenarioItem(scenario);
      scenarioListEl.appendChild(item);
    });
  } catch (error) {
    console.error('시나리오 불러오기 실패:', error);
    scenarioListEl.innerHTML = '<p>시나리오를 불러오는 데 실패했습니다.</p>';
  }
}

const statusRes = await authorizedFetch('https://jm-money.com/api/pet/status');
const response = await statusRes.json();
const characterLevel = response.data.level;

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

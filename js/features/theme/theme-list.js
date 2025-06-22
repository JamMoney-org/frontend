import { authorizedFetch } from '../../utils/auth-fetch.js';

const tabsContainer = document.querySelector('.tabs');
const topicList = document.querySelector('.topic-list');

let themeList = {};

const savingsImageMap = {
  1: '../../../assets/images/savings_1.png',
  2: '../../../assets/images/savings_2.jpeg',
  3: '../../../assets/images/savings_3.png',
  4: '../../../assets/images/savings_4.jpeg',
  5: '../../../assets/images/savings_5.jpg',
  6: '../../../assets/images/savings_6.jpg',
  7: '../../../assets/images/savings_7.jpg',
  8: '../../../assets/images/savings_8.png',
  9: '../../../assets/images/savings_9.jpeg',
  10: '../../../assets/images/savings_10.png',
};

const investImageMap = {
  11: '../../../assets/images/invest_1.jpg',
  12: '../../../assets/images/invest_2.png',
  13: '../../../assets/images/invest_3.png',
  14: '../../../assets/images/invest_4.png',
  15: '../../../assets/images/invest_5.png',
  16: '../../../assets/images/invest_6.png',
  17: '../../../assets/images/invest_7.png',
  18: '../../../assets/images/invest_8.png',
  19: '../../../assets/images/invest_9.png',
  20: '../../../assets/images/invest_10.png',
};

try {
  const response = await authorizedFetch('https://jm-money.com/api/themes', {
    method: 'GET',
  });

  const themes = await response.json();

  themes.forEach((theme) => {
    themeList[theme.themeId] = theme.name;
  });
  renderTabs(themes);
  if (themes.length > 0) {
    fetchTopics(themes[0].themeId); // 첫 번째 테마의 토픽 불러오기
  }
} catch (err) {
  console.error('테마 목록 불러오기 실패:', err);
}

// 2. 탭 렌더링
function renderTabs(themes) {
  tabsContainer.innerHTML = ''; // 기존 탭 제거

  themes.forEach((theme, index) => {
    const tab = document.createElement('div');
    tab.className = 'tab';
    if (index === 0) tab.classList.add('active');
    tab.textContent = theme.name;

    tab.addEventListener('click', () => {
      document
        .querySelectorAll('.tab')
        .forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      fetchTopics(theme.themeId);
    });

    tabsContainer.appendChild(tab);
  });
}

// 3. 테마 ID에 해당하는 토픽 리스트 받아오기
async function fetchTopics(themeId) {
  try {
    const response = await authorizedFetch(
      `https://jm-money.com/api/themes/${themeId}/topics`,
      {
        method: 'GET',
      }
    );

    const topics = await response.json();

    renderTopicList(topics, themeId);
  } catch (err) {
    console.error('토픽 불러오기 실패:', err);
  }
}

// 4. 토픽 리스트 렌더링
function renderTopicList(topics, themeId) {
  topicList.innerHTML = '';

  renderCarousel(topics, themeId);

  topics.forEach((topic) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.addEventListener('click', () => {
      window.location.href = `/pages/theme_learning_detail.html?themeId=${themeId}&topicId=${topic.topicId}`;
    });

    let imageSrc = 'https://placehold.co/70x70'; // 기본 이미지

    if (themeId === 1) {
      imageSrc = savingsImageMap[topic.topicId] || imageSrc;
    } else if (themeId === 2) {
      imageSrc = investImageMap[topic.topicId] || imageSrc;
    }

    item.innerHTML = `
      <img src="${imageSrc}" alt="썸네일" />
      <div class="topic-content">
        <span class="tag">${topic.tag}</span>
        <h2>${topic.title}</h2>
      </div>
    `;

    topicList.appendChild(item);
  });
}

function renderCarousel(topics, themeId) {
  const carouselEl = document.querySelector('.carousel');
  carouselEl.innerHTML = ''; // 기존 캐러셀 비우기

  // topics 배열에서 랜덤하게 3개 뽑기
  const shuffled = [...topics].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3);

  selected.forEach((topic) => {
    let imageSrc = 'https://placehold.co/170x170';
    if (themeId === 1) {
      imageSrc = savingsImageMap[topic.topicId] || imageSrc;
    } else if (themeId === 2) {
      imageSrc = investImageMap[topic.topicId] || imageSrc;
    }

    const div = document.createElement('div');
    div.className = 'carousel-item';
    div.innerHTML = `
      <img src="${imageSrc}" alt="${topic.title}" />
    `;

    div.addEventListener('click', () => {
      window.location.href = `/pages/theme_learning_detail.html?themeId=${themeId}&topicId=${topic.topicId}`;
    });

    carouselEl.appendChild(div);
  });
}

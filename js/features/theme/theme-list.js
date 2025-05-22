import { authorizedFetch } from '../../utils/auth-fetch.js';

const tabsContainer = document.querySelector('.tabs');
const topicList = document.querySelector('.topic-list');

try {
  const response = await authorizedFetch(
    'http://43.202.211.168:8080/api/themes',
    {
      method: 'GET',
    }
  );

  const themes = await response.json();
  renderTabs(themes);
  if (themes.length > 0) {
    fetchTopics(themes[0].id); // 첫 번째 테마의 토픽 불러오기
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
      fetchTopics(theme.id);
    });

    tabsContainer.appendChild(tab);
  });
}

// 3. 테마 ID에 해당하는 토픽 리스트 받아오기
async function fetchTopics(themeId) {
  try {
    const response = await authorizedFetch(
      `http://43.202.211.168:8080/api/themes/${themeId}/topics`,
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

  topics.forEach((topic) => {
    const item = document.createElement('div');
    item.className = 'topic-item';
    item.addEventListener('click', () => {
      window.location.href = `/theme-detail.html?themeId=${themeId}&topicId=${topic.topicId}`;
    });

    item.innerHTML = `
      <img src="https://placehold.co/70x70" alt="썸네일" />
      <div class="topic-content">
        <span class="tag">${topic.tag}</span>
        <h2>${topic.title}</h2>
      </div>
    `;

    topicList.appendChild(item);
  });
}

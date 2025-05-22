const tabsContainer = document.querySelector('.tabs');
const topicList = document.querySelector('.topic-list');

let themeList = []; // [{ id: 1, name: '저축' }, ...]

// 1. 테마 목록 받아와서 탭에 주입
fetch('/api/themes')
  .then((res) => res.json())
  .then((themes) => {
    themeList = themes;
    renderTabs(themes);
    if (themes.length > 0) {
      fetchTopics(themes[0].id);
    }
  })
  .catch((err) => console.error('테마 목록 불러오기 실패:', err));

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
function fetchTopics(themeId) {
  fetch(`/api/themes/${themeId}/topics`)
    .then((res) => res.json())
    .then((topics) => {
      renderTopicList(topics, themeId);
    })
    .catch((err) => console.error('토픽 불러오기 실패:', err));
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

import { authorizedFetch } from '../../utils/auth-fetch.js';
import { themeList } from './theme-list.js';

// DOM 요소 가져오기
const headerEl = document.querySelector('.header-title');
const tagEl = document.querySelector('.tag');
const titleEl = document.querySelector('.learning-title');
const contentContainer = document.querySelector('.learning-wrapper');

// URL에서 themeId, topicId 추출
const params = new URLSearchParams(location.search);
const themeId = params.get('themeId');
const topicId = params.get('topicId');

// 잘못된 접근 처리
if (!themeId || !topicId) {
  contentContainer.innerHTML = '<p>잘못된 접근입니다. URL을 확인해주세요.</p>';
} else {
  try {
    const response = await authorizedFetch(
      `https://jm-money.com/api/themes/${themeId}/topics/${topicId}/details`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error('응답 실패');

    const data = await response.json();

    // ✅ 헤더에 제목 반영
    headerEl.textContent = themeList[themeId];

    // ✅ 태그와 학습 제목 반영
    tagEl.textContent = data.tag;
    titleEl.textContent = data.title;

    const htmlContent = convertPlainTextToHTML(data.description);
    contentContainer.appendChild(htmlContent);
  } catch (err) {
    console.error('상세 페이지 로딩 실패:', err);
    contentContainer.innerHTML = '<p>학습 내용을 불러오는 데 실패했습니다.</p>';
  }
}

function convertPlainTextToHTML(text) {
  const lines = text.split('\n').map((line) => line.trim());
  const fragment = document.createDocumentFragment();

  let currentSection = null;
  let ul = null;

  lines.forEach((line) => {
    if (!line) return;

    if (line.startsWith('????')) {
      // 새로운 섹션 시작
      currentSection = document.createElement('section');
      currentSection.className = 'section';

      const h2 = document.createElement('h2');
      h2.textContent = '📌 ' + line.slice(4).trim();
      currentSection.appendChild(h2);

      ul = document.createElement('ul');
      currentSection.appendChild(ul);
      fragment.appendChild(currentSection);
    } else if (line.startsWith('-')) {
      if (ul) {
        const li = document.createElement('li');
        li.textContent = line.replace(/^-+\s*/, '');
        ul.appendChild(li);
      }
    } else {
      // 도입부 문단
      const p = document.createElement('p');
      p.textContent = line;
      fragment.appendChild(p);
    }
  });

  return fragment;
}

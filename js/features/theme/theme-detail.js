import { authorizedFetch } from '../../utils/auth-fetch.js';

let themeList = {};

const headerEl = document.querySelector('.header-title');
const tagEl = document.querySelector('.tag');
const titleEl = document.querySelector('.learning-title');
const contentContainer = document.querySelector('.learning-wrapper');

try {
  const response = await authorizedFetch('https://jm-money.com/api/themes', {
    method: 'GET',
  });

  const themes = await response.json();

  themes.forEach((theme) => {
    themeList[theme.themeId] = theme.name;
  });
} catch (err) {
  console.error('테마 목록 불러오기 실패:', err);
}

const params = new URLSearchParams(location.search);
const themeId = params.get('themeId');
const topicId = params.get('topicId');

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

    headerEl.textContent = themeList[themeId];

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

  const mdToHTML = (s) => s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  const openSection = (title) => {
    ul = null;
    const section = document.createElement('section');
    section.className = 'section';

    const h2 = document.createElement('h2');
    h2.innerHTML = title;
    section.appendChild(h2);

    fragment.appendChild(section);
    currentSection = section;
  };

  const ensureUL = () => {
    if (!ul) {
      if (!currentSection) {
        currentSection = document.createElement('section');
        currentSection.className = 'section';
        fragment.appendChild(currentSection);
      }
      ul = document.createElement('ul');
      currentSection.appendChild(ul);
    }
  };

  lines.forEach((line) => {
    if (!line) {
      ul = null;
      return;
    }

    if (/^\p{Extended_Pictographic}/u.test(line)) {
      openSection(line);
      return;
    }

    if (line.startsWith('????')) {
      openSection('📌 ' + line.slice(4).trim());
      return;
    }

    if (/^-\s+/.test(line)) {
      ensureUL();
      const li = document.createElement('li');
      li.innerHTML = mdToHTML(line.replace(/^-+\s*/, ''));
      ul.appendChild(li);
      return;
    }

    ul = null;
    const p = document.createElement('p');
    p.innerHTML = mdToHTML(line);
    (currentSection ?? fragment).appendChild(p);
  });

  return fragment;
}

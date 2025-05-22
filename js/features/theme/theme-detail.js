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
console.log(themeId);
console.log(topicId);

console.log(themeList);

// 잘못된 접근 처리
if (!themeId || !topicId) {
  contentContainer.innerHTML = '<p>잘못된 접근입니다. URL을 확인해주세요.</p>';
} else {
  try {
    const response = await authorizedFetch(
      `http://43.202.211.168:8080/api/themes/${themeId}/topics/${topicId}/details`,
      { method: 'GET' }
    );

    if (!response.ok) throw new Error('응답 실패');

    const data = await response.json();

    // ✅ 헤더에 제목 반영
    headerEl.textContent = '저축'; // TODO: 필요 시 data.title로 대체 가능

    // ✅ 태그와 학습 제목 반영
    tagEl.textContent = data.tag;
    titleEl.textContent = data.title;

    // ✅ description 파싱
    contentContainer.innerHTML = data.description;
  } catch (err) {
    console.error('상세 페이지 로딩 실패:', err);
    contentContainer.innerHTML = '<p>학습 내용을 불러오는 데 실패했습니다.</p>';
  }
}

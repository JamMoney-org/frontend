// DOM 요소 가져오기
const headerEl = document.querySelector('.header-title');
const tagEl = document.querySelector('.tag');
const titleEl = document.querySelector('.leaning-title');
const contentContainer = document.querySelector('.leaning-wrapper');

// URL에서 themeId, topicId 추출
const params = new URLSearchParams(location.search);
const themeId = params.get('themeId');
const topicId = params.get('topicId');

// 잘못된 접근 처리
if (!themeId || !topicId) {
  contentContainer.innerHTML = '<p>잘못된 접근입니다. URL을 확인해주세요.</p>';
} else {
  fetch(`/api/themes/${themeId}/topics/${topicId}/details`)
    .then((res) => res.json())
    .then((data) => {
      // ✅ 헤더에 제목 반영
      headerEl.textContent = '저축';

      // ✅ 태그와 학습 제목 반영
      tagEl.textContent = data.tag;
      titleEl.textContent = data.title;

      // ✅ description 파싱
      contentContainer.innerHTML = data.description;
    })
    .catch((err) => {
      console.error('상세 페이지 로딩 실패:', err);
      contentContainer.innerHTML =
        '<p>학습 내용을 불러오는 데 실패했습니다.</p>';
    });
}

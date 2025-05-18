// vocabulary-list.js - 단어장 목록 페이지 스크립트

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    console.log("단어장 목록 페이지 로드");

    // 페이지 제목 업데이트
    updateCategoryTitle();

    // 단어 목록 클릭 이벤트 등록
    const wordList = document.getElementById('word-list');
    wordList.addEventListener('click', (e) => {
        const wordItem = e.target.closest('.word-item');
        if (wordItem) {
            const day = wordItem.dataset.day;
            alert(`선택한 DAY: ${day}`);
        }
    });
});

// URL 파라미터에서 카테고리 이름 가져오기
function getCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || '단어장';
}

// 페이지 제목 업데이트 함수
function updateCategoryTitle() {
    const category = getCategoryFromUrl();
    const titleElement = document.getElementById('category-title');
    if (titleElement) {
        titleElement.textContent = category;
    }
}

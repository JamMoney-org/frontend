// category-handler.js - 공통 카테고리 처리 모듈

export function handleCategoryClick(categoryName, target) {
    let targetPage = '';

    const categoryMap = {
        '소비': '소비',
        '저축': '저축',
        '대출': '대출',
        '투자': '투자',
        '보험': '보험',
        '세금': '세금',
        '금융기관&제도': '금융기관',
        '나만의 금융단어장': '나만의단어장'
    };

    if (categoryName in categoryMap) {
        targetPage = `${target}?category=${categoryMap[categoryName]}`;
    } else {
        alert("알 수 없는 카테고리입니다.");
        return;
    }

    // 페이지 이동
    window.location.href = targetPage;
}

export function initializeCategoryEvent(targetPage) {
    const categoryItems = document.querySelectorAll('.category-item');

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const categoryName = item.querySelector('p').textContent;
            handleCategoryClick(categoryName, targetPage);
        });
    });
}

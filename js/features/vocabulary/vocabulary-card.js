// vocabulary-card.js - 단어 카드 페이지 스크립트

const progressBar = document.getElementById('progress-bar');
const bookmarkButton = document.querySelector('.bookmark');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const wordTitle = document.querySelector('.word-title');
const wordDesc = document.querySelector('.word-desc');
const exampleText = document.querySelector('.example-text');
const quizModal = document.getElementById('quiz-modal');
const quizConfirm = document.getElementById('quiz-confirm');
const quizCancel = document.getElementById('quiz-cancel');

const bookmarkIcon = {
    active: "../assets/icon/bookmark-fill.svg",
    inactive: "../assets/icon/bookmark.svg"
};

const terms = [
    { term: "이자란?", definition: "돈을 빌리거나 예금을 했을 때 붙는 추가 금액", example: "정기예금의 이자율이 연 3%라면, 100만원을 예금했을 때 1년 후 3만원을 받을 수 있어요.", bookmarked: false },
    { term: "투자란?", definition: "자산을 이용하여 수익을 얻는 행위", example: "주식이나 부동산에 투자하여 장기적으로 자산을 증대할 수 있어요.", bookmarked: false },
    { term: "저축이란?", definition: "미래를 위해 돈을 모아 두는 행위", example: "월급의 일부를 저축하여 비상 자금을 마련해요.", bookmarked: false },
    { term: "대출이란?", definition: "필요한 자금을 일정 조건으로 빌리는 행위", example: "은행에서 대출을 받아 집을 구입할 수 있습니다.", bookmarked: false },
    { term: "보험이란?", definition: "위험에 대비하여 일정 금액을 정기적으로 납부하는 금융상품", example: "자동차 보험을 가입하여 사고에 대비합니다.", bookmarked: false }
];

let currentIndex = 0;

function displayTerm(index) {
    const term = terms[index];
    wordTitle.textContent = term.term;
    wordDesc.textContent = term.definition;
    exampleText.textContent = term.example;
    updateBookmarkIcon(term.bookmarked);
    updateProgressBar(index);
    updateNavigationButtons();
}

function toggleBookmark() {
    terms[currentIndex].bookmarked = !terms[currentIndex].bookmarked;
    updateBookmarkIcon(terms[currentIndex].bookmarked);
}

function updateBookmarkIcon(isBookmarked) {
    const iconPath = isBookmarked ? bookmarkIcon.active : bookmarkIcon.inactive;
    bookmarkButton.style.backgroundImage = `url('${iconPath}')`;
}

function nextTerm() {
    if (currentIndex === terms.length - 1) {
        showQuizModal();
        return;
    }
    currentIndex++;
    displayTerm(currentIndex);
}

function prevTerm() {
    if (currentIndex > 0) {
        currentIndex--;
        displayTerm(currentIndex);
    }
}

function updateProgressBar(index) {
    const progress = ((index + 1) / terms.length) * 100;
    progressBar.style.width = `${progress}%`;
}

function updateNavigationButtons() {
    prevButton.disabled = (currentIndex === 0);
}

function showQuizModal() {
    quizModal.style.display = 'flex';
}

function hideQuizModal() {
    quizModal.style.display = 'none';
}

function goToQuiz() {
    window.location.href = "../pages/vocabulary_quiz.html";
}

bookmarkButton.addEventListener('click', toggleBookmark);
nextButton.addEventListener('click', nextTerm);
prevButton.addEventListener('click', prevTerm);
quizConfirm.addEventListener('click', goToQuiz);
quizCancel.addEventListener('click', hideQuizModal);

document.addEventListener('DOMContentLoaded', () => {
    displayTerm(currentIndex);
});

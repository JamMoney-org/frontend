// 변수 선언
const quizOptions = document.getElementById('quiz-options');
const nextButton = document.getElementById('next-button');
const progressBar = document.getElementById('progress-bar');
let currentQuestion = 0;
let selectedAnswer = null;

// 퀴즈 데이터를 서버에서 가져오는 함수
async function fetchQuizData() {
    try {
        const response = await fetch('/api/quiz');
        const data = await response.json();
        return data.map(quiz => ({
            question: quiz.definition,
            options: quiz.choices,
            answer: quiz.choices.indexOf(quiz.correctAnswer)
        }));
    } catch (error) {
        console.error('퀴즈 데이터를 가져오는 데 실패했습니다.', error);
        return [];
    }
}

let quizData = [];

// 퀴즈 질문을 화면에 표시하는 함수
function renderQuestion(index) {
    const quizTitle = document.getElementById('quiz-title');
    quizTitle.textContent = `${index + 1}. ${quizData[index].question}`;
    quizOptions.innerHTML = '';

    quizData[index].options.forEach((option, idx) => {
        const button = document.createElement('button');
        button.classList.add('quiz-option');
        const numberSymbol = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
        button.textContent = `${numberSymbol[idx]} ${option}`;
        button.dataset.id = idx;
        button.addEventListener('click', handleOptionClick);
        quizOptions.appendChild(button);
    });
}

// 보기 클릭 시 처리 함수
function handleOptionClick(e) {
    // 이전 선택 초기화
    const options = document.querySelectorAll('.quiz-option');
    options.forEach(option => option.classList.remove('correct', 'incorrect', 'selected'));

    // 현재 선택 처리
    const button = e.target;
    selectedAnswer = parseInt(button.dataset.id);
    const isCorrect = selectedAnswer === quizData[currentQuestion].answer;

    button.classList.add(isCorrect ? 'correct' : 'incorrect', 'selected');
}

// 다음 문제로 이동하는 함수
nextButton.addEventListener('click', () => {
    if (currentQuestion < quizData.length - 1) {
        currentQuestion++;
        renderQuestion(currentQuestion);
        updateProgress();
    } else {
        alert('퀴즈 완료!');
        resetQuiz();
    }
});

// 퀴즈 초기화 함수
function resetQuiz() {
    currentQuestion = 0;
    renderQuestion(currentQuestion);
    updateProgress();
}

// 진행 상태 업데이트 함수
function updateProgress() {
    const progress = ((currentQuestion + 1) / quizData.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// 첫 번째 질문 초기화
fetchQuizData().then(data => {
    quizData = data;
    renderQuestion(currentQuestion);
    updateProgress();
});

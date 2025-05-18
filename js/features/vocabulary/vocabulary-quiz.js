// DOM이 완전히 로드된 후 실행
window.onload = () => {
    // 변수 선언
    const quizOptions = document.getElementById('quiz-options');
    const nextButton = document.getElementById('quiz-next-button');
    const progressBar = document.getElementById('progress-bar');
    const quizBox = document.querySelector('.quiz-box'); // quiz-box 요소
    let currentQuestion = 0;
    let selectedAnswer = null;
    let isCorrect = null;
    let isAnswered = false; // 정답 확인 여부

    // 임시 데이터: 로컬에서 테스트할 퀴즈 데이터
    const sampleData = [
        {
            question: "JavaScript에서 변수 선언 키워드가 아닌 것은?",
            options: ["var", "let", "const", "int"],
            answer: 3
        },
        {
            question: "HTML의 구조를 정의하는 태그는?",
            options: ["<div>", "<header>", "<body>", "<html>"],
            answer: 3
        },
        {
            question: "CSS에서 색상을 표현하는 방법이 아닌 것은?",
            options: ["Hex 코드", "RGB", "CMYK", "HSL"],
            answer: 2
        },
        {
            question: "Python에서 리스트를 선언하는 방법으로 올바른 것은?",
            options: ["{}", "[]", "()", "<>"],
            answer: 1
        }
    ];

    async function fetchQuizData() {
        try {
            console.log("로컬 데이터를 사용하여 퀴즈를 불러옵니다.");
            return sampleData;
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
        selectedAnswer = null;
        isCorrect = null;
        isAnswered = false;
        nextButton.textContent = "정답 확인";
        clearMessage();

        quizData[index].options.forEach((option, idx) => {
            const button = document.createElement('button');
            button.classList.add('quiz-option');
            const numberSymbol = ['①', '②', '③', '④'];
            button.textContent = `${numberSymbol[idx]} ${option}`;
            button.dataset.id = idx;
            button.addEventListener('click', handleOptionClick);
            quizOptions.appendChild(button);
        });
    }

    // 보기 클릭 시 처리 함수
    function handleOptionClick(e) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => option.classList.remove('selected', 'correct', 'incorrect'));

        const button = e.target;
        selectedAnswer = parseInt(button.dataset.id);
        isCorrect = selectedAnswer === quizData[currentQuestion].answer;

        button.classList.add('selected');
    }

    // 다음 버튼 클릭 이벤트
    nextButton.addEventListener('click', () => {
        if (!isAnswered) {
            if (selectedAnswer === null) {
                alert("정답을 선택해주세요!");
                return;
            }
            showCorrectAnswer();
            nextButton.textContent = "다음";
            isAnswered = true;
        } else {
            if (currentQuestion < quizData.length - 1) {
                currentQuestion++;
                renderQuestion(currentQuestion);
                updateProgress();
            } else {
                alert('퀴즈 완료!');
                resetQuiz();
            }
        }
    });

    // 정답 표시 함수
    function showCorrectAnswer() {
        const options = document.querySelectorAll('.quiz-option');

        options.forEach((option, idx) => {
            // 정답일 경우
            if (idx === quizData[currentQuestion].answer) {
                option.classList.add('correct');
                if (!isCorrect && idx !== selectedAnswer) {
                    option.classList.add('highlight-correct'); // 정답 강조 (오답일 때만)
                }
            } else {
                // 선택이 잘못된 경우
                if (idx === selectedAnswer) {
                    option.classList.add('incorrect');
                }
            }
        });

        // 정답 여부 메시지 표시
        displayMessage(isCorrect ? "정답입니다!" : "오답입니다!", isCorrect);
    }

    // 정답 여부 메시지 표시 함수
    function displayMessage(message, isCorrect) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('quiz-message');
        messageDiv.textContent = message;

        if (isCorrect) {
            messageDiv.classList.add('correct');
        } else {
            messageDiv.classList.add('incorrect');
        }

        quizBox.appendChild(messageDiv);
    }

    // 메시지 제거 함수
    function clearMessage() {
        const messageDiv = document.querySelector('.quiz-message');
        if (messageDiv) {
            messageDiv.remove();
        }
    }

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
};

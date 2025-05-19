// DOM이 완전히 로드된 후 실행
window.onload = () => {
    const quizOptions = document.getElementById('quiz-options');
    const nextButton = document.getElementById('quiz-next-button');
    const progressBar = document.getElementById('progress-bar');
    let currentQuestion = 0;
    let selectedAnswer = null;
    let isAnswered = false;

    nextButton.disabled = true;
    nextButton.style.backgroundColor = "gray";

    const quizData = [
        { question: "JavaScript에서 변수 선언 키워드가 아닌 것은?", options: ["var", "let", "const", "int"], answer: 3 },
        { question: "HTML의 구조를 정의하는 태그는?", options: ["<div>", "<header>", "<body>", "<html>"], answer: 3 },
        { question: "CSS에서 색상을 표현하는 방법이 아닌 것은?", options: ["Hex 코드", "RGB", "CMYK", "HSL"], answer: 2 },
        { question: "Python에서 리스트를 선언하는 방법으로 올바른 것은?", options: ["{}", "[]", "()", "<>"], answer: 1 }
    ];

    function renderQuestion(index) {
        const quizTitle = document.getElementById('quiz-title');
        quizTitle.textContent = `${index + 1}. ${quizData[index].question}`;
        quizOptions.innerHTML = '';
        selectedAnswer = null;
        isAnswered = false;
        nextButton.textContent = "정답 확인";
        nextButton.disabled = true;
        nextButton.style.backgroundColor = "gray";

        quizData[index].options.forEach((option, idx) => {
            const button = document.createElement('button');
            button.classList.add('quiz-option');
            button.textContent = `${idx + 1}. ${option}`;
            button.dataset.id = idx;
            button.addEventListener('click', handleOptionClick);
            quizOptions.appendChild(button);
        });

        updateProgress();
    }

    function handleOptionClick(e) {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => option.classList.remove('selected'));

        const button = e.target;
        selectedAnswer = parseInt(button.dataset.id);
        button.classList.add('selected');

        nextButton.disabled = false;
        nextButton.style.backgroundColor = "#5DC29E";
    }

    function showModal(message) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <p>${message}</p>
                <button class="modal-button">확인</button>
            </div>
        `;
        document.body.appendChild(modal);

        // 모달 버튼 클릭 시 모달 닫기
        const modalButton = modal.querySelector('.modal-button');
        modalButton.addEventListener('click', closeModal);
    }

    function closeModal() {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.remove();
        }
    }

    function updateProgress() {
        const progress = ((currentQuestion + 1) / quizData.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function showAnswerFeedback() {
        const options = document.querySelectorAll('.quiz-option');
        options.forEach((option, idx) => {
            if (idx === quizData[currentQuestion].answer) {
                option.classList.add('correct'); // 정답은 초록색
            } else if (idx === selectedAnswer) {
                option.classList.add('incorrect'); // 오답은 빨간색
            }
    });
}

    function showModal(message) {
        // 모달 배경 추가
        const backdrop = document.createElement('div');
        backdrop.classList.add('modal-backdrop');

        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <p>${message}</p>
                <button class="modal-button">확인</button>
            </div>
        `;

        // 모달 배경과 모달을 body에 추가
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);

        // 모달 버튼 클릭 시 모달 닫기
        const modalButton = modal.querySelector('.modal-button');
        modalButton.addEventListener('click', closeModal);
    }

    function closeModal() {
        const modal = document.querySelector('.modal');
        const backdrop = document.querySelector('.modal-backdrop');
        if (modal) modal.remove();
        if (backdrop) backdrop.remove();
    }


    nextButton.addEventListener('click', () => {
        if (!isAnswered) {
            if (selectedAnswer === null) return;

            const correctAnswer = quizData[currentQuestion].options[quizData[currentQuestion].answer];
            const message = selectedAnswer === quizData[currentQuestion].answer
                ? "참 잘했어요! 정답이에요!"
                : `오답입니다! 정답은 "${correctAnswer}" 입니다.`;
            
            showAnswerFeedback();
            showModal(message);

            nextButton.textContent = "다음";
            isAnswered = true;
        } else {
            currentQuestion++;
            if (currentQuestion < quizData.length) {
                renderQuestion(currentQuestion);
            } else {
                showModal("퀴즈 완료!");
                currentQuestion = 0;
                renderQuestion(currentQuestion);
            }
        }
    });

    renderQuestion(currentQuestion);
};

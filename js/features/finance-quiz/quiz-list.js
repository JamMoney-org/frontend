document.addEventListener("DOMContentLoaded", () => {
    // 퀴즈 데이터를 동적으로 불러오기
    const quizData = [
        { level: 1, title: "예금이란?", description: "돈을 빌리거나 예금을 했을 때 붙는 추가 금액", difficulty: "초급", locked: false },
        { level: 2, title: "이자 계산", description: "돈을 빌리거나 예금을 했을 때 붙는 추가 금액", difficulty: "초급", locked: false },
        { level: 3, title: "복리 이해", description: "돈을 빌리거나 예금을 했을 때 붙는 추가 금액", difficulty: "중급", locked: true },
        { level: 4, title: "예금자 보호", description: "돈을 빌리거나 예금을 했을 때 붙는 추가 금액", difficulty: "중급", locked: true }
    ];

    // DOM 요소 가져오기
    const quizList = document.getElementById("quiz-list");

    // 퀴즈 리스트 렌더링 함수
    function renderQuizList() {
        quizList.innerHTML = ""; // 기존 리스트 초기화

        quizData.forEach(quiz => {
            // 퀴즈 아이템 생성
            const quizItem = document.createElement("div");
            quizItem.classList.add("quiz-item");
            
            // 잠김 여부 처리
            if (quiz.locked) {
                quizItem.classList.add("quiz-item-lock");
            }

            // 퀴즈 정보 구성
            quizItem.innerHTML = `
                <div class="quiz-info">
                    <p class="day-label">LV.${quiz.level} ${quiz.title}</p>
                    <p class="daily-topic">${quiz.description}</p>
                </div>
                <span class="quiz-level">${quiz.difficulty}</span>
                ${quiz.locked ? '<div class="quiz-lock-overlay">🔒 잠김</div>' : ''}
            `;

            // 클릭 이벤트 처리
            quizItem.addEventListener("click", () => {
                if (!quiz.locked) {
                    alert(`퀴즈 시작: ${quiz.title}`);
                    window.location.href = `quiz_detail.html?level=${quiz.level}`;
                } else {
                    alert("이 퀴즈는 잠금 상태입니다.");
                }
            });

            // 리스트에 추가
            quizList.appendChild(quizItem);
        });
    }

    // 퀴즈 리스트 초기 렌더링
    renderQuizList();
});

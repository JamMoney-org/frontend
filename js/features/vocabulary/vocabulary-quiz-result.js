document.addEventListener("DOMContentLoaded", () => {
    const correctCount = 3;  // 맞춘 문제 수 (예제)
    const totalCount = 5;    // 총 문제 수 (예제)

    // DOM 요소 가져오기
    const feedback = document.getElementById("feedback");
    const chartScore = document.getElementById("chart-score");

    // 피드백 메시지 설정
    if (feedback) {
        if (correctCount >= 3) {  // 3개 이상 맞았을 때
            feedback.textContent = "잘했어요! 대단해요!";
            feedback.style.backgroundColor = "#5DC29E";
        } else {  // 2개 이하 맞았을 때
            feedback.textContent = "더 공부가 필요해요!";
            feedback.style.backgroundColor = "#5DC29E";
        }
    }

    // 점수 표시
    if (chartScore) {
        chartScore.textContent = `${correctCount}/${totalCount}`;
    }

    // 차트 생성
    const ctx = document.getElementById('quizChart').getContext('2d');
    if (ctx) {
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['정답', '오답'],
                datasets: [{
                    data: [correctCount, totalCount - correctCount],
                    backgroundColor: ['#5DC29E', '#E0E0E0'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // 퀴즈 종료 버튼
    const finishButton = document.getElementById("finish-button");
    finishButton.addEventListener("click", () => {
        alert("퀴즈를 종료합니다.");
        window.location.href = "index.html";  // 메인 페이지로 이동
    });
});

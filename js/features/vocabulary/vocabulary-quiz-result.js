import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", () => {
    const result = JSON.parse(localStorage.getItem("quizResultSummary"));

    // 데이터 유효성 검사
    if (!result || typeof result.correctCount !== "number" || typeof result.totalQuestions !== "number") {
        alert("결과 데이터를 불러오는 데 실패했습니다.");
        window.location.href = "mainpage.html";  // 오류 시 메인으로 이동
        return;
    }

    const correctCount = result.correctCount;
    const totalCount = result.totalQuestions;

    // DOM 요소 가져오기
    const feedback = document.getElementById("feedback");
    const chartScore = document.getElementById("chart-score");

    // 피드백 메시지 설정
    if (feedback) {
        if (correctCount >= 3) {
            feedback.textContent = "잘했어요! 대단해요!";
        } else {
            feedback.textContent = "더 공부가 필요해요!";
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
    if (finishButton) {
        finishButton.addEventListener("click", () => {
            window.location.href = "vocabulary_category.html";
        });
    }
});

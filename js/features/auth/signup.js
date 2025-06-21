document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.querySelector(".signup-form");

    function showPopup(message, type = "error", duration = 3000) {
        let popup = document.querySelector(".popup-message");
        if (!popup) {
            popup = document.createElement("div");
            popup.className = "popup-message";
            document.body.appendChild(popup);
        }
        popup.textContent = message;
        popup.className = `popup-message show ${type}`;

        setTimeout(() => {
            popup.classList.remove("show");
        }, duration);
    }

    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault(); //페이지 새로고침 방지

        // 입력값 가져오기
        const email = document.getElementById("email").value.trim();
        const nickname = document.getElementById("nickname").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // 입력값 유효성 검사
        if (!email || !nickname || !password || !confirmPassword) {
            showPopup("모든 필드를 입력해주세요.");
            return;
        }

        // 비밀번호 일치 확인
        if (password !== confirmPassword) {
            showPopup("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            // 회원가입 요청 전송
            const response = await fetch("https://jm-money.com/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    nickname,
                    password
                })
            });

            // 응답 처리
            if (!response.ok) {
                const errorData = await response.json();
                const errorText = errorData.message;
                showPopup(`회원가입 실패: ${errorText}`);
                return;
            }
        } catch (error) {
            console.error("회원가입 중 오류 발생:", error);
            showPopup("서버 연결에 실패했습니다.");
        }
    });
});

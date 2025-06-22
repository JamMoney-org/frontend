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

        try {
            // 회원가입 요청 전송
            const response = await fetch("http://43.202.211.168:8080/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    nickname,
                    password,
                    confirmPassword
                })
            });

            // 응답 처리
            if (response.ok) {
                const result = await response.text();
                showPopup(result);
                window.location.href = "../pages/login.html";
            } else {
                const errorText = await response.text();
                showPopup(`회원가입 실패: ${errorText}`);
            }

            showPopup("회원가입 성공!", "success");
            setTimeout(() => {
                window.location.href = "../../../pages/index.html";
            }, 1500);

        } catch (error) {
            console.error("회원가입 중 오류 발생:", error);
            showPopup("서버 연결에 실패했습니다.");
        }
    });
});

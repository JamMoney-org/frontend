document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-form");

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

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            showPopup("이메일과 비밀번호를 모두 입력해주세요.", "error");
            return;
        }

        try {
            const response = await fetch("http://43.202.211.168:8080/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();

                localStorage.setItem("accessToken", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);

                showPopup("로그인 성공!", "success", 1500);
                setTimeout(() => {
                    window.location.href = "../../../pages/mainpage.html";
                }, 1500);
            } else {
                const errorText = await response.text();
                showPopup(`로그인 실패: ${errorText}`, "error");
            }
        } catch (error) {
            console.error("로그인 중 오류 발생:", error);
            showPopup("서버 연결에 실패했습니다.", "error");
        }
    });
});

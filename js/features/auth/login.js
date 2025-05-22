document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.querySelector(".login-form");

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("이메일과 비밀번호를 모두 입력해주세요.");
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

                alert("로그인 성공!");
                window.location.href = "../pages/main.html";
            } else {
                const errorText = await response.text();
                alert(`로그인 실패: ${errorText}`);
            }
        } catch (error) {
            console.error("로그인 중 오류 발생:", error);
            alert("서버 연결에 실패했습니다.");
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".login-form");
  const errorElement = document.getElementById("login-error-message");

  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    errorElement.textContent = "";
    errorElement.style.display = "none";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      errorElement.textContent = "이메일과 비밀번호를 모두 입력해주세요.";
      errorElement.style.display = "block";
      return;
    }

    try {
      const response = await fetch("https://jm-money.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("accessToken", data.accessToken);

        setTimeout(() => {
          window.location.href = "/pages/mainpage/mainpage.html";
        }, 1500);
      } else {
        errorElement.textContent = `이메일 또는 비밀번호를 다시 확인하세요.`;
        errorElement.style.display = "block";
      }
    } catch (error) {
      errorElement.textContent = "서버 연결에 실패했습니다.";
      errorElement.style.display = "block";
    }
  });
});

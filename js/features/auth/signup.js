document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.querySelector(".signup-form");
  const errorElement = document.getElementById("signup-error-message");

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
  errorElement.textContent = "";
  errorElement.style.display = "none";

  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    errorElement.textContent = "";
    errorElement.style.display = "none";
    const email = document.getElementById("email").value.trim();
    const nickname = document.getElementById("nickname").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!email || !nickname || !password || !confirmPassword) {
      errorElement.textContent = "모든 항목을 입력해주세요.";
      errorElement.style.display = "block";
      return;
    }

    if (password !== confirmPassword) {
      errorElement.textContent = "비밀번호가 일치하지 않습니다.";
      errorElement.style.display = "block";
      return;
    }

    try {
      const response = await fetch("https://jm-money.com/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          nickname,
          password,
          confirmPassword,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        errorElement.textContent = errorData.message || "오류가 발생했습니다.";
        errorElement.style.display = "block";
        return;
      }

      showPopup("JamMoney 회원이 되신 것을 환영합니다!", "success", 1000);

      setTimeout(() => {
        window.location.href = "/index.html";
      }, 1000);
    } catch (error) {
      errorElement.textContent =
        "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
      errorElement.style.display = "block";
    }
  });
});

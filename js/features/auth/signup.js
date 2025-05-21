import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", function () {
    const signupForm = document.querySelector(".signup-form");

    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault(); //페이지 새로고침 방지

        // 입력값 가져오기
        const email = document.getElementById("email").value.trim();
        const nickname = document.getElementById("nickname").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        // 입력값 유효성 검사
        if (!email || !nickname || !password || !confirmPassword) {
            alert("모든 필드를 입력해주세요.");
            return;
        }

        // 비밀번호 일치 확인
        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            // 회원가입 요청 전송
            const response = await authorizedFetch("http://43.202.211.168:8080/auth/signup", {
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
                alert(result); // "회원가입 성공!"
                window.location.href = "../pages/login.html";
            } else {
                const errorText = await response.text();
                alert(`회원가입 실패: ${errorText}`);
            }
        } catch (error) {
            console.error("회원가입 중 오류 발생:", error);
            alert("서버 연결에 실패했습니다.");
        }
    });
});

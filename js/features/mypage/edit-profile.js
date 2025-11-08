import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
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

    const nicknameInput = document.querySelector(".input input[type='text']");
    const emailInput = document.querySelector("input[type='email']");
    const form = document.querySelector(".edit-form");

    const res = await authorizedFetch("https://jm-money.com/api/user/me");
    const data = await res.json();

    emailInput.value = data.email;
    nicknameInput.value = data.nickname;


    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newNickname = nicknameInput.value.trim();
        if (!newNickname) {
            showPopup("닉네임을 입력해주세요.");
            return;
        }

        const res = await authorizedFetch(
            `https://jm-money.com/api/user/nickname?newNickname=${encodeURIComponent(newNickname)}`,
            { method: "PATCH" }
        );

        if (!res.ok) {
            const errorData = await res.json();
            const errorMessage = errorData.message || "닉네임 변경에 실패했습니다.";
            showPopup(errorMessage);
        }

        const updatedRes = await authorizedFetch("https://jm-money.com/api/user/me");

        if (!updatedRes.ok) {
            showPopup("정보 확인에 실패했습니다. 잠시 후 다시 시도해 주세요.");
            return;
        }

        const updatedData = await updatedRes.json();
        nicknameInput.value = updatedData.nickname;
        showPopup("닉네임이 성공적으로 변경되었습니다!", "success");

        setTimeout(() => {
            history.back();
        }, 1000);
    });

});

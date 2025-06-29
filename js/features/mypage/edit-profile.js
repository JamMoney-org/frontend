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
    //정보 불러오기
    const nicknameInput = document.querySelector(".input input[type='text']");
    const emailInput = document.querySelector("input[type='email']");
    const form = document.querySelector(".edit-form");

    const res = await authorizedFetch("https://jm-money.com/api/user/me");
    const data = await res.json();

    emailInput.value = data.email;
    nicknameInput.value = data.nickname;

    //닉네임 수정
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

        const updatedRes = await authorizedFetch("https://jm-money.com/api/user/me");
        const updatedData = await updatedRes.json();
        nicknameInput.value = updatedData.nickname;
        showPopup("닉네임이 성공적으로 수정되었습니다!");
    });

});

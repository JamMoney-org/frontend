import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
    //정보 불러오기
    const nicknameInput = document.querySelector(".input input[type='text']");
    const emailInput = document.querySelector("input[type='email']");
    const form = document.querySelector(".edit-form");

    const res = await authorizedFetch("http://43.202.211.168:8080/api/user/me");
    const data = await res.json();

    emailInput.value = data.email;
    nicknameInput.value = data.nickname;

    //닉네임 수정
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newNickname = nicknameInput.value.trim();
        if (!newNickname) {
            alert("닉네임을 입력해주세요.");
            return;
        }

        const res = await authorizedFetch(
            `http://43.202.211.168:8080/api/user/nickname?newNickname=${encodeURIComponent(newNickname)}`,
            { method: "PATCH" }
        );

        const updatedRes = await authorizedFetch("http://43.202.211.168:8080/api/user/me");
        const updatedData = await updatedRes.json();
        nicknameInput.value = updatedData.nickname;
        alert("닉네임이 성공적으로 수정되었습니다!");
    });

});

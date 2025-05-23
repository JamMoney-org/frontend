import { authorizedFetch } from "../../utils/auth-fetch.js";

//회원 정보
async function fetchUserInfo() {
    const nicknameElem = document.querySelector(".nickname");
    const emailElem = document.querySelector(".email");

    const res = await authorizedFetch("http://43.202.211.168:8080/api/user/me");
    const data = await res.json();
    nicknameElem.textContent = data.nickname + "님";
    emailElem.textContent = data.email;
}
fetchUserInfo()

//보유 자산
//모의투자 시작할때 포트폴리오가 생성되고 자산을 가져올 수 있음
async function fetchTotalAsset() {
    const res = await authorizedFetch("http://43.202.211.168:8080/api/portfolio", {
        method: "GET",
    });

    if (!res.ok) {
        document.getElementById("asset-value").textContent = "0원";
        return;
    }

    const data = await res.json();
    const totalAsset = data.totalAsset ?? 0; //포트폴리오가 없을때 0으로 처리

    document.getElementById("asset-value").textContent = totalAsset.toLocaleString() + "원";
}


fetchTotalAsset();

//회원 탈퇴
document.addEventListener("DOMContentLoaded", () => {
    const deleteBtn = document.querySelector(".delete");
    deleteBtn?.addEventListener("click", async () => {
        const confirmed = confirm("정말로 탈퇴하시겠습니까?");
        if (!confirmed) return;

        const res = await authorizedFetch("http://43.202.211.168:8080/api/user", {
            method: "DELETE",
        });

        if (res.ok) {
            alert("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "../pages/main.html";
        } else {
            alert("회원 탈퇴에 실패했습니다.");
        }
    });
});


//로그아웃
async function logout() {
    const confirmed = confirm("정말로 로그아웃하시겠습니까?");
    if (!confirmed) return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "../pages/login.html";
}
document.querySelector(".logout").addEventListener("click", logout);

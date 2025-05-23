import { authorizedFetch } from "../../utils/auth-fetch.js";
//회원 탈퇴
document.addEventListener("DOMContentLoaded", () => {
    const deleteBtn = document.querySelector(".delete");
    deleteBtn?.addEventListener("click", async () => {
        const confirmed = confirm("정말로 탈퇴하시겠습니까?");
        if (!confirmed) return;

        try {
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
        } catch (error) {
            console.error("탈퇴 요청 중 오류:", error);
        }
    });
});

//로그아웃
async function logout() {
    const confirmed = confirm("정말로 탈퇴하시겠습니까?");
    if (!confirmed) return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "../pages/login.html";
}
document.querySelector(".logout").addEventListener("click", logout);


//보유 자산
async function fetchTotalAsset() {
    try {
        const res = await authorizedFetch("http://43.202.211.168:8080/api/portfolio");
        const data = await res.json();
        const totalAsset = data.totalAsset;

        document.querySelector(".asset-value").textContent = totalAsset.toLocaleString() + "원";
    } catch (e) {
        console.error(e);
        alert("보유 자산 정보를 불러오는 데 실패했습니다.");
    }
}

fetchTotalAsset();

//학습한 퀴즈

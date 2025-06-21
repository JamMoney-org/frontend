import { authorizedFetch } from "../../utils/auth-fetch.js";
//팝업창
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
// 확인창
function customConfirm(message) {
    return new Promise((resolve) => {
        const existingModal = document.querySelector(".custom-confirm-modal");
        if (existingModal) existingModal.remove();

        const modal = document.createElement("div");
        modal.className = "custom-confirm-modal";

        const box = document.createElement("div");
        box.className = "custom-confirm-box";

        const msg = document.createElement("p");
        msg.className = "custom-confirm-message";
        msg.textContent = message;
        box.appendChild(msg);

        const btnContainer = document.createElement("div");
        btnContainer.className = "custom-confirm-btn-container";

        const okBtn = document.createElement("button");
        okBtn.className = "custom-confirm-btn confirm";
        okBtn.textContent = "확인";
        okBtn.addEventListener("click", () => {
            document.body.removeChild(modal);
            resolve(true);
        });

        const cancelBtn = document.createElement("button");
        cancelBtn.className = "custom-confirm-btn cancel";
        cancelBtn.textContent = "취소";
        cancelBtn.addEventListener("click", () => {
            document.body.removeChild(modal);
            resolve(false);
        });

        btnContainer.appendChild(okBtn);
        btnContainer.appendChild(cancelBtn);
        box.appendChild(btnContainer);
        modal.appendChild(box);

        modal.classList.add("show");

        document.body.appendChild(modal);
    });
}
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
        const confirmed = await customConfirm("정말로 탈퇴하시겠습니까?");
        if (!confirmed) return;

        const res = await authorizedFetch("http://43.202.211.168:8080/api/user", {
            method: "DELETE",
        });

        if (res.ok) {
            showPopup("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "../pages/main.html";
        } else {
            showPopup("회원 탈퇴에 실패했습니다.");
        }
    });
});


//로그아웃
async function logout() {
    const confirmed = await customConfirm("정말로 로그아웃하시겠습니까?");
    if (!confirmed) return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "../pages/index.html";
}
document.querySelector(".logout").addEventListener("click", logout);

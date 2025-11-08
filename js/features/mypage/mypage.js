import { authorizedFetch } from "../../utils/auth-fetch.js";

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

async function fetchUserInfo() {
    const nicknameElem = document.querySelector(".nickname");
    const emailElem = document.querySelector(".email");

    const res = await authorizedFetch("https://jm-money.com/api/user/me");
    const data = await res.json();
    nicknameElem.textContent = data.nickname + "님";
    emailElem.textContent = data.email;
}
fetchUserInfo()


async function fetchTotalAsset() {
    try {
        const res = await authorizedFetch("https://jm-money.com/api/portfolio", {
            method: "GET",
        });

        if (!res.ok) {
            document.getElementById("asset-value").textContent = "0원";
            return;
        }

        const data = await res.json();
        const money = data.money || 0;
        const stockAsset = data.stockAsset || 0;
        const combinedTotalAsset = money + stockAsset;

        document.getElementById("asset-value").textContent = combinedTotalAsset.toLocaleString() + "원";

    } catch (error) {
        console.error("포트폴리오 정보 로딩 실패:", error);
        document.getElementById("asset-value").textContent = "정보 로드 실패";
    }
}


fetchTotalAsset();


document.addEventListener("DOMContentLoaded", () => {
    const deleteBtn = document.querySelector(".delete");
    deleteBtn?.addEventListener("click", async () => {
        const confirmed = await customConfirm("정말로 탈퇴하시겠습니까?");
        if (!confirmed) return;

        const res = await authorizedFetch("https://jm-money.com/api/user", {
            method: "DELETE",
        });

        if (res.ok) {
            showPopup("회원 탈퇴가 완료되었습니다.");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/pages/auth/signup.html";
        } else {
            showPopup("회원 탈퇴에 실패했습니다.");
        }
    });
});


async function logout() {
    const confirmed = await customConfirm("정말로 로그아웃하시겠습니까?");
    if (!confirmed) return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/index.html";
}
document.querySelector(".logout").addEventListener("click", logout);

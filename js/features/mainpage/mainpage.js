import { authorizedFetch } from "../../utils/auth-fetch.js";

// 팝업
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

// 캐릭터 레벨에 맞는 이미지 설정
function setCharacterImageByLevel(level) {
    const characterImg = document.getElementById("characterImage");
    if (characterImg) {
        characterImg.src = `https://jammoney.s3.ap-northeast-2.amazonaws.com/pet_level_${level}.png`;
    }
}

// 캐릭터 상태 불러오기
async function fetchAndSetCharacterImage() {
    try {
        const res = await authorizedFetch("http://43.202.211.168:8080/api/pet/status");
        if (!res.ok) throw new Error("캐릭터 상태 조회 실패");

        const data = await res.json();
        const status = data.result || data;
        setCharacterImageByLevel(status.data.level);
    } catch (err) {
        showPopup("캐릭터 이미지 로딩 실패: " + err.message);
    }
}

// 장착된 아이템 불러오기
async function loadEquippedItems() {
    try {
        const res = await authorizedFetch("http://43.202.211.168:8080/api/item/inventory");
        if (!res.ok) throw new Error("인벤토리 조회 실패");

        const response = await res.json();
        const inventory = response.result || response.data || response;

        let hasBackground = false;

        inventory.forEach(item => {
            if (!item.equipped) return;

            if (item.type === 'BACKGROUND' && !hasBackground) {
                hasBackground = true;
                const bg = document.getElementById('bgImage');
                if (bg) {
                    bg.src = item.imageUrl;
                    bg.style.display = 'block';
                }
                return;
            }

            if (item.type === 'OBJECT') {
                const objImg = document.createElement('img');
                objImg.src = item.imageUrl;
                objImg.className = `character-object ${item.position}`;
                objImg.style.position = 'absolute';
                objImg.style.pointerEvents = 'none';

                switch (item.position) {
                    case 'left':
                        objImg.style.left = '7%';
                        objImg.style.bottom = '30%';
                        objImg.style.width = '15%';
                        break;
                    case 'right':
                        objImg.style.right = '7%';
                        objImg.style.bottom = '30%';
                        objImg.style.width = '15%';
                        break;
                }

                const area = document.querySelector('.character-area');
                if (area) {
                    area.appendChild(objImg);
                }
            }
        });
        // 배경 아이템이 하나도 없으면 기본 배경 적용
        if (!hasBackground) {
            const bg = document.getElementById('bgImage');
            if (bg) {
                bg.src = '../../../assets/images/default_background.png'; // 기본 배경 경로
                bg.style.display = 'block';
            }
        }
    } catch (err) {
        console.error("장착 아이템 로딩 실패:", err.message);
    }
}

// DOMContentLoaded 시 실행
document.addEventListener('DOMContentLoaded', () => {
    fetchAndSetCharacterImage();
    loadEquippedItems();
});

import { authorizedFetch } from "../../utils/auth-fetch.js";

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
        alert("캐릭터 이미지 로딩 실패: " + err.message);
    }
}

// 장착된 아이템 UI에 적용 (통합 버전)
function updateEquippedItems(items) {
    const characterArea = document.querySelector(".character-area");
    if (!characterArea) return;

    characterArea.querySelectorAll(".equipped-item").forEach(el => el.remove());

    items.filter(item => item.equipped).forEach(item => {
        if (item.type === 'BACKGROUND') {
            const bg = document.getElementById('bgImage');
            if (bg) {
                bg.src = item.imageUrl;
                bg.style.display = 'block';
            }
            return;
        }

        const img = document.createElement('img');
        img.src = item.imageUrl;
        img.alt = item.name;
        img.className = 'equipped-item';
        img.style.position = 'absolute';
        img.style.pointerEvents = 'none';

        switch (item.position) {
            case "left":
                img.style.left = "7%";
                img.style.bottom = "30%";
                img.style.width = "15%";
                break;
            case "right":
                img.style.right = "7%";
                img.style.bottom = "30%";
                img.style.width = "15%";
                break;
        }

        characterArea.appendChild(img);
    });
}

// 인벤토리 렌더링
function renderInventory(items, previewImg, previewName, previewPrice) {
    const itemGrid = document.querySelector(".item-grid");
    itemGrid.innerHTML = "";

    items.forEach(item => {
        const box = document.createElement("div");
        box.className = "item-box";
        box.dataset.category = item.type;

        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.name;
        img.className = "item-img";

        if (item.equipped) {
            box.style.border = "3px solid #5dc29e";
        }

        box.appendChild(img);
        itemGrid.appendChild(box);

        box.addEventListener("click", () => {
            selectedItem = item;
            previewImg.src = item.imageUrl;
            previewName.textContent = item.name;

            previewImg.style.width = "50%";
            previewImg.style.height = "50%";
            previewImg.style.objectFit = "contain";

            document.getElementById("selectedItemInfo").style.display = "flex";

            const equipButton = document.querySelector(".equip-button");
            if (equipButton) {
                equipButton.textContent = item.equipped ? "해제하기" : "장착하기";
            }
        });
    });
}

let selectedItem = null;
let inventoryItems = [];

// DOM 로드 후 초기화
document.addEventListener("DOMContentLoaded", () => {
    const categoryButtons = document.querySelectorAll(".category");
    const previewImg = document.getElementById("selectedItemImage");
    const previewName = document.getElementById("selectedItemName");
    const previewPrice = document.getElementById("selectedItemPrice");
    const equipButton = document.querySelector(".equip-button");
    const sellButton = document.querySelector(".sell-button");

    // 아이템 장착/해제 API 호출
    function toggleEquip(itemId, equip) {
        authorizedFetch("http://43.202.211.168:8080/api/item/equip", {
            method: "POST",
            body: JSON.stringify({ itemId, equip })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message || (equip ? "장착 완료!" : "해제 완료!"));
                location.reload();
            })
            .catch(err => alert("장착 요청 실패: " + err.message));
    }

    // 장착 버튼 이벤트
    if (equipButton) {
        equipButton.addEventListener("click", () => {
            if (!selectedItem) return alert("아이템을 선택해주세요!");
            toggleEquip(selectedItem.itemId, !selectedItem.equipped);
        });
    }

    // 카테고리 필터링
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            const filtered = filter === "전체"
                ? inventoryItems
                : inventoryItems.filter(item => item.type === filter);
            renderInventory(filtered, previewImg, previewName, previewPrice);
        });
    });

    // 인벤토리 불러오기
    function fetchInventory() {
        authorizedFetch("http://43.202.211.168:8080/api/item/inventory")
            .then(res => res.json())
            .then(data => {
                inventoryItems = data.data || data.result || [];
                renderInventory(inventoryItems, previewImg, previewName, previewPrice);
                updateEquippedItems(inventoryItems);
            })
            .catch(err => alert("인벤토리 불러오기 실패: " + err.message));
    }

    fetchAndSetCharacterImage();
    fetchInventory(); // 이 안에서 updateEquippedItems도 실행됨
});

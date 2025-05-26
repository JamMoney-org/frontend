import { authorizedFetch } from "../../utils/auth-fetch.js";

//레벨별 캐릭터 이미지 설정
function setCharacterImageByLevel(level) {
    const characterImg = document.getElementById("characterImage");
    if (characterImg) {
        characterImg.src = `https://jammoney.s3.ap-northeast-2.amazonaws.com/pet_level_${level}.png`;
    }
}

async function fetchAndSetCharacterImage() {
    const res = await authorizedFetch("http://43.202.211.168:8080/api/pet/status");
    if (!res.ok) throw new Error("캐릭터 상태 조회 실패");

    const data = await res.json();
    const status = data.result || data;
    setCharacterImageByLevel(status.data.level);
}

// 아이템 장착해서 보여주기
function updateEquippedItems(items) {
    const characterArea = document.querySelector(".character-area");
    if (!characterArea) return;

    characterArea.querySelectorAll(".equipped-item").forEach(el => el.remove());

    items.filter(item => item.equipped).forEach(item => {
        if (item.position === 'background') {
            const bg = document.getElementById("bgImage");
            if (bg) bg.src = item.imageUrl;
            return;
        }

        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.name;
        img.className = "equipped-item";
        img.style.position = "absolute";

        switch (item.position) {
            case 'furniture':
                img.style.top = '60%';
                img.style.left = '40%';
                break;
            case 'decoration':
                img.style.top = '20%';
                img.style.left = '45%';
                break;
            case 'sculpture':
            case 'etc':
                img.style.bottom = '5%';
                img.style.left = '42%';
                break;
        }

        characterArea.appendChild(img);
    });
}

//인벤토리
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

            const equipButton = document.querySelector(".equip-button");
            if (equipButton) {
                equipButton.textContent = item.equipped ? "해제하기" : "장착하기";
            }
        });
    });
}

let selectedItem = null;
let inventoryItems = [];

document.addEventListener("DOMContentLoaded", () => {
    const categoryButtons = document.querySelectorAll(".category");
    const previewImg = document.getElementById("selectedItemImage");
    const previewName = document.getElementById("selectedItemName");
    const previewPrice = document.getElementById("selectedItemPrice");
    const equipButton = document.querySelector(".equip-button");
    const sellButton = document.querySelector(".sell-button");

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

    if (equipButton) {
        equipButton.addEventListener("click", () => {
            if (!selectedItem) {
                alert("아이템을 선택해주세요!");
                return;
            }
            toggleEquip(selectedItem.itemId, !selectedItem.equipped);
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;

            const filtered = filter === "전체"
                ? inventoryItems
                : inventoryItems.filter(item => item.type === filter);

            renderInventory(filtered, previewImg, previewName, previewPrice);
        });
    });

    function fetchInventory() {
        authorizedFetch("http://43.202.211.168:8080/api/item/inventory")
            .then(res => res.json())
            .then(data => {
                inventoryItems = data.data || data.result || [];
                renderInventory(inventoryItems, previewImg, previewName, previewPrice);
                updateEquippedItems(inventoryItems);
            })
    }

    fetchAndSetCharacterImage();
    fetchInventory();
});

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
async function getCurrentTotalCash() {
    try {
        const res = await authorizedFetch('https://jm-money.com/api/portfolio');

        if (!res.ok) {
            throw new Error(`서버 응답 오류: ${res.status}`);
        }

        const data = await res.json();
        return data.money || 0;

    } catch (err) {
        console.error("총 보유 현금 조회 실패:", err);
        showPopup("보유 현금 정보를 불러오는 데 실패했습니다.", "error");
        return 0;
    }
}
async function displayUserCash() {
    const cashElem = document.getElementById("currentUserCash");
    if (!cashElem) return;

    const currentCash = await getCurrentTotalCash();
    cashElem.textContent = `🪙 ${currentCash.toLocaleString()} 잼머니`;
}


function setCharacterImageByLevel(level) {
    const characterImg = document.getElementById("characterImage");
    if (characterImg) {
        characterImg.src = `https://jammoney.s3.ap-northeast-2.amazonaws.com/pet_level_${level}.png`;
    }
}


async function fetchAndSetCharacterImage() {
    try {
        const res = await authorizedFetch("https://jm-money.com/api/pet/status");
        if (!res.ok) throw new Error("캐릭터 상태 조회 실패");

        const data = await res.json();
        const status = data.result || data;
        setCharacterImageByLevel(status.data.level);
    } catch (err) {
        showPopup("캐릭터 이미지 로딩 실패: " + err.message);
    }
}


function updateEquippedItems(items) {
    const characterArea = document.querySelector(".character-area");
    if (!characterArea) return;

    characterArea.querySelectorAll(".equipped-item").forEach(el => el.remove());

    let hasBackground = false;

    items.filter(item => item.equipped).forEach(item => {
        if (item.type === 'BACKGROUND' && !hasBackground) {
            hasBackground = true;
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

    if (!hasBackground) {
        const bg = document.getElementById('bgImage');
        if (bg) {
            bg.src = '/assets/images/default_background.png';
            bg.style.display = 'block';
        }
    }
}


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
            console.log("선택된 아이템 객체:", selectedItem);
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
let shopItems = [];


async function fetchShopItems() {
    try {
        const res = await authorizedFetch("https://jm-money.com/api/item/shop");
        if (!res.ok) throw new Error("상점 아이템 조회 실패");

        const data = await res.json();
        shopItems = data.data || data || [];
    } catch (err) {
        showPopup("상점 아이템 불러오기 실패: " + err.message);
    }
}

function getShopPriceByItemId(itemId) {
    const shopItem = shopItems.find(item => item.itemId === itemId);
    return shopItem ? shopItem.price : null;
}



document.addEventListener("DOMContentLoaded", () => {
    const categoryButtons = document.querySelectorAll(".category");
    const previewImg = document.getElementById("selectedItemImage");
    const previewName = document.getElementById("selectedItemName");
    const previewPrice = document.getElementById("selectedItemPrice");
    const equipButton = document.querySelector(".equip-button");
    const sellButton = document.querySelector(".sell-button");
    const allButton = document.querySelector('.category[data-filter="전체"]');
    if (allButton) {
        allButton.classList.add("active");
    }
    displayUserCash();


    function toggleEquip(itemId, equip) {
        authorizedFetch("https://jm-money.com/api/item/equip", {
            method: "POST",
            body: JSON.stringify({ itemId, equip })
        })
            .then(res => res.json())
            .then(data => {
                showPopup(data.message || (equip ? "장착 완료!" : "해제 완료!"));
                fetchInventory();
                selectedItem.equipped = equip;
                if (equipButton) {
                    equipButton.textContent = equip ? "해제하기" : "장착하기";
                }
            })
            .catch(err => showPopup("장착 요청 실패: " + err.message));
    }


    if (equipButton) {
        equipButton.addEventListener("click", () => {
            if (!selectedItem) return showPopup("아이템을 선택해주세요!");
            toggleEquip(selectedItem.itemId, !selectedItem.equipped);
        });
    }


    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            categoryButtons.forEach(btn => {
                btn.classList.remove("active");
            });
            button.classList.add("active");
            const filter = button.dataset.filter;
            const filtered = filter === "전체"
                ? inventoryItems
                : inventoryItems.filter(item => item.type === filter);
            renderInventory(filtered, previewImg, previewName, previewPrice);
        });
    });


    function fetchInventory() {
        authorizedFetch("https://jm-money.com/api/item/inventory")
            .then(res => res.json())
            .then(data => {
                inventoryItems = data.data || data.result || [];
                renderInventory(inventoryItems, previewImg, previewName, previewPrice);
                updateEquippedItems(inventoryItems);
            })
            .catch(err => showPopup("인벤토리 불러오기 실패: " + err.message));
    }




    if (sellButton) {
        sellButton.addEventListener("click", async () => {
            if (!selectedItem) {
                showPopup("아이템을 선택해주세요!");
                return;
            }
            if (selectedItem.equipped) {
                showPopup("장착된 아이템은 판매할 수 없습니다. 해제 먼저 해주세요.");
                return;
            }

            const originalPrice = getShopPriceByItemId(selectedItem.itemId);
            const sellPrice = Math.floor(originalPrice * 0.8);

            const confirmSell = await customConfirm(`"${selectedItem.name}" 아이템을 🪙${sellPrice} 잼머니에 판매하시겠습니까?`);
            if (!confirmSell) return;

            authorizedFetch("https://jm-money.com/api/item/sell", {
                method: "POST",
                body: JSON.stringify({ itemId: selectedItem.itemId })
            })
                .then(res => res.json())
                .then(data => {
                    showPopup(data.message || "판매 완료!");
                    fetchInventory();
                    document.getElementById("selectedItemInfo").style.display = "none";
                    selectedItem = null;
                })
                .catch(err => showPopup("판매 실패: " + err.message));
        });
    }
    fetchAndSetCharacterImage();
    fetchShopItems();
    fetchInventory();
});


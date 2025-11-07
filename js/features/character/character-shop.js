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

document.addEventListener("DOMContentLoaded", () => {
  const itemGrid = document.querySelector(".item-grid");
  const previewImg = document.getElementById("selectedItemImage");
  const previewName = document.getElementById("selectedItemName");
  const previewPrice = document.getElementById("selectedItemPrice");
  const buyButton = document.querySelector(".buy-button");
  const sellButton = document.querySelector(".sell-button");

  let selectedItem = null;
  let shopItems = [];
  let purchasedItemIds = new Set();

  const categoryButtons = document.querySelectorAll(".category");
  const allButton = document.querySelector('.category[data-filter="전체"]');
  if (allButton) {
    allButton.classList.add("active");
  }

  displayUserCash();

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      categoryButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      const filter = button.dataset.filter;
      const filtered = filter === "전체"
        ? shopItems
        : shopItems.filter(item => item.type === filter);
      renderItems(filtered);
    });
  });


  function renderItems(items) {
    itemGrid.innerHTML = "";
    items.forEach(item => {
      const box = document.createElement("div");
      box.className = "item-box";
      box.dataset.name = item.name;
      box.dataset.price = item.price;
      box.dataset.image = item.previewUrl;
      box.dataset.category = item.type;

      if (purchasedItemIds.has(item.itemId)) {
        box.classList.add("purchased"); // 'purchased' 클래스 추가
        // (참고: CSS에서 .item-box.purchased { display: none; } 처리가 필요합니다.)
      }

      const img = document.createElement("img");
      img.src = item.previewUrl;
      img.alt = item.name;
      img.className = "item-img";

      box.appendChild(img);
      itemGrid.appendChild(box);

      box.addEventListener("click", () => {
        previewImg.src = item.previewUrl;
        previewName.textContent = item.name;
        previewPrice.textContent = `🪙 ${item.price.toLocaleString()} 잼머니`;
        selectedItem = item;

        console.log("선택된 아이템 전체 객체:", selectedItem);
        console.log("선택된 아이템 가격:", selectedItem.price);

        document.getElementById("selectedItemInfo").style.display = "flex";
      });
    });
  }


  async function loadShopAndInventory() {
    try {
      // 1. 인벤토리(구매 목록) 먼저 불러오기
      const inventoryRes = await authorizedFetch('https://jm-money.com/api/item/inventory');
      if (inventoryRes.ok) {
        const inventory = await inventoryRes.json();
        const inventoryData = inventory.data || inventory;
        // 구매한 아이템 ID 목록을 Set에 저장
        inventoryData.forEach(item => purchasedItemIds.add(item.itemId));
      } else {
        throw new Error('인벤토리 조회 실패');
      }

      // 2. 상점 아이템 목록 불러오기
      const shopRes = await authorizedFetch("https://jm-money.com/api/item/shop");
      if (shopRes.ok) {
        const data = await shopRes.json();
        shopItems = data.data || data || [];
        // 3. (중요) 구매 목록을 확인한 후 아이템 렌더링
        renderItems(shopItems);
      } else {
        throw new Error('상점 아이템 조회 실패');
      }

    } catch (err) {
      console.error("상점 로딩 실패:", err);
      showPopup("아이템 정보를 불러오는 데 실패했습니다.");
    }
  }

  loadShopAndInventory(); 
  
  async function checkIfItemAlreadyPurchased(itemId) {
    return purchasedItemIds.has(itemId);
  }

  buyButton.addEventListener("click", async () => {
    // 0. 아이템 선택 확인
    if (!selectedItem) {
      showPopup("아이템을 먼저 선택해주세요.");
      return;
    }
    if (purchasedItemIds.has(selectedItem.itemId)) {
      showPopup("이미 구매한 아이템입니다.");
      return;
    }

    // 1. 구매 확인 (가격 콤마 추가)
    const confirmBuy = await customConfirm(`🪙 ${selectedItem.price.toLocaleString()} 잼머니로 "${selectedItem.name}"을 구매할까요?`);
    if (!confirmBuy) return;

    // 2. (핵심 수정) 퀴즈+주식의 '통합 잔액'을 조회
    const currentTotalCash = await getCurrentTotalCash();

    // 3. 잔액 부족 확인 및 구매 중단
    if (currentTotalCash < selectedItem.price) {
      showPopup(`잔액이 부족합니다! (현재 총 잔액: ${currentTotalCash.toLocaleString()} 잼머니)`, "error");
      return;
    }

    // 4. 이미 구매한 아이템인지 확인 (기존 로직)
    const isAlreadyPurchased = await checkIfItemAlreadyPurchased(selectedItem.itemId);
    if (isAlreadyPurchased) {
      showPopup("이미 구매한 아이템입니다.");
      return;
    }


    authorizedFetch("https://jm-money.com/api/item/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: selectedItem.itemId })
    })
      .then(async res => {
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "구매 처리 중 오류 발생" }));
          throw new Error(errorData.message || "구매 실패");
        }
        return res.json();
      })
      .then(data => {
        showPopup(data.message || "구매 완료!", "success");
        // (추가) 구매 성공 시 화면의 잔액 즉시 업데이트
        displayUserCash();

        // (추가) 구매 목록 Set에 방금 산 아이템 ID 추가
        purchasedItemIds.add(selectedItem.itemId);

        // (추가) 현재 카테고리 기준으로 아이템 목록을 다시 그려서
        // 방금 산 아이템을 숨김 처리
        const currentFilter = document.querySelector(".category.active").dataset.filter;
        const filtered = currentFilter === "전체"
          ? shopItems
          : shopItems.filter(item => item.type === currentFilter);
        renderItems(filtered);
      })
      /* ---- 수정 끝 ---- */
      .catch(err => {
        // 실패 시 (서버에서 보낸 구체적인 오류 메시지를 팝업으로 띄움)
        showPopup(err.message, "error");
      });
  });


  async function loadEquippedItems() {
    try {
      const res = await authorizedFetch('https://jm-money.com/api/item/inventory');
      if (!res.ok) throw new Error('인벤토리 조회 실패');

      const response = await res.json();
      const inventory = response.data || response;

      inventory.forEach(item => {
        if (!item.equipped) return;

        if (item.type === 'BACKGROUND') {
          const bg = document.getElementById('bgImage');
          if (bg) {
            bg.src = item.imageUrl;
            bg.style.display = 'block';
          }
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
              objImg.style.width = '10%';
              break;
            case 'right':
              objImg.style.right = '7%';
              objImg.style.bottom = '30%';
              objImg.style.width = '10%';
              break;
          }

          document.querySelector('#character-area')?.appendChild(objImg);
        }
      });
    } catch (err) {
      console.error("장착 아이템 불러오기 실패:", err.message);
    }
  }

  loadEquippedItems();
});

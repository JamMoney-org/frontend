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

document.addEventListener("DOMContentLoaded", () => {
  const itemGrid = document.querySelector(".item-grid");
  const previewImg = document.getElementById("selectedItemImage");
  const previewName = document.getElementById("selectedItemName");
  const previewPrice = document.getElementById("selectedItemPrice");
  const buyButton = document.querySelector(".buy-button");
  const sellButton = document.querySelector(".sell-button");

  let selectedItem = null;
  let shopItems = [];

  const categoryButtons = document.querySelectorAll(".category");

  // 카테고리 필터링
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      const filtered = filter === "전체"
        ? shopItems
        : shopItems.filter(item => item.type === filter);
      renderItems(filtered);
    });
  });

  // 아이템 렌더링
  function renderItems(items) {
    itemGrid.innerHTML = "";
    items.forEach(item => {
      const box = document.createElement("div");
      box.className = "item-box";
      box.dataset.name = item.name;
      box.dataset.price = item.price;
      box.dataset.image = item.previewUrl;
      box.dataset.category = item.type;

      const img = document.createElement("img");
      img.src = item.previewUrl;
      img.alt = item.name;
      img.className = "item-img";

      box.appendChild(img);
      itemGrid.appendChild(box);

      box.addEventListener("click", () => {
        previewImg.src = item.previewUrl;
        previewName.textContent = item.name;
        previewPrice.textContent = `🪙 ${item.price} cash`;
        selectedItem = item;

        console.log("선택된 아이템 전체 객체:", selectedItem);
        console.log("선택된 아이템 가격:", selectedItem.price);

        document.getElementById("selectedItemInfo").style.display = "flex";
      });
    });
  }

  // 아이템 불러오기
  authorizedFetch("https://jm-money.com/api/item/shop")
    .then(res => res.ok ? res.json() : Promise.reject("조회 실패"))
    .then(data => {
      const items = data.data || data || [];
      shopItems = items;
      renderItems(shopItems);
    })
    .catch(err => {
      console.error("❌ 아이템 불러오기 실패:", err);
      showPopup("아이템 불러오기 실패: " + err);
    });

  // 이미 구매한 아이템인지 확인하는 함수
  async function checkIfItemAlreadyPurchased(itemId) {
    try {
      const res = await authorizedFetch('https://jm-money.com/api/item/inventory');
      if (!res.ok) throw new Error('인벤토리 조회 실패');

      const response = await res.json();
      const inventory = response.data || response;

      return inventory.some(item => item.itemId === itemId);
    } catch (err) {
      showPopup("인벤토리 조회 실패: " + err.message);
      return false;
    }
  }

  // 구매하기
  buyButton.addEventListener("click", async () => {
    const confirmBuy = await customConfirm(`🪙 ${selectedItem.price} cash로 "${selectedItem.name}"을 구매할까요?`);
    if (!confirmBuy) return;

    // 이미 구매한 아이템인지 확인
    const isAlreadyPurchased = await checkIfItemAlreadyPurchased(selectedItem.itemId);
    if (isAlreadyPurchased) {
      showPopup("이미 구매한 아이템입니다.");
      return;
    }

    // 아이템 구매 요청
    authorizedFetch("https://jm-money.com/api/item/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: selectedItem.itemId })
    })
      .then(res => res.json())
      .then(data => {
        showPopup(data.message || "구매 완료!");
      })
      .catch(err => {
        showPopup("구매 실패: " + err.message);
      });
  });

  // 장착 아이템 불러오기
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

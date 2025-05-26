import { authorizedFetch } from "../../utils/auth-fetch.js";

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
      });
    });
  }

  //아이템 불러오기
  authorizedFetch("http://43.202.211.168:8080/api/item/shop")
    .then(res => res.ok ? res.json() : Promise.reject("조회 실패"))
    .then(data => {
      const items = data.data || data || [];
      shopItems = items;
      renderItems(shopItems);
    })
    .catch(err => {
      console.error("❌ 아이템 불러오기 실패:", err);
      alert("아이템 불러오기 실패: " + err);
    });

  // 구매하기
  buyButton.addEventListener("click", () => {
    if (!selectedItem) {
      alert("아이템을 선택해주세요!");
      return;
    }

    const confirmBuy = confirm(`🪙 ${selectedItem.price} cash로 \"${selectedItem.name}\"을 구매할까요?`);
    if (!confirmBuy) return;

    authorizedFetch("http://43.202.211.168:8080/api/item/purchase", {
      method: "POST",
      body: JSON.stringify({ itemId: selectedItem.itemId })
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message || "구매 완료!");
      })
      .catch(err => {
        alert("구매 실패: " + err.message);
      });
  });

  // 판매하기
  if (sellButton) {
    sellButton.addEventListener("click", () => {
      if (!selectedItem) {
        alert("아이템을 선택해주세요!");
        return;
      }

      const confirmSell = confirm(`"${selectedItem.name}" 아이템을 "${selectedItem.price * 0.8}"cash에 판매하시겠습니까?`);
      if (!confirmSell) return;

      authorizedFetch("http://43.202.211.168:8080/api/item/sell", {
        method: "POST",
        body: JSON.stringify({ itemId: selectedItem.itemId })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.message || "판매 완료!");
          fetchInventory();
        })
        .catch(err => alert("판매 실패: " + err.message));
    });
  }

});

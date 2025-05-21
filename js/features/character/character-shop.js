import { authorizedFetch } from "../../utils/auth-fetch.js";

// 테스트용 mock 데이터 
const mockShopItems = [
  {
    itemId: 1,
    name: "왕관 모자",
    type: "장식",
    price: 100,
    previewUrl: "../assets/images/crown.png"
  },
  {
    itemId: 2,
    name: "우주 배경",
    type: "배경",
    price: 300,
    previewUrl: "../assets/images/space-bg.svg"
  },
  {
    itemId: 3,
    name: "나무 의자",
    type: "가구",
    price: 200,
    previewUrl: "../assets/images/chair.png"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  const itemGrid = document.querySelector(".item-grid");
  const previewImg = document.getElementById("selectedItemImage");
  const previewName = document.getElementById("selectedItemName");
  const previewPrice = document.getElementById("selectedItemPrice");
  const buyButton = document.querySelector(".buy-button");

  let selectedItem = null;
  let shopItems = []; // 전체 아이템 보관용

  // 카테고리 버튼들 선택
  const categoryButtons = document.querySelectorAll(".category");

  // 카테고리 버튼 클릭 시 필터링
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      const filtered = filter === "전체"
        ? shopItems
        : shopItems.filter(item => item.type === filter);
      renderItems(filtered);
    });
  });

  // 아이템 렌더링 함수 분리
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
        previewPrice.textContent = `🪙 ${item.price}p`;
        selectedItem = item;
      });
    });
  }

  // 기존 더미 아이템 박스 제거
  itemGrid.innerHTML = "";

  //테스트용 !!!
  shopItems = mockShopItems;
  renderItems(shopItems);

  // 실제 백엔드에서 상점 아이템 목록 받아오기
  /*
  authorizedFetch("http://43.202.211.168:8080/api/item/shop")
    .then(res => {
      if (!res.ok) throw new Error("상점 아이템 조회 실패");
      return res.json();
    }) 
    .then(data => {
      shopItems = data.result;
      itemGrid.innerHTML = "";
      renderItems(shopItems);
    })
    .catch(err => {
      alert("아이템을 불러오는 데 실패했습니다.");
      console.error(err);
    }); 
  */

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
      headers: { "Content-Type": "application/json" },
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
});

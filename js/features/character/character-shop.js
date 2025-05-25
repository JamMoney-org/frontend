import { authorizedFetch } from "../../utils/auth-fetch.js";

//레벨별 이미지 설정
function setCharacterImageByLevel(level) {
  const characterImg = document.getElementById("characterImage");
  if (characterImg) {
    characterImg.src = `https://jammoney.s3.ap-northeast-2.amazonaws.com/pet_level_${level}.png`;
  }
}

//이미지 api 연결
async function fetchAndSetCharacterImage() {
  const res = await authorizedFetch("http://43.202.211.168:8080/api/pet/status");
  if (!res.ok) throw new Error("캐릭터 상태 조회 실패");

  const data = await res.json();
  const status = data.result || data;

  setCharacterImageByLevel(status.data.level);

}

document.addEventListener("DOMContentLoaded", () => {
  fetchAndSetCharacterImage();
});

document.addEventListener("DOMContentLoaded", () => {
  const itemGrid = document.querySelector(".item-grid");
  const previewImg = document.getElementById("selectedItemImage");
  const previewName = document.getElementById("selectedItemName");
  const previewPrice = document.getElementById("selectedItemPrice");
  const buyButton = document.querySelector(".buy-button");

  let selectedItem = null;
  let shopItems = [];

  const categoryButtons = document.querySelectorAll(".category");


  //카테고리
  function getCategory(item) {
    const pos = item.position?.toLowerCase().trim();

    switch (pos) {
      case "background":
      case "":
      case null:
      case undefined:
        return "배경";

      case "furniture":
        return "가구";

      case "decoration":
        return "장식";

      case "sculpture":
        return "조형";

      case "etc":
      default:
        return "기타";
    }
  }



  // 카테고리 필터링
  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      const filtered = filter === "전체"
        ? shopItems
        : shopItems.filter(item => getCategory(item) === filter);

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
        previewPrice.textContent = `🪙 ${item.price}p`;
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

import { authorizedFetch } from "../../utils/auth-fetch.js";

// 테스트용
const inventoryItems = [
    {
        itemId: 1,
        name: "왕관 모자",
        type: "장식",
        equipped: true,
        imageUrl: "../assets/images/crown.png",
        position: "head"
    },
    {
        itemId: 2,
        name: "나무 의자",
        type: "가구",
        equipped: false,
        imageUrl: "../assets/images/chair.png",
        position: "body"
    },
    {
        itemId: 3,
        name: "우주 배경",
        type: "배경",
        equipped: true,
        imageUrl: "../assets/images/space-bg.svg",
        position: "background"
    },
    {
        itemId: 4,
        name: "초록 리본",
        type: "장식",
        equipped: false,
        imageUrl: "../assets/images/ribbon.png",
        position: "head"
    },
    {
        itemId: 5,
        name: "호박 조형물",
        type: "조형",
        equipped: false,
        imageUrl: "../assets/images/pumpkin.png",
        position: "body"
    }
];

document.addEventListener("DOMContentLoaded", () => {
    const itemGrid = document.querySelector(".item-grid");
    const categoryButtons = document.querySelectorAll(".category");

    let selectedItem = null;

    // 장착/해제 요청 함수 
    function toggleEquip(item, equip) {
        alert(`"${item.name}" 아이템을 ${equip ? "장착" : "해제"}합니다.`);

        // 서버로 호출
        /*
        authorizedFetch("/api/item/equip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: item.itemId, equip })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                fetchInventory(); // 장착 상태 갱신
            });
        */
    }
      

    // 아이템 렌더링
    function renderInventory(items) {
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
                const newEquip = !item.equipped;
                toggleEquip(item.itemId, newEquip);
            });
        });
    }

    // 카테고리 필터링
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            const filter = button.dataset.filter;
            const filtered = filter === "전체"
                ? inventoryItems
                : inventoryItems.filter(item => item.type === filter);
            renderInventory(filtered);
        });
    });

    // 테스트 데이터로 바로 렌더링
    renderInventory(inventoryItems);

    // 서버로 호출
    /*
    function fetchInventory() {
        authorizedFetch("/api/item/inventory")
            .then(res => res.json())
            .then(data => {
                inventoryItems = data.result;
                renderInventory(inventoryItems);
            });
    }
    fetchInventory();
    */
});

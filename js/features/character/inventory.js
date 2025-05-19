document.addEventListener("DOMContentLoaded", () => {
    const itemGrid = document.querySelector(".item-grid");
    const categoryButtons = document.querySelectorAll(".category");

    let selectedItem = null;
    let inventoryItems = []; // 전체 인벤토리 데이터 저장

    //장착/해제 요청 함수
    function toggleEquip(itemId, equip) {
        fetch("/api/item/equip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, equip })
        })
            .then(res => res.json())
            .then(data => {
                alert(data.message);
                fetchInventory(); // 장착 상태 갱신
            });
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

            //장착 여부 표시
            if (item.equipped) {
                box.style.border = "3px solid #5dc29e";
            }

            box.appendChild(img);
            itemGrid.appendChild(box);

            // 클릭 시 장착/해제
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

    // 인벤토리 불러오기
    function fetchInventory() {
        fetch("/api/item/inventory")
            .then(res => res.json())
            .then(data => {
                inventoryItems = data.result;
                renderInventory(inventoryItems);
            });
    }

    // 처음 진입 시 인벤토리 불러오기
    fetchInventory();
});

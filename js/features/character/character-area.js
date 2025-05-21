import { authorizedFetch } from "../../utils/auth-fetch.js";

const mockStatusData = {
  level: 5,
  exp: 120,
  nextLevelExp: 150,
  expPercentage: 60,
  mood: "Happy",
  imageName: "../assets/images/character_egg.png"
};

const mockInventoryData = [
  {
    itemId: 1,
    name: "고깔모자",
    type: "장식",
    equipped: true,
    imageUrl: "../assets/images/hat.png",
    position: "head"
  },
  {
    itemId: 2,
    name: "티셔츠",
    type: "의상",
    equipped: true,
    imageUrl: "../assets/images/shirt.png",
    position: "body"
  },
  {
    itemId: 3,
    name: "해변 배경",
    type: "배경",
    equipped: true,
    imageUrl: "../assets/images/background_default.svg",
    position: "background"
  }
];

async function initCharacter() {
  try {
    //테스트값
    const statusData = mockStatusData;
    const inventoryData = mockInventoryData;

    // 실제 fetch 코드

    /*const statusRes = await authorizedFetch('/api/pet/status');
    const inventoryRes = await authorizedFetch('/api/item/inventory');
    if (!statusRes.ok || !inventoryRes.ok) throw new Error("정보를 불러오지 못했습니다.");
    const statusData = await statusRes.json();
    const inventoryData = await inventoryRes.json(); */


    const characterImg = document.getElementById('characterImage');
    characterImg.src = statusData.imageName;

    const characterArea = document.querySelector('.character-area');
    characterArea.querySelectorAll('.equipped-item').forEach(el => el.remove());

    inventoryData.forEach(item => {
      if (item.equipped) {
        const img = document.createElement('img');
        img.src = item.imageUrl;
        img.alt = item.name;
        img.className = 'equipped-item';
        img.style.position = 'absolute';

        switch (item.position) {
          case 'head':
            img.style.top = '10%';
            img.style.left = '45%';
            break;
          case 'body':
            img.style.bottom = '20%';
            img.style.left = '40%';
            break;
          case 'background':
            const bg = document.get
            ElementById('bgImage');
            bg.src = item.imageUrl;
            return;
        }

        characterArea.appendChild(img);
      }
    });
    document.getElementById('nameEditBox').addEventListener('click', () => {
      document.getElementById('nameEditBox').style.display = 'flex';
    });


  } catch (error) {
    console.warn("무시된 오류:", error.message);
  }
}


// character-area.html 로딩 완료 후 initCharacter() 호출
window.addEventListener("DOMContentLoaded", () => {
  const characterAreaContainer = document.getElementById("character-area");

  authorizedFetch("./character_area.html")
    .then(res => res.text())
    .then(html => {
      characterAreaContainer.innerHTML = html;

      // DOM이 완전히 반영된 후 initCharacter 실행
      requestAnimationFrame(() => {
        setTimeout(() => {
          initCharacter();
        }, 0);
      });
    });
});

import { authorizedFetch } from "../../utils/auth-fetch.js";

async function initCharacter() {
  try {
    // ✅ 실제 서버에서 데이터 요청
    const statusRes = await authorizedFetch('http://43.202.211.168:8080/api/pet/status');
    const inventoryRes = await authorizedFetch('http://43.202.211.168:8080/api/item/inventory');

    if (!statusRes.ok || !inventoryRes.ok) throw new Error("정보를 불러오지 못했습니다.");

    const statusJson = await statusRes.json();
    const inventoryJson = await inventoryRes.json();

    const statusData = statusJson.result || statusJson;
    const inventoryData = inventoryJson.result || inventoryJson;

    const characterImg = document.getElementById('characterImage'); //캐릭터 이미지 설정
    characterImg.src = '../assets/images/character_egg.png'; //테스트용
    //characterImg.src = `../assets/images/${statusData.imageName}`;

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
            const bg = document.getElementById('bgImage');
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

      requestAnimationFrame(() => {
        setTimeout(() => {
          initCharacter();
        }, 0);
      });
    });
});

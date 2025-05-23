import { authorizedFetch } from "../../utils/auth-fetch.js";

//레벨별 캐릭터 //액자식 구성 ...
export function setCharacterImage(level) {
  const characterImg = document.getElementById("characterImage");
  if (characterImg) {
    characterImg.src = `https://jammoney.s3.ap-northeast-2.amazonaws.com/pet_level_${level}.png`;
  }
}

async function initCharacter() {
  const statusRes = await authorizedFetch('http://43.202.211.168:8080/api/pet/status');
  const inventoryRes = await authorizedFetch('http://43.202.211.168:8080/api/item/inventory');

  if (!statusRes.ok || !inventoryRes.ok) throw new Error("정보를 불러오지 못했습니다.");

  const statusJson = await statusRes.json();
  const inventoryJson = await inventoryRes.json();
  const statusData = statusJson.result || statusJson;
  const inventoryData = inventoryJson.data;



  //아이템 초기화
  const characterArea = document.querySelector('.character-area');
  characterArea.querySelectorAll('.equipped-item').forEach(el => el.remove());

  //착용한 아이템만 보이도록
  inventoryData.filter(item => item.equipped).forEach(item => {
    if (item.position === 'background') { //배경
      const bg = document.getElementById('bgImage');
      if (bg) bg.src = item.imageUrl;
      return;
    }

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.name;
    img.className = 'equipped-item';
    img.style.position = 'absolute';

    switch (item.type) { //나중에 위치 지정
      case '가구':
        img.style.top = '%';
        img.style.left = '%';
        break;
      case '장식':
        img.style.bottom = '%';
        img.style.left = '%';
        break;
      case '조형':
        img.style.bottom = '%';
        img.style.left = '%';
        break;
      case '기타':
        img.style.bottom = '%';
        img.style.left = '%';
        break;
    }

    characterArea.appendChild(img);

  });
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

import { authorizedFetch } from "../../utils/auth-fetch.js";
import { setCharacterImage } from "./character-area.js";

// 캐릭터 메인 UI 초기화
function initCharacterMainUI(statusData) {
  document.getElementById('level').textContent = statusData.level;
  document.getElementById('xpNow').textContent = statusData.exp;
  document.getElementById('xpMax').textContent = statusData.nextLevelExp;
  document.getElementById('mood').textContent = `기분 : ${statusData.mood}`;
  document.getElementById('progressBar').style.width = `${statusData.expPercentage}%`;
  document.getElementById('characterName').textContent = statusData.name;

  // 캐릭터 이미지 설정
  setCharacterImage(statusData.level);
}

// 이름 저장 함수
function saveName() {
  const input = document.getElementById('nameInput');
  const newName = input.value.trim();

  if (!newName) {
    alert('이름을 입력하세요.');
    return;
  }

  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    alert('로그인이 필요합니다.');
    window.location.href = '/login';
    return;
  }

  authorizedFetch('http://43.202.211.168:8080/api/pet/rename', {
    method: 'POST',
    body: JSON.stringify({ newName })
  })
    .then(res => {
      if (!res.ok) throw new Error('이름 변경 실패');
      return res.json();
    })
    .then(() => {
      document.getElementById('characterName').textContent = newName;
      document.getElementById('nameEditBox').style.display = 'none';
      input.value = '';
    });
}

// 이름 수정
function setupNameEditUI() {
  const nameBox = document.getElementById('nameEditBox');
  const editBtn = document.getElementById('editNameBtn');
  const saveBtn = document.getElementById('saveNameBtn');
  if (nameBox && editBtn) {
    nameBox.style.display = 'none';
    editBtn.addEventListener('click', () => {
      nameBox.style.display = 'flex';
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', saveName);
  }
}

// 캐릭터 상태 조회
async function loadCharacterStatus() {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    alert('로그인이 필요합니다.');
    window.location.href = '../pages/login.html';
    return;
  }

  const statusRes = await authorizedFetch('http://43.202.211.168:8080/api/pet/status');
  if (!statusRes.ok) throw new Error('캐릭터 상태 조회 실패');

  const response = await statusRes.json();
  const statusData = response.result || response.data || response;
  console.log("✅ 최종 statusData:", statusData);

  initCharacterMainUI(statusData);
}

// 경험치 추가
async function giveExpToPet(expAmount = 5) {
  const res = await authorizedFetch('http://43.202.211.168:8080/api/pet/add-exp', {
    method: 'POST',
    body: JSON.stringify({ exp: expAmount })
  });

  if (!res.ok) throw new Error('경험치 추가 실패');

  const response = await res.json();
  const statusData = response.result || response;
  initCharacterMainUI(statusData);
}

// // 캐릭터 영역 렌더링 후 초기화
// function loadCharacterArea() {
//   const characterAreaContainer = document.getElementById("character-area");
//   authorizedFetch("./character_area.html")
//     .then(res => res.text())
//     .then(html => {
//       characterAreaContainer.innerHTML = html;
//       requestAnimationFrame(() => {
//         initCharacter();
//       });
//     });
// }

// // 아이템 장착 렌더링
// async function initCharacter() {
//   const statusRes = await authorizedFetch('http://43.202.211.168:8080/api/pet/status');
//   const inventoryRes = await authorizedFetch('http://43.202.211.168:8080/api/item/inventory');

//   if (!statusRes.ok || !inventoryRes.ok) throw new Error("정보를 불러오지 못했습니다.");

//   const statusJson = await statusRes.json();
//   const inventoryJson = await inventoryRes.json();
//   const statusData = statusJson.result || statusJson;
//   const inventoryData = inventoryJson.data;

//   const characterArea = document.querySelector('.character-area');
//   characterArea.querySelectorAll('.equipped-item').forEach(el => el.remove());

//   inventoryData.filter(item => item.equipped).forEach(item => {
//     if (item.position === 'background') {
//       const bg = document.getElementById('bgImage');
//       if (bg) bg.src = item.imageUrl;
//       return;
//     }

//     const img = document.createElement('img');
//     img.src = item.imageUrl;
//     img.alt = item.name;
//     img.className = 'equipped-item';
//     img.style.position = 'absolute';

//     switch (item.type) {
//       case '가구':
//         img.style.top = '10%';
//         img.style.left = '45%';
//         break;
//       case '장식':
//         img.style.bottom = '20%';
//         img.style.left = '40%';
//         break;
//       case '조형':
//         img.style.bottom = '5%';
//         img.style.left = '42%';
//         break;
//       case '기타':
//         img.style.bottom = '5%';
//         img.style.left = '42%';
//         break;
//     }

//     characterArea.appendChild(img);
//   });
// }

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
  setupNameEditUI();
  loadCharacterStatus();
  loadCharacterArea();
});

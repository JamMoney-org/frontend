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

// 캐릭터 메인 UI 초기화
function initCharacterMainUI(statusData) {
  document.getElementById('level').textContent = statusData.level;
  document.getElementById('xpNow').textContent = statusData.exp;
  document.getElementById('xpMax').textContent = statusData.nextLevelExp;
  document.getElementById('mood').textContent = `기분 : ${statusData.mood}`;
  document.getElementById('progressBar').style.width = `${statusData.expPercentage}%`;
  document.getElementById('characterName').textContent = statusData.name;
}

// 이름 저장 함수
function saveName() {
  const input = document.getElementById('nameInput');
  const newName = input.value.trim();

  if (!newName) {
    showPopup('이름을 입력하세요.');
    return;
  }

  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    showPopup('로그인이 필요합니다.');
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
    showPopup('로그인이 필요합니다.');
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



// 장착 아이템 불러오기
async function loadEquippedItems() {
  const res = await authorizedFetch('http://43.202.211.168:8080/api/item/inventory');
  if (!res.ok) throw new Error('인벤토리 조회 실패');

  const response = await res.json();
  const inventory = response.result || response.data || response;

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
          objImg.style.width = '15%';
          break;
        case 'right':
          objImg.style.right = '7%';
          objImg.style.bottom = '30%';  
          objImg.style.width = '15%';
          break;
      }
      

      document.querySelector('.character-area').appendChild(objImg);
    }

  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupNameEditUI();
  loadCharacterStatus();
  loadEquippedItems();
});


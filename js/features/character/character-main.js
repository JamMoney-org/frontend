import { authorizedFetch } from "../../utils/auth-fetch.js";

//액자식 구성 ...
import { setCharacterImage } from "./character-area.js";

authorizedFetch("./character_area.html")
  .then(res => res.text())
  .then(html => {
    const area = document.getElementById("character-area");
    area.innerHTML = html;

    requestAnimationFrame(() => {
      const level = 1; 
      setCharacterImage(level);
    });
  });


//캐릭터 메인 페이지
function initCharacterMainUI(statusData) {
  document.getElementById('level').textContent = statusData.level;
  document.getElementById('xpNow').textContent = statusData.exp;
  document.getElementById('xpMax').textContent = statusData.nextLevelExp;
  document.getElementById('mood').textContent = `기분 : ${statusData.mood}`;
  document.getElementById('progressBar').style.width = `${statusData.expPercentage}%`;
  document.getElementById('characterName').textContent = statusData.name;

  const characterImg = document.getElementById('characterImage');
  if (characterImg && statusData.imageName) {
    characterImg.src = `../assets/images/${statusData.imageName}`;
  }
}

// 이름 수정
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
    })
}


// 수정 버튼 누르면 이름 수정창 보이기
document.addEventListener('DOMContentLoaded', () => {
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
});


// 페이지 로드 시 캐릭터 상태 불러오기
async function loadCharacterStatus() {

  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    alert('로그인이 필요합니다.');
    window.location.href = '../pages/login.html';
    return;
  }


  const statusRes = await authorizedFetch('http://43.202.211.168:8080/api/pet/status',
    {});

  if (!statusRes.ok) throw new Error('캐릭터 상태 조회 실패');
  const response = await statusRes.json();
  console.log("✅ response from status:", response);

  const statusData = response.result || response.data || response;
  console.log("✅ 최종 statusData:", statusData);


  initCharacterMainUI(statusData);

}

// 경험치 처리
async function giveExpToPet(expAmount = 5) {
  const accessToken = localStorage.getItem('accessToken');

  const res = await authorizedFetch('http://43.202.211.168:8080/api/pet/add-exp', {
    method: 'POST',
    body: JSON.stringify({ exp: expAmount })
  });

  if (!res.ok) throw new Error('경험치 추가 실패');

  const response = await res.json();
  const statusData = response.result || response;

  initCharacterMainUI(statusData); // 레벨, 경험치, 이미지 업데이트

}

document.addEventListener('DOMContentLoaded', loadCharacterStatus);
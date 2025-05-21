import { authorizedFetch } from "../../utils/auth-fetch.js";

function initCharacterMainUI(statusData) {
  document.getElementById('level').textContent = statusData.level;
  document.getElementById('xpNow').textContent = statusData.exp;
  document.getElementById('xpMax').textContent = statusData.nextLevelExp;
  document.getElementById('mood').textContent = `기분 : ${statusData.mood}`;
  document.getElementById('progressBar').style.width = `${statusData.expPercentage}%`;

  const characterImg = document.getElementById('characterImage');
  if (characterImg && statusData.imageName) {
    characterImg.src = `../assets/images/${statusData.imageName}`;
  }
}


// 이름 수정 저장
function saveName() {
  const input = document.getElementById('nameInput');
  const newName = input.value.trim();
  if (!newName) return alert('이름을 입력하세요.');

  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    alert('로그인이 필요합니다.');
    window.location.href = '/login';
    return;
  }

  authorizedFetch('http://43.202.211.168:8080/api/pet/rename', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ newName })
  })
    .then(res => {
      if (!res.ok) throw new Error('이름 변경 실패');
      return res.json();
    })
    .then(() => {
      document.getElementById('characterName').textContent = newName;
      document.getElementById('nameEditBox').style.display = 'none';

    })
    .catch(err => alert(err.message));
}

// 수정 버튼 누르면 이름 수정창 보이기
document.addEventListener('DOMContentLoaded', () => {
  const nameBox = document.getElementById('nameEditBox');
  const editBtn = document.getElementById('editNameBtn');

  if (nameBox && editBtn) {
    nameBox.style.display = 'none';
    editBtn.addEventListener('click', () => {
      nameBox.style.display = 'flex';
    });
  }
});

// 페이지 로드 시 캐릭터 상태 불러오기
async function loadCharacterStatus() {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      window.location.href = '/login';
      return;
    }

    const statusRes = await authorizedFetch('http://43.202.211.168:8080/api/pet/status', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!statusRes.ok) throw new Error('캐릭터 상태 조회 실패');
    const response = await statusRes.json();
    const statusData = response.result || response;

    initCharacterMainUI(statusData);
  } catch (err) {
    alert(err.message);
  }
}

// 경험치 처리
async function giveExpToPet(expAmount = 5) {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    alert('로그인이 필요합니다.');
    window.location.href = '/login';
    return;
  }

  try {
    const res = await authorizedFetch('http://43.202.211.168:8080/api/pet/add-exp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ exp: expAmount }) // 보낼 경험치
    });

    if (!res.ok) throw new Error('경험치 추가 실패');

    const response = await res.json();
    const statusData = response.result || response;

    // 기존 UI에 상태 반영
    initCharacterMainUI(statusData); // 레벨, 경험치, 이미지 업데이트
  } catch (err) {
    alert(err.message);
  }
}



document.addEventListener('DOMContentLoaded', loadCharacterStatus);

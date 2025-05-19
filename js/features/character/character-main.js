const mockStatusData = {
  level: 5,
  exp: 120,
  nextLevelExp: 150,
  expPercentage: 60,
  mood: "Happy",
  imageName: "../assets/images/character_egg.png"
};

// 캐릭터 상태 정보 UI 반영
function initCharacterMainUI(statusData) {
  document.getElementById('level').textContent = statusData.level;
  document.getElementById('xpNow').textContent = statusData.exp;
  document.getElementById('xpMax').textContent = statusData.nextLevelExp;
  document.getElementById('mood').textContent = `기분 : ${statusData.mood}`;
  document.getElementById('progressBar').style.width = `${statusData.expPercentage}%`;

  // 이미지도 함께 바꾸고 싶다면 아래도 추가
  const characterImg = document.getElementById('characterImage');
  if (characterImg && statusData.imageName) {
    characterImg.src = statusData.imageName;
  }
}

// 이름 수정 저장
function saveName() {
  const input = document.getEle
  mentById('nameInput');
  const newName = input.value.trim();
  if (!newName) return alert('이름을 입력하세요.');

  fetch('/api/pet/rename', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    // 테스트용 사용하려면 아래 fetch 부분을 주석 처리하고, mockData 적용
    // const statusRes = await fetch('/api/pet/status');
    // if (!statusRes.ok) throw new Error('캐릭터 상태 조회 실패');
    // const response = await statusRes.json();
    // const statusData = response.result || response;

    const statusData = mockStatusData; // <- 테스트용 적용
    initCharacterMainUI(statusData);
  } catch (err) {
    alert(err.message);
  }
}

document.addEventListener('DOMContentLoaded', loadCharacterStatus);

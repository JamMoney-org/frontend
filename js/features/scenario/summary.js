import { authorizedFetch } from '../../utils/auth-fetch.js';

(async function () {
  const scenario = JSON.parse(sessionStorage.getItem('scenarioData'));
  const scenarioId = scenario.scenarioId;

  const aiTip = document.getElementById('ai-loading-tip');
  const aiOverlay = document.getElementById('ai-loading-overlay');

  const reward = JSON.parse(sessionStorage.getItem('reward'));

  const titleEl = document.querySelector('.simul-title');
  const dialogueEl = document.querySelector('.dialogue-text');

  if (!scenarioId) {
    titleEl.textContent = '잘못된 접근입니다.';
    dialogueEl.textContent = '';
    return;
  }

  aiTip.classList.remove('hidden');
  aiOverlay.classList.remove('hidden');

  try {
    const res = await authorizedFetch(
      `http://43.202.211.168:8080/api/scenario/summary?scenarioId=${scenarioId}`,
      {
        method: 'POST',
      }
    );

    const data = await res.json();

    titleEl.textContent = scenario.title;
    dialogueEl.innerHTML = `
      <span class="highlight">${'⭐'.repeat(reward / 10)} ${
      scenario.title
    } 시뮬레이션 완료!</span><br />
      ${data.overallFeedback.replaceAll('\n', '<br />')}<br />
      <span class="highlight">+${reward} 가상 머니 지급</span>
    `;

    sessionStorage.removeItem('scenarioData');
    sessionStorage.removeItem('reward');
  } catch (e) {
    titleEl.textContent = '총평 요청에 실패했습니다.';
    dialogueEl.textContent =
      '총평 정보를 불러오는 데 문제가 발생했습니다. 다시 시도해 주세요.';
    console.error(e);
  } finally {
    aiTip.classList.add('hidden');
    aiOverlay.classList.add('hidden');
  }

  // 버튼 연결
  const buttons = document.querySelectorAll('.action-btn');
  buttons[0].addEventListener('click', () => {
    location.href = '/pages/scenario_category.html';
  });
  buttons[1].addEventListener('click', () => {
    location.href = '/pages/mainpage.html';
  });
})();

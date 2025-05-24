import { authorizedFetch } from '../../utils/auth-fetch.js';

(async function () {
  const scenario = JSON.parse(sessionStorage.getItem('scenarioData'));
  const scenarioId = scenario.scenarioId;

  const reward = JSON.parse(sessionStorage.getItem('reward'));

  const titleEl = document.querySelector('.simul-title');
  const dialogueEl = document.querySelector('.dialogue-text');

  if (!scenarioId) {
    titleEl.textContent = '잘못된 접근입니다.';
    dialogueEl.textContent = '';
    return;
  }

  try {
    const res = await authorizedFetch(
      `http://43.202.211.168:8080/api/scenario/summary?scenarioId=${scenarioId}`,
      {
        method: 'POST',
      }
    );

    let data = await res.json();
    data = {
      overallFeedback:
        '첫 월급 관리, 정말 잘 해내셨어요!\n저축의 중요성과 소비의 균형, 그리고 투자의 기초까지 스스로 판단하며 학습해낸 점이 인상적이었어요.\n앞으로도 급여를 받을 때마다 우선순위를 정하고, 계획적으로 활용해보세요.\n꾸준한 실천이 여러분의 재무 건강을 크게 바꿀 수 있어요. 👍',
    };
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

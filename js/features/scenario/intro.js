import { authorizedFetch } from '../../utils/auth-fetch.js';

(async function () {
  const params = new URLSearchParams(location.search);
  const scenarioId = Number(params.get('scenarioId'));

  if (!scenarioId) {
    document.querySelector('.simul-title').textContent = '잘못된 접근입니다.';
    return;
  }

  try {
    const res = await authorizedFetch(
      'http://43.202.211.168:8080/api/scenario/start',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      }
    );

    let scenario = await res.json();
    scenario = {
      scenarioId: 1,
      title: '첫 월급 관리하기',
      description: '첫 월급으로 무엇을 해야 할까요?',
      stepOrder: 1,
      aiMessage: '축하드려요! 첫 월급을 받았네요.\n어떻게 계획하고 싶으신가요?',
      choices: [
        {
          choiceId: 101,
          content: '저축부터 해야죠. 비상금 만들기!',
          feedback: '훌륭한 선택이에요! 비상금은 재정의 기본이에요.',
          isGood: true,
        },
        {
          choiceId: 102,
          content: '일단 사고 싶었던 게임기를 사야 해요.',
          feedback: '소비도 중요하지만 계획 없이 쓰면 후회할 수 있어요.',
          isGood: false,
        },
        {
          choiceId: 103,
          content: '투자에 관심이 많아요. 주식이나 펀드를 알아볼래요.',
          feedback:
            '관심은 좋은 시작이에요! 하지만 먼저 기초 재무 구조를 다져보는 건 어때요?',
          isGood: true,
        },
      ],
    };

    // 화면 구성
    document.querySelector('.simul-title').textContent = scenario.title;
    document.querySelector('.simul-card p').innerHTML = scenario.description
      .split('\n')
      .join('<br>');

    // 학습 화면에서 쓸 수 있도록 캐싱
    sessionStorage.setItem('scenarioData', JSON.stringify(scenario));
    sessionStorage.setItem('isFinalStep', JSON.stringify(false));

    document.querySelector('.start-btn').addEventListener('click', () => {
      location.href = `/pages/scenario_progress.html`;
    });
  } catch (e) {
    document.querySelector('.simul-title').textContent =
      '시나리오 시작에 실패했습니다.';
    console.error(e);
  }
})();

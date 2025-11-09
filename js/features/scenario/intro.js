import { authorizedFetch } from '../../utils/auth-fetch.js';

(async function () {
  const params = new URLSearchParams(location.search);
  const scenarioId = Number(params.get('scenarioId'));

  const aiTip = document.getElementById('ai-loading-tip');
  const aiOverlay = document.getElementById('ai-loading-overlay');

  if (!scenarioId) {
    document.querySelector('.simul-title').textContent = '잘못된 접근입니다.';
    return;
  }

  aiTip.classList.remove('hidden');
  aiOverlay.classList.remove('hidden');

  try {
    const res = await authorizedFetch(
      'https://jm-money.com/api/scenario/start',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      }
    );

    const scenario = await res.json();

    document.querySelector('.title').textContent = scenario.title;
    document.querySelector('.desc').innerHTML = scenario.description
      .split('\n')
      .join('<br>');

    sessionStorage.setItem('scenarioData', JSON.stringify(scenario));

    document.querySelector('.start-btn').addEventListener('click', () => {
      location.href = `/pages/scenario/scenario_progress.html`;
    });
  } catch (e) {
    document.querySelector('.simul-title').textContent =
      '시나리오 시작에 실패했습니다.';
    console.error(e);
  } finally {
    aiTip.classList.add('hidden');
    aiOverlay.classList.add('hidden');
  }
})();

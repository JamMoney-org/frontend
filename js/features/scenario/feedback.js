import { authorizedFetch } from '../../utils/auth-fetch.js';

const headerTitle = document.querySelector('.main-content header span');
const dialogueTextEl = document.querySelector('.dialogue-text');
const nextBtn = document.querySelector('.next-btn');

(async function () {
  const params = new URLSearchParams(location.search);
  const choiceId = Number(params.get('choiceId'));

  const scenario = JSON.parse(sessionStorage.getItem('scenarioData'));
  const scenarioId = scenario.scenarioId;
  const stepOrder = scenario.stepOrder;

  nextBtn.disabled = true;
  nextBtn.classList.add('loading-btn');

  // 텍스트를 "질문 생성 중..."에서 물결 효과로 변환
  const loadingText = '질문 생성 중...';
  nextBtn.innerHTML = `<span class="wavy-text">${[...loadingText]
    .map((ch) => `<span>${ch}</span>`)
    .join('')}</span>`;

  if (!choiceId || !scenario) {
    dialogueTextEl.textContent =
      '필수 정보가 없습니다. 처음부터 다시 시작해 주세요.';
    return;
  }

  const selectedChoice = scenario.choices.find(
    (choice) => choice.choiceId === choiceId
  );

  headerTitle.textContent = scenario.title;
  dialogueTextEl.textContent = selectedChoice.feedback;

  try {
    const res = await authorizedFetch(
      'http://43.202.211.168:8080/api/scenario/next',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          selectedChoice: selectedChoice.content,
          currentStep: stepOrder,
        }),
      }
    );

    const data = await res.json();

    if (!data.finalStep) {
      scenario.stepOrder = data.stepOrder;
      scenario.aiMessage = data.aiMessage;
      scenario.choices = data.choices;

      sessionStorage.setItem('scenarioData', JSON.stringify(scenario));
      nextBtn.innerHTML = '다음';
    } else {
      nextBtn.innerHTML = '총평 보러가기';
    }

    nextBtn.classList.remove('loading-btn');
    nextBtn.disabled = false;

    nextBtn.addEventListener('click', () => {
      if (data.finalStep) {
        location.href = `/pages/scenario_summary.html`;
      } else {
        location.href = `/pages/scenario_progress.html`;
      }
    });
  } catch (error) {
    console.error('피드백 로딩 실패:', error);
    dialogueTextEl.textContent =
      '피드백을 불러오는 데 실패했습니다. 다시 시도해 주세요.';
  }
})();

import { authorizedFetch } from '../../utils/auth-fetch.js';

const titleEl = document.querySelector('.simul-title');
const dialogueTextEl = document.querySelector('.dialogue-text');
const nextBtn = document.querySelector('.next-btn');

(async function () {
  const params = new URLSearchParams(location.search);
  const choiceId = Number(params.get('choiceId'));

  const scenario = JSON.parse(sessionStorage.getItem('scenarioData'));
  const scenarioId = scenario.scenarioId;
  const stepOrder = scenario.stepOrder;

  if (!scenario) {
    dialogueTextEl.textContent =
      '필수 정보가 없습니다. 처음부터 다시 시작해 주세요.';
    return;
  }
  const selectedChoice = scenario.choices.find(
    (choice) => choice.choiceId === choiceId
  );

  titleEl.textContent = scenario.title;
  dialogueTextEl.textContent = selectedChoice.feedback;

  const isFinal = JSON.parse(sessionStorage.getItem('isFinalStep'));
  if (isFinal) {
    nextBtn.addEventListener('click', () => {
      sessionStorage.removeItem('isFinalStep');
      location.href = `/pages/scenario_summary.html`;
    });
    return;
  }

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

    let data = await res.json();

    data = {
      scenarioId: 1,
      stepOrder: 2,
      aiMessage: '좋아요! 그럼 월급의 몇 퍼센트를 저축할 계획인가요?',
      choices: [
        {
          choiceId: 201,
          content: '50% 이상 저축할래요.',
          feedback: '멋진 목표예요! 하지만 생활비도 고려해보세요.',
          isGood: true,
        },
        {
          choiceId: 202,
          content: '30% 정도면 적당하지 않을까요?',
          feedback: '현실적인 계획이에요. 꾸준한 저축이 중요하죠!',
          isGood: true,
        },
        {
          choiceId: 203,
          content: '다 쓰고 남으면 저축하죠 뭐.',
          feedback:
            '그건 조금 위험할 수 있어요. 먼저 저축하고 남은 돈을 쓰는 습관을 들여보세요.',
          isGood: false,
        },
      ],
      isFinalStep: true,
    };

    nextBtn.addEventListener('click', () => {
      scenario.stepOrder = data.stepOrder;
      scenario.aiMessage = data.aiMessage;
      scenario.choices = data.choices;

      sessionStorage.setItem('scenarioData', JSON.stringify(scenario));
      sessionStorage.setItem('isFinalStep', JSON.stringify(data.isFinalStep));

      location.href = `/pages/scenario_progress.html`;
    });
  } catch (error) {
    console.error('피드백 로딩 실패:', error);
    dialogueTextEl.textContent =
      '피드백을 불러오는 데 실패했습니다. 다시 시도해 주세요.';
  }
})();

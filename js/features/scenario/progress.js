const headerTitle = document.querySelector('.main-content header span');
const titleEl = document.querySelector('.simul-title');
const characterNameEl = document.querySelector('.character-name');
const dialogueTextEl = document.querySelector('.dialogue-text');
const choicesEl = document.querySelector('.choices');

(function () {
  const scenario = JSON.parse(sessionStorage.getItem('scenarioData'));

  if (!scenario) {
    dialogueTextEl.textContent =
      '시나리오 정보가 없습니다. 처음부터 다시 시작해 주세요.';
    return;
  }

  headerTitle.textContent = scenario.title;

  dialogueTextEl.textContent = scenario.aiMessage;

  choicesEl.innerHTML = '';
  scenario.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.innerHTML = `
    <span class="num">${idx + 1}</span>
    <span class="label">${choice.content}</span>
  `;
    btn.addEventListener('click', () => {
      location.href = `/pages/scenario/scenario_feedback.html?choiceId=${choice.choiceId}`;
    });
    choicesEl.appendChild(btn);
  });
})();

import { authorizedFetch } from "../../utils/auth-fetch.js";

(async function () {
  const scenario = JSON.parse(sessionStorage.getItem("scenarioData"));
  const scenarioId = scenario.scenarioId;

  const aiTip = document.getElementById("ai-loading-tip");
  const aiOverlay = document.getElementById("ai-loading-overlay");

  const reward = JSON.parse(sessionStorage.getItem("reward"));

  const headerTitle = document.querySelector(".main-content header span");
  const dialogueEl = document.querySelector(".dialogue-summary");

  if (!scenarioId) {
    dialogueEl.textContent = "";
    return;
  }

  headerTitle.textContent = scenario.title;

  aiTip.classList.remove("hidden");
  aiOverlay.classList.remove("hidden");

  try {
    const res = await authorizedFetch(
      `https://jm-money.com/api/scenario/summary?scenarioId=${scenarioId}`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    dialogueEl.innerHTML = `
      <span class="highlight">${"⭐".repeat(reward / 10)} ${
      scenario.title
    } 시뮬레이션 완료!</span><br /><br />
      ${data.overallFeedback.replaceAll("\n", "<br />")}<br /><br />
      <span class="highlight">+${reward} 경험치 획득!⚡</span>
    `;
  } catch (e) {
    dialogueEl.textContent =
      "총평 정보를 불러오는 데 문제가 발생했습니다. 다시 시도해 주세요.";
    console.error(e);
  } finally {
    aiTip.classList.add("hidden");
    aiOverlay.classList.add("hidden");
  }

  // 버튼 연결
  const buttons = document.querySelectorAll(".action-btn");
  buttons[0].addEventListener("click", () => {
    location.href = "/pages/scenario_category.html";
    sessionStorage.removeItem("scenarioData");
    sessionStorage.removeItem("reward");
  });
  buttons[1].addEventListener("click", () => {
    location.href = "/pages/mainpage.html";
    sessionStorage.removeItem("scenarioData");
    sessionStorage.removeItem("reward");
  });
})();

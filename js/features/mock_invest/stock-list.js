import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const stockList = document.querySelector(".stock-list");
  const hotList = document.createElement("ul");
  const favoriteList = document.createElement("ul");
  hotList.id = "hot-stock-list";
  favoriteList.id = "favorite-stock-list";
  favoriteList.style.display = "none";
  stockList.appendChild(hotList);
  stockList.appendChild(favoriteList);

  const interestingCompanyIds = new Set();
  let companies = [];

  const logoMap = {
    셀트리온:
      "https://jammoney.s3.ap-northeast-2.amazonaws.com/e7063746-c45b-45fb-916c-850cee8b7284-CELLTRION.jpg",
    현대: "https://jammoney.s3.ap-northeast-2.amazonaws.com/67737ced-76c8-4ace-bd1a-21ab9c906665-HYUNDAI.jpg",
    카카오:
      "https://jammoney.s3.ap-northeast-2.amazonaws.com/eb36ca89-9587-43a4-b583-d9a7d0036864-KAKAO.png",
    기아: "https://jammoney.s3.ap-northeast-2.amazonaws.com/2d06c34e-4828-4a59-bd17-8684107cd545-KIA.png",
    LG: "https://jammoney.s3.ap-northeast-2.amazonaws.com/726139a8-1c9b-4c05-9f69-e196464f9277-LG.png",
    네이버:
      "https://jammoney.s3.ap-northeast-2.amazonaws.com/75950a2d-c8f2-450d-9dea-1fbb20cdff0c-NAVER.png",
    NAVER:
      "https://jammoney.s3.ap-northeast-2.amazonaws.com/75950a2d-c8f2-450d-9dea-1fbb20cdff0c-NAVER.png",
    포스코:
      "https://jammoney.s3.ap-northeast-2.amazonaws.com/565d2588-56ba-4351-8a4f-89e585094f47-POSCO.png",
    POSCO:
      "https://jammoney.s3.ap-northeast-2.amazonaws.com/565d2588-56ba-4351-8a4f-89e585094f47-POSCO.png",
    SK: "https://jammoney.s3.ap-northeast-2.amazonaws.com/669909bd-847a-49f2-8a8b-be07d5c4f1c0-SK.png",
    삼성: "https://jammoney.s3.ap-northeast-2.amazonaws.com/2b6bffc5-3f2f-400f-8333-9dee7f442275-SAMSUNG.png",
  };

  function getCompanyLogo(korName) {
    for (const key in logoMap) {
      if (korName.includes(key)) return logoMap[key];
    }
    return "../assets/images/default.png";
  }

  function createHeartButton(companyId) {
    const heart = document.createElement("img");
    heart.className = "heart-icon";
    heart.style.width = "18px";
    heart.style.cursor = "pointer";

    const updateHeart = () => {
      heart.src = interestingCompanyIds.has(companyId)
        ? "../assets/icon/heart-fill.svg"
        : "../assets/icon/heart.svg";
    };

    updateHeart();

    heart.addEventListener("click", async (e) => {
      e.stopPropagation();
      const isInterested = interestingCompanyIds.has(companyId);
      const method = isInterested ? "DELETE" : "POST";
      const url = `http://43.202.211.168:8080/api/interestingStocks?companyId=${companyId}`;
      const res = await authorizedFetch(url, { method });
      if (res.ok) {
        isInterested
          ? interestingCompanyIds.delete(companyId)
          : interestingCompanyIds.add(companyId);
        updateHeart();
        renderFavoriteList();
      }
    });

    return heart;
  }

  function createStockListItem(company) {
    const { companyId, code, korName, stockInfoResponseDto } = company;
    const currentPrice = Number(stockInfoResponseDto?.stck_prpr);
    const fluctuationAmount = Number(stockInfoResponseDto?.prdy_vrss);
    const fluctuationRate = Number(stockInfoResponseDto?.prdy_ctrt);

    const li = document.createElement("li");
    li.addEventListener("click", () => {
      window.location.href = `mock_invest.html?companyId=${companyId}&companyCode=${code}`;
    });

    const img = document.createElement("img");
    img.src = getCompanyLogo(korName);
    img.alt = korName;
    img.style.width = "40px";
    img.style.marginRight = "8px";

    const infoDiv = document.createElement("div");
    infoDiv.style.display = "flex";
    infoDiv.style.flexDirection = "column";
    infoDiv.style.gap = "4px";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = korName;
    nameSpan.style.fontWeight = "500";

    const priceSpan = document.createElement("span");
    priceSpan.textContent = !isNaN(currentPrice)
      ? `${currentPrice.toLocaleString()}원`
      : "가격 정보 없음";

    const changeRow = document.createElement("span");
    const changeAmount = document.createElement("span");
    const changeRate = document.createElement("span");

    const isPlus = fluctuationAmount > 0;
    const isMinus = fluctuationAmount < 0;
    const sign = isPlus ? "+" : "";

    changeAmount.textContent = !isNaN(fluctuationAmount)
      ? `${sign}${fluctuationAmount.toLocaleString()}원`
      : "-";
    changeRate.textContent = !isNaN(fluctuationRate)
      ? ` (${sign}${fluctuationRate}%)`
      : "";

    const color = isPlus ? "red" : isMinus ? "blue" : "black";
    changeAmount.style.color = color;
    changeRate.style.color = color;

    changeRow.appendChild(changeAmount);
    changeRow.appendChild(changeRate);

    infoDiv.appendChild(nameSpan);
    infoDiv.appendChild(priceSpan);
    infoDiv.appendChild(changeRow);

    li.appendChild(img);
    li.appendChild(infoDiv);
    li.appendChild(createHeartButton(companyId));

    return li;
  }

  function renderCompanyList(container, data) {
    container.innerHTML = "";
    data.forEach((company) => {
      const li = createStockListItem(company);
      container.appendChild(li);
    });
  }

  function renderFavoriteList() {
    const filtered = companies.filter((c) =>
      interestingCompanyIds.has(c.companyId)
    );
    renderCompanyList(favoriteList, filtered);
  }

  try {
    const res = await authorizedFetch(
      "http://43.202.211.168:8080/api/interestingStocks"
    );
    if (res.ok) {
      const interestList = await res.json();
      interestList.forEach((item) => {
        if (item.companyResponseDto?.companyId) {
          interestingCompanyIds.add(item.companyResponseDto.companyId);
        }
      });
    }
  } catch (e) {
    console.error("관심 종목 불러오기 실패:", e);
  }

  try {
    const res = await authorizedFetch("http://43.202.211.168:8080/api/company");
    if (!res.ok) throw new Error("회사 목록 로드 실패");
    companies = await res.json();
    renderCompanyList(hotList, companies);
    renderFavoriteList();
  } catch (err) {
    console.error("회사 목록 로딩 실패:", err);
  }

  document.querySelectorAll(".stock-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".stock-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const isFavorite = tab.dataset.tab === "favorite";
      hotList.style.display = isFavorite ? "none" : "block";
      favoriteList.style.display = isFavorite ? "block" : "none";
    });
  });

  // 공룡 요소
  const dinoSpeechElem = document.getElementById("dinoSpeech");
  const dinoImg = document.getElementById("dinoImage");

  try {
    const res = await authorizedFetch(
      "http://43.202.211.168:8080/api/portfolio"
    );
    if (!res.ok) throw new Error("포트폴리오 로드 실패");

    const data = await res.json();
    const {
      nickname,
      totalAsset,
      profitAmount,
      profitRate,
      stockAsset,
      money,
    } = data;

    const assetTitle = document.getElementById("assetTitle");
    const assetValue = document.getElementById("totalAsset");
    const stockAssetSpan = document.getElementById("stockAsset");
    const cashBalanceSpan = document.getElementById("cashBalance");
    const profitAmountSpan = document.getElementById("profitAmount");
    const profitRateSpan = document.getElementById("profitRate");

    const isProfit = profitAmount > 0;
    const isLoss = profitAmount < 0;
    const sign = isProfit ? "+" : isLoss ? "-" : "";
    const absProfit = Math.abs(profitAmount);
    const absRate = Math.abs(profitRate).toFixed(2);

    if (assetTitle) {
      assetTitle.innerHTML = `<span class="nickname">${nickname}</span>님의 총 자산`;
    }

    if (assetValue) assetValue.textContent = `${totalAsset.toLocaleString()}원`;

    if (stockAssetSpan)
      stockAssetSpan.textContent = stockAsset.toLocaleString();
    if (cashBalanceSpan) cashBalanceSpan.textContent = money.toLocaleString();

    if (profitAmountSpan) {
      profitAmountSpan.textContent = `${sign}${absProfit.toLocaleString()}원`;
      profitAmountSpan.style.color = isProfit
        ? "red"
        : isLoss
        ? "blue"
        : "gray";
    }

    if (profitRateSpan) {
      profitRateSpan.textContent = `(${sign}${absRate}%)`;
      profitRateSpan.style.color = isProfit ? "red" : isLoss ? "blue" : "gray";
    }

    if (dinoSpeechElem) {
      dinoSpeechElem.textContent = getDinoMessage(profitAmount);
      dinoSpeechElem.classList.add("talk-bounce");
    }

    if (dinoImg) {
      if (isProfit) dinoImg.src = "../assets/images/dino-happy.png";
      else if (isLoss) dinoImg.src = "../assets/images/dino-sad.png";
      else dinoImg.src = "../assets/images/dino-happy.png";
    }
  } catch (error) {
    console.error("포트폴리오 정보 로딩 실패:", error);
  }

  function getDinoMessage(profitAmount) {
    if (profitAmount > 0) {
      return pickRandom([
        "이야~ 수익 났네! 🔺 잘하고 있어!",
        "공룡이 춤춘다~ 너의 수익 덕분이야 💃",
        "이대로만 가면 공룡 펀드매니저 되는 거 아냐?",
        "돈이 들어오고 있어! 넌 이미 투자 고수! 💸",
        "수익은 너의 발자국! 계속 걸어가자! 🦕",
        "계좌에 햇살이 쏟아지고 있어! ☀️",
      ]);
    } else if (profitAmount < 0) {
      return pickRandom([
        "으악... 조금 떨어졌네 🥲",
        "공룡도 그런 날 있어. 흔들리지 마!",
        "손실은 배우는 과정! 다음엔 더 잘할 수 있어",
        "잠시 숨 고르는 중! 다시 날아오를 거야 🦖",
        "시장님이 시련을 주셨지만 넌 강해 💪",
        "공룡도 가끔 넘어지지만, 다시 일어나지!",
      ]);
    } else {
      return pickRandom([
        "지금은 본전! 기회는 곧 올 거야 🔍",
        "움직임은 없지만, 그것도 전략이야 🧘",
        "조용할 땐 공부하는 시간이야!",
        "바람이 불지 않을 땐, 방향을 가다듬는 거야 🍃",
        "지금은 휴식! 다음 파도를 기다려보자 🌊",
        "공룡도 멈출 땐 이유가 있어! 지금은 준비 중!",
      ]);
    }
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
});

document.querySelector(".portfolio-btn").addEventListener("click", () => {
  window.location.href = "../pages/portfolio.html";
});

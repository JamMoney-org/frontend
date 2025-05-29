import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const stockListContainer = document.querySelector(".stock-list ul");
  const interestingCompanyIds = new Set();

  // 🔹 회사 로고 매핑
  const logoMap = {
    "CELLTRION": "https://jammoney.s3.ap-northeast-2.amazonaws.com/e7063746-c45b-45fb-916c-850cee8b7284-CELLTRION.jpg",
    "HYUNDAI": "https://jammoney.s3.ap-northeast-2.amazonaws.com/67737ced-76c8-4ace-bd1a-21ab9c906665-HYUNDAI.jpg",
    "KAKAO": "https://jammoney.s3.ap-northeast-2.amazonaws.com/eb36ca89-9587-43a4-b583-d9a7d0036864-KAKAO.png",
    "KIA": "https://jammoney.s3.ap-northeast-2.amazonaws.com/2d06c34e-4828-4a59-bd17-8684107cd545-KIA.png",
    "LG": "https://jammoney.s3.ap-northeast-2.amazonaws.com/726139a8-1c9b-4c05-9f69-e196464f9277-LG.png",
    "NAVER": "https://jammoney.s3.ap-northeast-2.amazonaws.com/75950a2d-c8f2-450d-9dea-1fbb20cdff0c-NAVER.png",
    "POSCO": "https://jammoney.s3.ap-northeast-2.amazonaws.com/565d2588-56ba-4351-8a4f-89e585094f47-POSCO.png",
    "SK": "https://jammoney.s3.ap-northeast-2.amazonaws.com/669909bd-847a-49f2-8a8b-be07d5c4f1c0-SK.png"
  };

  // 🔸 관심 종목 불러오기
  try {
    const interestRes = await authorizedFetch("http://43.202.211.168:8080/api/interestingStocks");
    if (interestRes.ok) {
      const interestList = await interestRes.json();
      interestList.forEach(item => {
        if (item.companyResponseDto?.companyId) {
          interestingCompanyIds.add(item.companyResponseDto.companyId);
        }
      });
    }
  } catch (e) {
    console.error("❌ 관심 종목 불러오기 실패:", e);
  }

  // 🔸 하트 버튼 생성 함수
  function createHeartButton(companyId) {
    const heart = document.createElement("img");
    heart.className = "heart-icon";
    heart.style.width = "18px";
    heart.style.cursor = "pointer";
    heart.style.marginLeft = "auto";

    const updateHeartImage = () => {
      const isInterested = interestingCompanyIds.has(companyId);
      heart.src = isInterested
        ? "../assets/icon/heart-fill.svg"
        : "../assets/icon/heart.svg";
    };

    updateHeartImage();

    heart.addEventListener("click", async (e) => {
      e.stopPropagation();

      const isInterestedNow = interestingCompanyIds.has(companyId);
      const method = isInterestedNow ? "DELETE" : "POST";
      const url = `http://43.202.211.168:8080/api/interestingStocks?companyId=${companyId}`;

      try {
        const res = await authorizedFetch(url, { method });
        if (res.ok) {
          if (isInterestedNow) {
            interestingCompanyIds.delete(companyId);
          } else {
            interestingCompanyIds.add(companyId);
          }
          updateHeartImage();
        }
      } catch (err) {
        console.error("❌ 관심 종목 처리 중 에러:", err);
      }
    });

    return heart;
  }

  // 🔸 주식 리스트 불러오기
  try {
    const response = await authorizedFetch("http://43.202.211.168:8080/api/company");
    if (!response.ok) throw new Error("회사 목록 로드 실패");

    const companies = await response.json();
    stockListContainer.innerHTML = "";

    companies.forEach((company) => {
      const { companyId, code, korName, engName, stockInfoResponseDto } = company;

      const currentPrice = Number(stockInfoResponseDto?.stck_prpr);
      const fluctuationAmount = Number(stockInfoResponseDto?.prdy_vrss);
      const fluctuationRate = Number(stockInfoResponseDto?.prdy_ctrt);

      const li = document.createElement("li");
      li.style.cursor = "pointer";
      li.style.alignItems = "center";
      li.addEventListener("click", () => {
        window.location.href = `mock_invest.html?companyId=${companyId}&companyCode=${code}`;
      });

      const img = document.createElement("img");
      const upperEng = engName?.toUpperCase();
      img.src = logoMap[upperEng] || "../assets/images/default.png";
      img.alt = korName;
      img.style.width = "40px";
      img.style.marginRight = "8px";

      const infoDiv = document.createElement("div");
      infoDiv.style.display = "flex";
      infoDiv.style.flexDirection = "column";
      infoDiv.style.gap = "4px";

      const nameSpan = document.createElement("span");
      nameSpan.textContent = korName;
      nameSpan.style.color = "black";
      nameSpan.style.fontWeight = "500";

      const priceSpan = document.createElement("span");
      priceSpan.textContent = !isNaN(currentPrice)
        ? `${currentPrice.toLocaleString()}원`
        : "가격 정보 없음";
      priceSpan.style.fontSize = "0.9em";
      priceSpan.style.fontWeight = "400";
      priceSpan.style.color = "black";

      const changeRow = document.createElement("span");
      changeRow.style.display = "inline";
      changeRow.style.fontSize = "0.9em";

      const changeAmount = document.createElement("span");
      const changeRate = document.createElement("span");

      const isPlus = fluctuationAmount > 0;
      const isMinus = fluctuationAmount < 0;
      const sign = isPlus ? '+' : '';

      changeAmount.textContent = !isNaN(fluctuationAmount)
        ? `${sign}${fluctuationAmount.toLocaleString()}원`
        : "-";
      changeRate.textContent = !isNaN(fluctuationRate)
        ? ` (${sign}${fluctuationRate}%)`
        : "";

      const changeColor = isPlus ? "red" : isMinus ? "blue" : "black";
      changeAmount.style.color = changeColor;
      changeRate.style.color = changeColor;

      changeRow.appendChild(changeAmount);
      changeRow.appendChild(changeRate);

      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(priceSpan);
      infoDiv.appendChild(changeRow);

      li.appendChild(img);
      li.appendChild(infoDiv);
      li.appendChild(createHeartButton(companyId));

      stockListContainer.appendChild(li);
    });
  } catch (error) {
    console.error("주식 리스트 로딩 실패:", error);
    stockListContainer.innerHTML = "<li>주식 데이터를 불러오지 못했습니다.</li>";
  }

  // 🔸 포트폴리오 정보 불러오기
  try {
    const res = await authorizedFetch("http://43.202.211.168:8080/api/portfolio");
    if (!res.ok) throw new Error("포트폴리오 로드 실패");
    const data = await res.json();

    const { totalAsset, profitAmount, profitRate } = data;

    const assetValue = document.querySelector(".asset-value");
    const profitText = document.querySelector(".profit");
    const dailyRate = document.querySelector(".daily-rate");
    const dailyProfit = document.querySelector(".daily-profit");

    const isProfit = profitAmount > 0;
    const sign = isProfit ? "+" : profitAmount < 0 ? "-" : "";
    const absProfit = Math.abs(profitAmount);

    assetValue.textContent = `${totalAsset.toLocaleString()}원`;
    profitText.textContent = `${sign}${absProfit.toLocaleString()}원 (${sign}${Math.abs(profitRate)}%)`;
    profitText.style.color = isProfit ? "red" : profitAmount < 0 ? "blue" : "black";

    dailyRate.textContent = `당일 수익률: ${sign}${Math.abs(profitRate)}%`;
    dailyProfit.textContent = `당일 손익금액: ${sign}${absProfit.toLocaleString()}원`;
  } catch (error) {
    console.error("포트폴리오 정보 로딩 실패:", error);
  }
});

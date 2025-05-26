import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const stockListContainer = document.querySelector(".stock-list ul");
  const interestingCompanyIds = new Set();

  // 🔸 관심 종목 불러오기
  try {
    const interestRes = await authorizedFetch("http://43.202.211.168:8080/api/interestingStocks");
    if (interestRes.ok) {
      const interestList = await interestRes.json();
      console.log("✅ 관심 종목 로딩 성공:", interestList);

      interestList.forEach(item => {
        if (item.companyResponseDto?.companyId) {
          interestingCompanyIds.add(item.companyResponseDto.companyId);
        }
      });

      console.log("📌 관심 종목 ID 목록:", Array.from(interestingCompanyIds));
    } else {
      console.warn("⚠️ 관심 종목 응답 실패:", interestRes.status);
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
      console.log(`🔄 회사 ID ${companyId} 하트 상태: ${isInterested ? "ON" : "OFF"}`);
    };

    updateHeartImage();

    heart.addEventListener("click", async (e) => {
      e.stopPropagation(); // li 클릭 막기

      const isInterestedNow = interestingCompanyIds.has(companyId);
      const method = isInterestedNow ? "DELETE" : "POST";
      const url = `http://43.202.211.168:8080/api/interestingStocks?companyId=${companyId}`;

      console.log(`🛠️ ${method} 요청 → ${url}`);

      try {
        const res = await authorizedFetch(url, { method });
        if (res.ok) {
          if (isInterestedNow) {
            interestingCompanyIds.delete(companyId);
            console.log(`❎ 회사 ${companyId} 관심 종목 해제`);
          } else {
            interestingCompanyIds.add(companyId);
            console.log(`✅ 회사 ${companyId} 관심 종목 등록`);
          }
          updateHeartImage();
        } else {
          console.warn(`⚠️ 요청 실패: ${res.status}`);
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
      const { companyId, code, korName, stockInfoResponseDto } = company;

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
      img.src = "../assets/images/default.png";
      img.alt = korName;

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

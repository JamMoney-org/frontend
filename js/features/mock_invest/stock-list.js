import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 주식 리스트 불러오기
  const stockListContainer = document.querySelector(".stock-list ul");

  try {
    const response = await authorizedFetch("http://43.202.211.168:8080/api/company");
    if (!response.ok) throw new Error("회사 목록 로드 실패");

    const companies = await response.json();
    stockListContainer.innerHTML = "";

    companies.forEach((company) => {
      const { companyId, korName, stockInfoResponseDto } = company;

      const currentPrice = Number(stockInfoResponseDto?.stck_prpr);
      const fluctuationAmount = Number(stockInfoResponseDto?.prdy_vrss);
      const fluctuationRate = Number(stockInfoResponseDto?.prdy_ctrt);

      const li = document.createElement("li");
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        window.location.href = `mock_invest.html?companyId=${companyId}`;
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

      changeAmount.style.fontSize = "0.9em";
      changeRate.style.fontSize = "0.9em";

      changeRow.appendChild(changeAmount);
      changeRow.appendChild(changeRate);

      infoDiv.appendChild(nameSpan);
      infoDiv.appendChild(priceSpan);
      infoDiv.appendChild(changeRow);

      li.appendChild(img);
      li.appendChild(infoDiv);
      stockListContainer.appendChild(li);
    });
  } catch (error) {
    console.error("주식 리스트 로딩 실패:", error);
    stockListContainer.innerHTML = "<li>주식 데이터를 불러오지 못했습니다.</li>";
  }

  // investment-card 정보 불러오기
  try {
    const res = await authorizedFetch("http://43.202.211.168:8080/api/portfolio");
    if (!res.ok) throw new Error("포트폴리오 로드 실패");
    const data = await res.json();

    const {
      totalAsset,
      profitAmount,
      profitRate,
    } = data;

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

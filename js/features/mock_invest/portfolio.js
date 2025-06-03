// portfolio.js
import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const totalEvaluation = document.getElementById("totalEvaluation");
  const totalProfitRate = document.getElementById("totalProfitRate");
  const availableCash = document.getElementById("availableCash");
  const chartContainer = document.getElementById("portfolioChart");
  const holdingList = document.getElementById("holdingList");

  try {
    const res = await authorizedFetch(
      "http://43.202.211.168:8080/api/order/holdingStocks"
    );
    if (!res.ok) throw new Error("보유 주식 불러오기 실패");
    const stocks = await res.json();

    let totalEval = 0;
    let totalProfit = 0;
    let totalInvest = 0;

    // 테스트용 임의 데이터 추가
    stocks.push({
      companyId: 999,
      companyKorName: "테스트전자",
      stockCount: 3,
      currentPrice: 50000,
      evaluationAmount: 150000,
      totalPrice: 120000,
      profitAmount: 30000,
      profitRate: 25.0,
      portfolioRatio: 40.0,
      reserveSellStockCount: 1,
    });
    ``;

    stocks.forEach((stock) => {
      totalEval += stock.evaluationAmount;
      totalProfit += stock.profitAmount;
      totalInvest += stock.totalPrice;
    });

    const labels = [];
    const data = [];

    stocks.forEach((stock) => {
      const ratio =
        totalEval === 0 ? 0 : (stock.evaluationAmount / totalEval) * 100;
      labels.push(stock.companyKorName);
      data.push(Number(ratio.toFixed(2)));

      const card = document.createElement("div");
      card.className = "stock-item";
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        window.location.href = `../pages/mock_invest.html?companyId=${stock.companyId}`;
      });

      card.innerHTML = `
        <div class="stock-info">
          <div class="company-name">${stock.companyKorName}</div>
          <div class="buy-info">매수: ${stock.totalPrice.toLocaleString()}원</div>
        </div>
        <div class="stock-meta">
          <div class="eval-amount">${stock.evaluationAmount.toLocaleString()}원</div>
          <div class="stock-count">${stock.stockCount}주</div>
          <div class="profit-rate ${
            stock.profitAmount >= 0 ? "plus" : "minus"
          }">
            ${
              stock.profitAmount >= 0 ? "+" : ""
            }${stock.profitAmount.toLocaleString()}원
            (${stock.profitRate.toFixed(2)}%)
          </div>
          <div class="reserve-info">예약 매도: ${
            stock.reserveSellStockCount
          }주</div>
        </div>
      `;
      holdingList.appendChild(card);
    });

    totalEvaluation.textContent = `${totalEval.toLocaleString()}원`;
    const totalRate = totalInvest === 0 ? 0 : (totalProfit / totalInvest) * 100;
    totalProfitRate.textContent = `${
      totalProfit >= 0 ? "+" : ""
    }${totalProfit.toLocaleString()}원 (${totalRate.toFixed(2)}%)`;
    if (availableCash) {
      availableCash.textContent = `${(totalEval + 0).toLocaleString()}원`;
    }

    // 비중 파이차트 렌더링
    if (chartContainer && typeof Chart !== "undefined") {
      const canvas = document.createElement("canvas");
      canvas.style.maxHeight = "160px";
      canvas.style.maxWidth = "160px";
      canvas.style.margin = "0 auto";
      chartContainer.appendChild(canvas);
      new Chart(canvas, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "자산 비중",
              data: data,
              backgroundColor: [
                "#5DC29E", // 400
                "#B2E8CF", // 200
                "#29A07A", // 500
                "#80D5B4", // 300
                "#1A8162", // 600
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            tooltip: {
              callbacks: {
                label: function (ctx) {
                  return `${ctx.label}: ${ctx.raw.toFixed(2)}%`;
                },
              },
            },
          },
        },
      });
    }
  } catch (err) {
    console.error("보유 주식 조회 실패:", err);
  }
});

// portfolio.js
import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const totalEvaluation = document.getElementById("totalEvaluation");
  const totalProfitRate = document.getElementById("totalProfitRate");
  const availableCash = document.getElementById("availableCash");
  const chartContainer = document.getElementById("portfolioChart");
  const holdingList = document.getElementById("holdingList");

  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabButtons.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));

      btn.classList.add("active");
      document.getElementById(`${target}-tab`).classList.add("active");
    });
  });

  try {
    const res = await authorizedFetch(
      "http://43.202.211.168:8080/api/order/holdingStocks"
    );
    if (!res.ok) throw new Error("보유 주식 불러오기 실패");
    const stocks = await res.json();

    let totalEval = 0;
    let totalProfit = 0;
    let totalInvest = 0;

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

    const waitingOrderList = document.getElementById("waitingOrderList");

    // 예약 주문 정보 받아오기
    const waitingRes = await authorizedFetch(
      "http://43.202.211.168:8080/api/order/waiting"
    );
    if (!waitingRes.ok) throw new Error("예약 주문 불러오기 실패");
    const waitingOrders = await waitingRes.json();

    // 예약 주문 렌더링
    waitingOrders.forEach((order) => {
      const orderCard = document.createElement("div");
      orderCard.className = "stock-item";

      orderCard.innerHTML = `
      <div class="stock-info">
        <div class="company-name">${order.companyKorName}</div>
        <div class="buy-info">${
          order.orderType === "BUY" ? "매수 예약" : "매도 예약"
        }</div>
      </div>
      <div class="stock-meta">
        <div class="eval-amount">${order.price.toLocaleString()}원</div>
        <div class="stock-count">${order.stockCount}주</div>
        <div class="reserve-info">${new Date(
          order.modifiedAt
        ).toLocaleString()}</div>
        <button class="cancel-btn" data-id="${order.orderId}" data-count="${
        order.stockCount
      }" style="margin-top: 8px;">예약 취소</button>
      </div>
    `;

      waitingOrderList.appendChild(orderCard);
    });

    waitingOrderList.addEventListener("click", async (e) => {
      if (!e.target.classList.contains("cancel-btn")) return;

      const btn = e.target;
      const orderId = btn.dataset.id;
      const stockCount = btn.dataset.count;

      const confirmed = await showConfirmModal(
        "이 예약 주문을 취소하시겠습니까?"
      );
      if (!confirmed) return;

      try {
        const res = await authorizedFetch(
          `http://43.202.211.168:8080/api/order/orders?stockOrderId=${orderId}&stockCount=${stockCount}`,
          {
            method: "DELETE",
          }
        );

        if (res.ok) {
          btn.closest(".stock-item")?.remove();
          showToast("예약 주문이 취소되었습니다.");
        } else {
          showError("삭제 실패: 서버 오류");
        }
      } catch (err) {
        console.error("취소 중 오류:", err);
        showError("취소 실패: 네트워크 오류");
      }
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
      canvas.style.maxHeight = "200px";
      canvas.style.height = "120px";
      canvas.style.maxWidth = "350px";
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
                "#5DC29E",
                "#B2E8CF",
                "#29A07A",
                "#80D5B4",
                "#1A8162",
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
              display: true,
              position: "right",
              labels: {
                filter: (item) => item.index < 3,
                boxWidth: 12,
                font: {
                  size: 10,
                },
                padding: 8,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(2)}%`,
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

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000); // 2초 후 자동 사라짐
}

function showError(message) {
  const errorModal = document.getElementById("error-modal");
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorModal.style.display = "flex";
}

function showConfirmModal(message) {
  return new Promise((resolve) => {
    let modal = document.getElementById("confirm-modal");

    const messageEl = document.getElementById("confirm-message");
    const cancelBtn = document.getElementById("confirm-cancel");
    const okBtn = document.getElementById("confirm-ok");

    messageEl.textContent = message;
    modal.style.display = "flex";

    const cleanup = () => {
      modal.style.display = "none";
      cancelBtn.onclick = null;
      okBtn.onclick = null;
    };

    cancelBtn.onclick = () => {
      cleanup();
      resolve(false);
    };

    okBtn.onclick = () => {
      cleanup();
      resolve(true);
    };
  });
}

import { authorizedFetch } from "../../utils/auth-fetch.js";

let priceInterval;

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const companyId = params.get("companyId");
  const companyCode = params.get("companyCode");

  if (!companyId || !companyCode) {
    showError("잘못된 접근입니다.");
    return;
  }

  let availableCash = 0;

  try {
    const portfolioRes = await authorizedFetch(
      "http://43.202.211.168:8080/api/portfolio"
    );
    if (!portfolioRes.ok) throw new Error("포트폴리오 로딩 실패");

    const portfolioData = await portfolioRes.json();
    availableCash = portfolioData.money;
  } catch (e) {
    console.error("현금 정보 불러오기 실패:", e);
    availableCash = 0;
  }

  const orderButtons = document.querySelectorAll(".order-button");
  const priceLabel = document.querySelector(".price-display .label");
  const quantityLabel = document.querySelector(".quantity .label");
  const tradeButton = document.querySelector(".trade-btn");
  const priceTextDiv = document.getElementById("price");
  const quantityDisplay = document.getElementById("quantityDisplay");
  const totalAmount = document.getElementById("totalAmount");
  const increaseBtn = document.getElementById("increaseBtn");
  const decreaseBtn = document.getElementById("decreaseBtn");
  const percentButtons = document.querySelectorAll(".quantity-buttons button");
  const orderHistoryContainer = document.querySelector(".order-history");

  let limitPriceInput = document.getElementById("limitPriceInput");
  if (!limitPriceInput) {
    limitPriceInput = document.createElement("input");
    limitPriceInput.type = "number";
    limitPriceInput.id = "limitPriceInput";
    limitPriceInput.placeholder = "지정가 입력";
    limitPriceInput.min = 1;
    limitPriceInput.style.marginTop = "10px";
    limitPriceInput.style.padding = "8px";
    limitPriceInput.style.width = "100%";
    limitPriceInput.style.display = "none";
    priceTextDiv?.parentElement?.appendChild(limitPriceInput);
  }

  let priceChangeTimer = null;

  limitPriceInput.addEventListener("input", () => {
    const input = limitPriceInput.value;
    const numberInputPrice = parseInt(input, 10);

    if (isNaN(numberInputPrice) || numberInputPrice <= 0) return;

    if (priceChangeTimer !== null) clearTimeout(priceChangeTimer);

    // 자동 보정: 호가 간격 기준
    if (
      typeof priceInterval === "number" &&
      numberInputPrice % priceInterval !== 0
    ) {
      priceChangeTimer = setTimeout(() => {
        const remainder = numberInputPrice % priceInterval;
        const corrected = numberInputPrice - remainder;
        limitPriceInput.value = corrected;
        updateTotal();

        showToast(
          `${corrected.toLocaleString()}원 단위로 자동 보정되었습니다.`
        );
      }, 1500);
    }
  });

  limitPriceInput.addEventListener("focus", () => {
    const isMarket =
      document.querySelector('input[name="priceType"]:checked')?.value ===
      "market";
    if (isMarket) return; // 시장가일 때는 아무것도 하지 않음

    const limitRadio = document.querySelector(
      'input[name="priceType"][value="limit"]'
    );
    if (limitRadio) limitRadio.checked = true;

    priceTextDiv.style.display = "none";
    limitPriceInput.style.display = "block";
  });

  const modal = document.createElement("div");
  modal.id = "confirm-modal";
  Object.assign(modal.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "none",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  });
  modal.innerHTML = `
  <div style="background:white;padding:24px;border-radius:12px;text-align:center;width:280px">
    <h3 id="modal-title"></h3>
    <p id="modal-price" style="margin-top: 10px"></p>
    <p id="modal-total"></p>
    <div style="margin-top:20px">
      <button id="modal-cancel" style="
        margin-right: 12px;
        padding: 6px 14px;
        background: #ccc;
        color: white;
        border: none;
        border-radius: 6px;">
        취소
      </button>
      <button id="modal-confirm" style="
        padding: 6px 14px;
        background: #51B291;
        color: white;
        border: none;
        border-radius: 6px;">
        확인
      </button>
    </div>
  </div>`;

  document.body.appendChild(modal);

  const errorModal = document.createElement("div");
  errorModal.id = "error-modal";
  Object.assign(errorModal.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "none",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  });
  errorModal.innerHTML = `
    <div style="background:white;padding:24px;border-radius:12px;text-align:center;width:280px">
      <p id="error-message" style="margin-bottom:20px;font-weight:500"></p>
      <button id="error-close" style="padding:6px 14px;background:#51B291;color:white;border:none;border-radius:6px">확인</button>
    </div>`;
  document.body.appendChild(errorModal);
  document.getElementById("error-close").onclick = () => {
    errorModal.style.display = "none";
  };

  const successModal = document.createElement("div");
  successModal.id = "success-modal";
  Object.assign(successModal.style, {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "none",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1001,
  });
  successModal.innerHTML = `
    <div style="background:white;padding:24px;border-radius:12px;text-align:center;width:280px">
      <p id="success-message" style="margin-bottom:20px;font-weight:500">주문이 완료되었습니다.</p>
      <button id="success-close" style="padding:6px 14px;background:#51B291;color:white;border:none;border-radius:6px">확인</button>
    </div>`;
  document.body.appendChild(successModal);
  document.getElementById("success-close").onclick = () => {
    successModal.style.display = "none";
  };

  let firstValidBid = null;
  let quantity = 0;

  function updateTotal() {
    const isMarket =
      document.querySelector('input[name="priceType"]:checked')?.value ===
      "market";
    const rawPrice = isMarket
      ? Number(firstValidBid || 0)
      : Number(limitPriceInput?.value) || 0;
    const price = Math.max(rawPrice, 0);
    const total = quantity * price;
    quantityDisplay.textContent = `${quantity} 주`;
    totalAmount.textContent = `${total.toLocaleString()}원`;
    return { price, total };
  }

  increaseBtn?.addEventListener("click", () => {
    quantity++;
    updateTotal();
  });
  decreaseBtn?.addEventListener("click", () => {
    if (quantity > 0) quantity--;
    updateTotal();
  });

  percentButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const percent = Number(btn.dataset.percent);
      const isMarket =
        document.querySelector('input[name="priceType"]:checked')?.value ===
        "market";
      const price = isMarket
        ? Number(firstValidBid || 0)
        : Number(limitPriceInput?.value) || 0;

      if (price > 0 && availableCash > 0) {
        const budget = (availableCash * percent) / 100;
        quantity = Math.floor(budget / price);

        if (quantity <= 0) {
          showToast(`${percent}% 금액으로는 1주도 살 수 없습니다.`);
          return;
        }

        updateTotal();
      } else {
        document.getElementById("error-message").textContent =
          price <= 0 ? "가격 정보를 확인하세요." : "보유 현금이 없습니다.";
        errorModal.style.display = "flex";
      }
    });
  });

  orderButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      orderButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const type = btn.textContent.trim();
      priceLabel.textContent = type === "판매" ? "판매할 가격" : "구매할 가격";
      quantityLabel.textContent = type === "판매" ? "판매수량" : "구매수량";
      tradeButton.textContent = type === "판매" ? "판매하기" : "구매하기";
    });
  });

  orderButtons[0].click();

  document.querySelectorAll('input[name="priceType"]').forEach((input) => {
    input.addEventListener("change", () => {
      const selected = document.querySelector(
        'input[name="priceType"]:checked'
      );
      if (!selected) return;

      if (selected.value === "market") {
        // 시장가 UI 활성화
        priceTextDiv.style.display = "block";
        limitPriceInput.style.display = "none";
        priceTextDiv.textContent = `시장가 주문: ${Number(
          firstValidBid || 0
        ).toLocaleString()}원`;
      } else {
        // 지정가 UI 활성화
        priceTextDiv.style.display = "none";
        limitPriceInput.style.display = "block";
      }

      updateTotal();
    });
  });

  try {
    const res = await authorizedFetch(
      `http://43.202.211.168:8080/api/company/${companyId}`
    );
    if (!res.ok) throw new Error("호가 정보 로드 실패");

    const { stockAskingPriceResponseDto: data } = await res.json();

    const priceListContainer = document.querySelector(".price-list");
    priceListContainer.innerHTML = "";

    for (let i = 10; i >= 1; i--) {
      const askPrice = data[`askp${i}`];
      const askQty = data[`askp_rsqn${i}`];
      const bidPrice = data[`bidp${i}`];
      const bidQty = data[`bidp_rsqn${i}`];

      const askHTML =
        askPrice && askQty
          ? `<div class="ask">
            <span>${Number(askPrice).toLocaleString()}</span>
            <span class="price-qty">${Number(askQty).toLocaleString()}</span>
          </div>`
          : `<div class="ask"><span>-</span><span class="price-qty">0</span></div>`;

      const bidHTML =
        bidPrice && bidQty
          ? `<div class="bid">
            <span>${Number(bidPrice).toLocaleString()}</span>
            <span class="price-qty">${Number(bidQty).toLocaleString()}</span>
          </div>`
          : `<div class="bid"><span>-</span><span class="price-qty">0</span></div>`;

      priceListContainer.innerHTML += `
        <div class="price-row">
          ${askHTML}
          ${bidHTML}
        </div>`;
    }

    // 호가 간격 추출
    const askp1 = Number(data.askp1);
    const askp2 = Number(data.askp2);
    priceInterval = askp2 - askp1;

    for (let i = 10; i >= 1; i--) {
      const price = data[`askp${i}`],
        qty = data[`askp_rsqn${i}`];
      if (price && qty) {
        const item = document.createElement("div");
        item.className = "price-item red fade-in";
        item.innerHTML = `${Number(
          price
        ).toLocaleString()} <span class="percent">${Number(
          qty
        ).toLocaleString()}</span>`;
        priceListContainer.appendChild(item);
      }
    }

    for (let i = 1; i <= 10; i++) {
      const bidPrice = data[`bidp${i}`];
      if (bidPrice) {
        firstValidBid = bidPrice;
        const selected = document.createElement("div");
        selected.className = "price-item selected fade-in";
        selected.innerHTML = `${Number(
          bidPrice
        ).toLocaleString()} <span class="percent">선택</span>`;
        priceListContainer.appendChild(selected);

        initializeMarketOrderUI();
        break;
      }
    }

    for (let i = 1; i <= 10; i++) {
      const price = data[`bidp${i}`],
        qty = data[`bidp_rsqn${i}`];
      if (price && qty) {
        const item = document.createElement("div");
        item.className = "price-item blue fade-in";
        item.innerHTML = `${Number(
          price
        ).toLocaleString()} <span class="percent">${Number(
          qty
        ).toLocaleString()}</span>`;
        priceListContainer.appendChild(item);
      }
    }

    /*호가를 클릭해서 가격을 설정하는 코드 부분*/
    priceListContainer.addEventListener("click", (e) => {
      const target = e.target.closest(".price-item");
      if (!target) return;

      const priceText = target.textContent
        .trim()
        .split(" ")[0]
        .replace(/,/g, "");

      const limitRadio = document.querySelector(
        'input[name="priceType"][value="limit"]'
      );
      if (limitRadio) {
        limitRadio.checked = true;

        priceTextDiv.style.display = "none";
        limitPriceInput.style.display = "block";
      }

      limitPriceInput.value = priceText;
      updateTotal();
    });
  } catch (error) {
    console.error("호가 정보 로딩 실패:", error);
    document.querySelector(".price-list").innerHTML =
      "<div class='price-item'>호가 정보를 불러올 수 없습니다.</div>";
  }

  tradeButton?.addEventListener("click", () => {
    const isBuy =
      document.querySelector(".order-button.active")?.textContent.trim() ===
      "구매";
    if (quantity <= 0) {
      document.getElementById("error-message").textContent =
        "수량을 선택해주세요.";
      errorModal.style.display = "flex";
      return;
    }

    const isMarket =
      document.querySelector('input[name="priceType"]:checked')?.value ===
      "market";
    let price;

    if (isMarket) {
      price = Number(firstValidBid || 0);
    } else {
      const rawPrice = limitPriceInput?.value;
      if (!rawPrice || isNaN(rawPrice) || Number(rawPrice) <= 0) {
        document.getElementById("error-message").textContent =
          "지정가를 올바르게 입력해주세요.";
        errorModal.style.display = "flex";
        return;
      }
      price = Number(rawPrice);
    }

    const { total } = updateTotal();

    document.getElementById("modal-title").textContent = `${
      isBuy ? "구매" : "판매"
    } ${quantity}주`;
    document.getElementById(
      "modal-price"
    ).textContent = `1주 희망 가격 ${price.toLocaleString()}원`;
    document.getElementById(
      "modal-total"
    ).textContent = `총 주문 가격 ${total.toLocaleString()}원`;
    modal.style.display = "flex";

    document.getElementById("modal-cancel").onclick = () => {
      modal.style.display = "none";
    };

    document.getElementById("modal-confirm").onclick = async () => {
      modal.style.display = "none";
      const endpoint = isBuy
        ? "http://43.202.211.168:8080/api/order/buy"
        : "http://43.202.211.168:8080/api/order/sell";

      try {
        const params = new URLSearchParams();
        params.append("companyId", companyId);
        params.append("price", price);
        params.append("stockCount", quantity);

        const bodyString = params.toString();

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: bodyString,
        });

        if (!response.ok) {
          try {
            const errorData = await response.json();
            document.getElementById("error-message").textContent =
              errorData.message || "알 수 없는 오류가 발생했습니다.";
          } catch {
            document.getElementById("error-message").textContent =
              "주문 중 알 수 없는 오류가 발생했습니다.";
          }
          errorModal.style.display = "flex";
          return;
        }

        const result = await response.json();
        const confirmedQty = quantity;
        quantity = 0;
        limitPriceInput.value = "";
        updateTotal();

        const entry = document.createElement("div");
        entry.className = "order-entry fade-in";
        entry.innerHTML = `${new Date().toLocaleTimeString()} - ${
          isBuy ? "매수" : "매도"
        } ${confirmedQty}주 @ ${price.toLocaleString()}원`;
        orderHistoryContainer?.prepend(entry);

        successModal.style.display = "flex";
      } catch (err) {
        console.error("주문 오류:", err);
        document.getElementById("error-message").textContent =
          "주문 처리 중 네트워크 오류가 발생했습니다.";
        errorModal.style.display = "flex";
      }
    };
  });

  function initializeMarketOrderUI() {
    const marketRadio = document.querySelector(
      'input[name="priceType"][value="market"]'
    );
    if (marketRadio) marketRadio.checked = true;

    priceTextDiv.style.display = "block";
    limitPriceInput.style.display = "none";

    priceTextDiv.textContent = `시장가 주문: ${Number(
      firstValidBid || 0
    ).toLocaleString()}원`;

    quantity = 0;
    quantityDisplay.textContent = "0 주";
    totalAmount.textContent = "0원";
  }
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

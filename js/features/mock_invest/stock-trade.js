import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const savedCompany = JSON.parse(localStorage.getItem("selectedCompany"));
  const companyId = savedCompany?.companyId;
  const companyCode = savedCompany?.code;

  if (!companyId || !companyCode) {
    alert("잘못된 접근입니다.");
    return;
  }

  const orderButtons = document.querySelectorAll(".order-button");
  const priceLabel = document.querySelector(".price-display .label");
  const quantityLabel = document.querySelector(".quantity .label");
  const tradeButton = document.querySelector(".trade-button");
  const priceTextDiv = document.getElementById("price");
  const quantityDisplay = document.getElementById("quantityDisplay");
  const totalAmount = document.getElementById("totalAmount");
  const increaseBtn = document.getElementById("increaseBtn");
  const decreaseBtn = document.getElementById("decreaseBtn");
  const percentButtons = document.querySelectorAll(".quantity-percent button");
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
    priceTextDiv?.parentElement?.appendChild(limitPriceInput);
  }

  limitPriceInput.addEventListener("focus", () => {
    const limitRadio = document.querySelector('input[name="priceType"][value="limit"]');
    if (limitRadio) limitRadio.checked = true;
    priceTextDiv.style.display = "none";
    limitPriceInput.style.display = "block";
  });

  const modal = document.createElement("div");
  modal.id = "confirm-modal";
  Object.assign(modal.style, {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)", display: "none", justifyContent: "center",
    alignItems: "center", zIndex: 1000
  });
  modal.innerHTML = `
    <div style="background:white;padding:24px;border-radius:12px;text-align:center;width:280px">
      <h3 id="modal-title"></h3>
      <p id="modal-price"></p>
      <p id="modal-total"></p>
      <div style="margin-top:12px">
        <button id="modal-cancel" style="margin-right:12px">취소</button>
        <button id="modal-confirm">확인</button>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const errorModal = document.createElement("div");
  errorModal.id = "error-modal";
  Object.assign(errorModal.style, {
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)", display: "none", justifyContent: "center",
    alignItems: "center", zIndex: 1001
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
    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)", display: "none", justifyContent: "center",
    alignItems: "center", zIndex: 1001
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
    const isMarket = document.querySelector('input[name="priceType"]:checked')?.value === "market";
    const rawPrice = isMarket ? Number(firstValidBid || 0) : Number(limitPriceInput?.value) || 0;
    const price = Math.max(rawPrice, 0);
    const total = quantity * price;
    quantityDisplay.textContent = `${quantity} 주`;
    totalAmount.textContent = `${total.toLocaleString()}원`;
    return { price, total };
  }

  increaseBtn?.addEventListener("click", () => { quantity++; updateTotal(); });
  decreaseBtn?.addEventListener("click", () => { if (quantity > 0) quantity--; updateTotal(); });

  percentButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const percent = Number(btn.dataset.percent);
      const maxAffordable = 1000000;
      const isMarket = document.querySelector('input[name="priceType"]:checked')?.value === "market";
      const price = isMarket ? Number(firstValidBid || 0) : Number(limitPriceInput?.value) || 0;
      if (price > 0) {
        quantity = Math.floor((maxAffordable * percent / 100) / price);
        updateTotal();
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
      if (input.value === "market") {
        priceTextDiv.style.display = "block";
        limitPriceInput.style.display = "none";
        priceTextDiv.textContent = `시장가 주문: ${Number(firstValidBid || 0).toLocaleString()}원`;
      } else {
        priceTextDiv.style.display = "none";
        limitPriceInput.style.display = "block";
        limitPriceInput.value = "";
      }
      updateTotal();
    });
  });

  try {
    const res = await authorizedFetch(`http://43.202.211.168:8080/api/company/${companyId}`);
    if (!res.ok) throw new Error("호가 정보 로드 실패");

    const { stockAskingPriceResponseDto: data } = await res.json();
    const priceListContainer = document.querySelector(".price-list");
    priceListContainer.innerHTML = "";

    for (let i = 10; i >= 1; i--) {
      const price = data[`askp${i}`], qty = data[`askp_rsqn${i}`];
      if (price && qty) {
        const item = document.createElement("div");
        item.className = "price-item red fade-in";
        item.innerHTML = `${Number(price).toLocaleString()} <span class="percent">${Number(qty).toLocaleString()}</span>`;
        priceListContainer.appendChild(item);
      }
    }

    for (let i = 1; i <= 10; i++) {
      const bidPrice = data[`bidp${i}`];
      if (bidPrice) {
        firstValidBid = bidPrice;
        const selected = document.createElement("div");
        selected.className = "price-item selected fade-in";
        selected.innerHTML = `${Number(bidPrice).toLocaleString()} <span class="percent">선택</span>`;
        priceListContainer.appendChild(selected);
        break;
      }
    }

    for (let i = 1; i <= 10; i++) {
      const price = data[`bidp${i}`], qty = data[`bidp_rsqn${i}`];
      if (price && qty) {
        const item = document.createElement("div");
        item.className = "price-item blue fade-in";
        item.innerHTML = `${Number(price).toLocaleString()} <span class="percent">${Number(qty).toLocaleString()}</span>`;
        priceListContainer.appendChild(item);
      }
    }

    priceListContainer.addEventListener("click", (e) => {
      const target = e.target.closest(".price-item");
      if (!target) return;
      const priceText = target.textContent.trim().split(" ")[0].replace(/,/g, "");
      const limitRadio = document.querySelector('input[name="priceType"][value="limit"]');
      if (limitRadio) limitRadio.checked = true;
      priceTextDiv.style.display = "none";
      limitPriceInput.style.display = "block";
      limitPriceInput.value = priceText;
      updateTotal();
    });
  } catch (error) {
    console.error("호가 정보 로딩 실패:", error);
    document.querySelector(".price-list").innerHTML =
      "<div class='price-item'>호가 정보를 불러올 수 없습니다.</div>";
  }

  tradeButton?.addEventListener("click", () => {
    const isBuy = document.querySelector(".order-button.active")?.textContent.trim() === "구매";
    if (quantity <= 0) {
      document.getElementById("error-message").textContent = "수량을 선택해주세요.";
      errorModal.style.display = "flex";
      return;
    }

    const isMarket = document.querySelector('input[name="priceType"]:checked')?.value === "market";
    let price;

    if (isMarket) {
      price = Number(firstValidBid || 0);
    } else {
      const rawPrice = limitPriceInput?.value;
      if (!rawPrice || isNaN(rawPrice) || Number(rawPrice) <= 0) {
        document.getElementById("error-message").textContent = "지정가를 올바르게 입력해주세요.";
        errorModal.style.display = "flex";
        return;
      }
      price = Number(rawPrice);
    }

    const { total } = updateTotal();

    document.getElementById("modal-title").textContent = `${isBuy ? "구매" : "판매"} ${quantity}주`;
    document.getElementById("modal-price").textContent = `1주 희망 가격 ${price.toLocaleString()}원`;
    document.getElementById("modal-total").textContent = `총 주문 가격 ${total.toLocaleString()}원`;
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
            document.getElementById("error-message").textContent = errorData.message || "알 수 없는 오류가 발생했습니다.";
          } catch {
            document.getElementById("error-message").textContent = "주문 중 알 수 없는 오류가 발생했습니다.";
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
        entry.innerHTML = `${new Date().toLocaleTimeString()} - ${isBuy ? "매수" : "매도"} ${confirmedQty}주 @ ${price.toLocaleString()}원`;
        orderHistoryContainer?.prepend(entry);

        successModal.style.display = "flex";
      } catch (err) {
        console.error("주문 오류:", err);
        document.getElementById("error-message").textContent = "주문 처리 중 네트워크 오류가 발생했습니다.";
        errorModal.style.display = "flex";
      }
    };
  });
});

import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const savedCompany = JSON.parse(localStorage.getItem("selectedCompany"));
  const companyId = savedCompany?.companyId;
  const companyCode = savedCompany?.code;

  if (!companyId || !companyCode) {
    alert("잘못된 접근입니다.");
    return;
  }

  console.log("✅ 요청 companyId:", companyId);

  const orderButtons = document.querySelectorAll(".order-button");
  const priceLabel = document.querySelector(".price-display .label");
  const quantityLabel = document.querySelector(".quantity .label");
  const tradeButton = document.querySelector(".trade-button");
  const priceTextDiv = document.getElementById("price");
  const limitPriceInput = document.getElementById("limitPriceInput");

  orderButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      orderButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const type = btn.textContent.trim();
      if (type === "판매") {
        priceLabel.textContent = "판매할 가격";
        quantityLabel.textContent = "판매수량";
        tradeButton.textContent = "판매하기";
      } else {
        priceLabel.textContent = "구매할 가격";
        quantityLabel.textContent = "구매수량";
        tradeButton.textContent = "구매하기";
      }
    });
  });

  let quantity = 0;
  const quantityDisplay = document.getElementById("quantityDisplay");
  const totalAmount = document.getElementById("totalAmount");
  const increaseBtn = document.getElementById("increaseBtn");
  const decreaseBtn = document.getElementById("decreaseBtn");

  function updateTotal() {
    const isMarket = document.querySelector('input[name="priceType"]:checked')?.value === "market";
    const price = isMarket ? 0 : parseInt(limitPriceInput?.value) || 0;
    const total = quantity * price;
    if (quantityDisplay) quantityDisplay.textContent = `${quantity} 주`;
    if (totalAmount) totalAmount.textContent = `${total.toLocaleString()}원`;
  }

  increaseBtn?.addEventListener("click", () => {
    quantity++;
    updateTotal();
  });

  decreaseBtn?.addEventListener("click", () => {
    if (quantity > 0) {
      quantity--;
      updateTotal();
    }
  });

  document.querySelectorAll('input[name="priceType"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (input.value === "market") {
        if (priceTextDiv) priceTextDiv.style.display = "block";
        if (limitPriceInput) limitPriceInput.style.display = "none";
        if (priceTextDiv) priceTextDiv.textContent = "시장가로 주문";
      } else {
        if (priceTextDiv) priceTextDiv.style.display = "none";
        if (limitPriceInput) {
          limitPriceInput.style.display = "block";
          limitPriceInput.value = "";
        }
      }
      updateTotal();
    });
  });

  try {
    const res = await authorizedFetch(`http://43.202.211.168:8080/api/company/${companyId}`);
    if (!res.ok) throw new Error("호가 정보 로드 실패");

    const companyData = await res.json();
    const data = companyData.stockAskingPriceResponseDto;

    console.log("✅ 호가 응답 데이터:", data);

    const priceListContainer = document.querySelector(".price-list");
    priceListContainer.innerHTML = "";

    for (let i = 10; i >= 1; i--) {
      const askPrice = data[`askp${i}`];
      const askQty = data[`askp_rsqn${i}`];
      if (askPrice && askQty) {
        const item = document.createElement("div");
        item.className = "price-item red";
        item.innerHTML = `${Number(askPrice).toLocaleString()} <span class="percent">${Number(askQty).toLocaleString()}</span>`;
        priceListContainer.appendChild(item);
      }
    }

    let firstValidBid = null;
    for (let i = 1; i <= 10; i++) {
      const bidPrice = data[`bidp${i}`];
      if (bidPrice) {
        firstValidBid = bidPrice;
        break;
      }
    }
    if (firstValidBid) {
      const selected = document.createElement("div");
      selected.className = "price-item selected";
      selected.innerHTML = `${Number(firstValidBid).toLocaleString()} <span class="percent">선택</span>`;
      priceListContainer.appendChild(selected);
    }

    for (let i = 1; i <= 10; i++) {
      const bidPrice = data[`bidp${i}`];
      const bidQty = data[`bidp_rsqn${i}`];
      if (bidPrice && bidQty) {
        const item = document.createElement("div");
        item.className = "price-item blue";
        item.innerHTML = `${Number(bidPrice).toLocaleString()} <span class="percent">${Number(bidQty).toLocaleString()}</span>`;
        priceListContainer.appendChild(item);
      }
    }

    priceListContainer.addEventListener("click", (e) => {
      const target = e.target.closest(".price-item");
      if (!target) return;

      const priceText = target.textContent.trim().split(" ")[0].replace(/,/g, "");
      const limitRadio = document.querySelector('input[name="priceType"][value="limit"]');
      if (limitRadio) limitRadio.checked = true;
      if (priceTextDiv) priceTextDiv.style.display = "none";
      if (limitPriceInput) {
        limitPriceInput.style.display = "block";
        limitPriceInput.value = priceText;
      }
      updateTotal();
    });
  } catch (error) {
    console.error("호가 정보 로딩 실패:", error);
    document.querySelector(".price-list").innerHTML =
      "<div class='price-item'>호가 정보를 불러올 수 없습니다.</div>";
  }

  tradeButton?.addEventListener("click", async () => {
    const isBuy = document.querySelector(".order-button.active")?.textContent.trim() === "구매";
    if (quantity <= 0) {
      alert("수량을 선택해주세요.");
      return;
    }

    const isMarket = document.querySelector('input[name="priceType"]:checked')?.value === "market";
    const price = isMarket ? 0 : parseInt(limitPriceInput?.value);

    if (!isMarket && (!price || price <= 0)) {
      alert("지정가를 올바르게 입력해주세요.");
      return;
    }

    const endpoint = isBuy
      ? "http://43.202.211.168:8080/api/order/buy"
      : "http://43.202.211.168:8080/api/order/sell";

    try {
      const params = new URLSearchParams();
      params.append("companyId", companyId);
      params.append("price", price);
      params.append("stockCount", quantity);

      const response = await authorizedFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
      });

      if (!response.ok) throw new Error("주문 실패");

      const result = await response.json();
      alert("주문이 완료되었습니다.");
      console.log("주문 결과:", result);
    } catch (err) {
      console.error("주문 오류:", err);
      alert("주문 중 오류가 발생했습니다.");
    }
  });
});
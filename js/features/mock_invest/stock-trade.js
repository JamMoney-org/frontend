import { authorizedFetch } from "../../utils/auth-fetch.js";

document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const companyId = urlParams.get("companyId");
  const companyCode = urlParams.get("companyCode"); // 🔹 추가된 부분

  if (!companyId || !companyCode) {
    alert("잘못된 접근입니다.");
    return;
  }

  try {
    const res = await authorizedFetch(`http://43.202.211.168:8080/api/company/${companyId}`);
    if (!res.ok) throw new Error("호가 정보 로드 실패");
    const companyData = await res.json();
    const data = companyData.stockAskingPriceResponseDto;

    const priceListContainer = document.querySelector(".price-list");
    priceListContainer.innerHTML = "";

    // 매도 호가 (10~1)
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

    // 현재가 강조 (bidp1 기준)
    const selected = document.createElement("div");
    selected.className = "price-item selected";
    selected.innerHTML = `${Number(data.bidp1).toLocaleString()} <span class="percent">선택</span>`;
    priceListContainer.appendChild(selected);

    // 매수 호가 (1~10)
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

    // 이후 주문 요청 등에서 companyCode 사용할 수 있음
    console.log("회사 코드:", companyCode);

  } catch (error) {
    console.error("호가 정보 로딩 실패:", error);
    document.querySelector(".price-list").innerHTML = "<div class='price-item'>호가 정보를 불러올 수 없습니다.</div>";
  }
});

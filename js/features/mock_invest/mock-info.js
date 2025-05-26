import { authorizedFetch } from '../../utils/auth-fetch.js';

let companyData = null;
let chartData = null;

const setValue = (label, value) => {
  const el = document.querySelector(`td[data-label="${label}"]`);
  if (el) el.textContent = value ?? '-';
};

// 상단 가격 및 이름 렌더링
function renderHeader() {
  const stockInfo = companyData.stockInfoResponseDto;
  const price = Number(stockInfo.stck_prpr);
  const diff = Number(stockInfo.prdy_vrss);
  const diffPercent = Number(stockInfo.prdy_ctrt).toFixed(2);

  document.querySelector('.company-name').innerHTML = `
    ${companyData.korName} <img src="../assets/icon/search.svg" alt="" />
  `;
  document.querySelector(
    '.current-price'
  ).textContent = `${price.toLocaleString()}원`;
  document.querySelector('.price-change').innerHTML = `
    어제보다 <span class="${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">
      ${diff >= 0 ? '+' : ''}${diff.toLocaleString()} (${diffPercent}%)
    </span>
  `;
}

// 기업 정보 탭 렌더링
function renderCompanyInfo() {
  const stockInfo = companyData.stockInfoResponseDto;
  const price = Number(stockInfo.stck_prpr);
  const diff = Number(stockInfo.prdy_vrss);
  const prevClose = price - diff;

  setValue('기준가', price.toLocaleString());
  setValue('전일종가', prevClose.toLocaleString());
  setValue('누적거래량', Number(stockInfo.acml_vol).toLocaleString());
  const amountInEok = (Number(stockInfo.acml_tr_pbmn) / 1e8).toFixed(2);
  setValue('거래대금', `${amountInEok}억`);

  if (chartData?.length > 0) {
    const startPrice = Number(chartData.at(-1).stck_oprc);
    const endPrice = Number(chartData[0].stck_prpr);
    const highPrice = Math.max(...chartData.map((d) => Number(d.stck_hgpr)));
    const lowPrice = Math.min(...chartData.map((d) => Number(d.stck_lwpr)));
    const upperLimit = Math.floor(prevClose * 1.3);
    const lowerLimit = Math.floor(prevClose * 0.7);

    setValue('시작가', startPrice.toLocaleString());
    setValue('종가', endPrice.toLocaleString());
    setValue('고가', highPrice.toLocaleString());
    setValue('저가', lowPrice.toLocaleString());
    setValue('상한가', upperLimit.toLocaleString());
    setValue('하한가', lowerLimit.toLocaleString());
  }

  // 임시 하드코딩
  setValue('시장정보구분(투자주의)', '해당없음');
  setValue('관리종목', 'N');
  setValue('거래정지', 'N');
  setValue('배당수익률', '0%');
  setValue('주당배당금', '0');
  setValue('EPS', '0');
  setValue('PER', '0 배');
  setValue('BPS', '0');
  setValue('PBR', '0 배');
  setValue('결산월', '- 월');
}

// 초기 데이터 로드
async function fetchCompanyData(companyId) {
  const res = await authorizedFetch(
    `http://43.202.211.168:8080/api/company/${companyId}`
  );
  companyData = await res.json();

  const chartRes = await authorizedFetch(
    `http://43.202.211.168:8080/api/company/charts/${companyId}`
  );
  chartData = await chartRes.json();
}

// 진입점
(async function initPage() {
  const params = new URLSearchParams(location.search);
  let companyId = params.get('companyId');

  companyId = 1; // 테스트용
  if (!companyId) return;

  try {
    await fetchCompanyData(companyId);
    renderHeader();
    renderCompanyInfo(); // 기본 탭이 company일 경우

    // 탭 전환 핸들러
    const buttons = document.querySelectorAll('.tab-menu button');
    const panes = document.querySelectorAll('.tab-pane');

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const target = button.dataset.tab;

        buttons.forEach((btn) => btn.classList.remove('active'));
        panes.forEach((pane) => pane.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(target).classList.add('active');

        if (target === 'company') renderCompanyInfo();
      });
    });
  } catch (error) {
    console.error('기업 정보 로딩 실패:', error);
  }
})();

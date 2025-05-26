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

function renderChart() {
  const data = chartData.slice().map((d) => ({
    date: new Date(d.stockTradeTime),
    open: Number(d.stck_oprc),
    high: Number(d.stck_hgpr),
    low: Number(d.stck_lwpr),
    close: Number(d.stck_prpr),
  }));

  const svg = d3.select('#candleChart');
  svg.selectAll('*').remove();

  const tooltip = d3.select('#tooltip');
  const svgNode = document.getElementById('candleChart');
  const rect = svgNode.getBoundingClientRect();
  const svgWidth = rect.width;
  const svgHeight = rect.height;

  const margin = { top: 20, right: 60, bottom: 30, left: 60 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const chartGroup = svg
    .attr('viewBox', `0 0 ${svgWidth} ${svgHeight}`)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // x축: 최신 7시간 기준
  const latest = data[data.length - 1].date;
  const earliest = new Date(latest.getTime() - 7 * 60 * 60 * 1000);

  const x = d3
    .scaleTime()
    .domain([
      earliest,
      new Date(latest.getTime() + 155 * 60 * 1000), // latest + 10분 패딩
    ])
    .range([0, width]);

  // y축: high/low 기준 + padding
  const yMin = d3.min(data, (d) => d.low);
  const yMax = d3.max(data, (d) => d.high);
  const padding = (yMax - yMin) * 0.05;

  const y = d3
    .scaleLinear()
    .domain([yMin - padding, yMax + padding])
    .range([height, 0])
    .nice();

  // 모바일 여부 판별
  const isMobile = window.innerWidth <= 767;

  // y축: 라벨 (검정색)
  chartGroup
    .append('g')
    .attr('class', 'y axis')
    .attr('transform', `translate(${width},0)`)
    .call(d3.axisRight(y));

  // y축: 그리드 선 (연한색)
  chartGroup
    .append('g')
    .attr('class', 'y grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat('').tickSizeOuter(0));

  // x축: 라벨 (검정색)
  chartGroup
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(d3.timeHour.every(isMobile ? 2 : 1))
        .tickFormat(d3.timeFormat('%H:%M'))
    );

  // x축: 그리드 선 (연한색)
  chartGroup
    .append('g')
    .attr('class', 'x grid')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(d3.timeHour.every(isMobile ? 2 : 1))
        .tickFormat('')
        .tickSize(-height)
        .tickSizeOuter(0)
    );

  chartGroup
    .selectAll('.candle')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', (d) => x(d.date) - 5)
    .attr('y', (d) => y(Math.max(d.open, d.close)))
    .attr('width', 10)
    .attr('height', (d) => Math.max(1, Math.abs(y(d.open) - y(d.close))))
    .attr('fill', (d) => (d.close > d.open ? '#d32f2f' : '#1976d2'));

  chartGroup
    .selectAll('.wick')
    .data(data)
    .enter()
    .append('line')
    .attr('x1', (d) => x(d.date))
    .attr('x2', (d) => x(d.date))
    .attr('y1', (d) => y(d.high))
    .attr('y2', (d) => y(d.low))
    .attr('stroke', (d) => (d.close > d.open ? '#d32f2f' : '#1976d2'));

  const guidelineV = chartGroup
    .append('line')
    .attr('stroke', '#5DC29E')
    .attr('stroke-dasharray', '4')
    .attr('stroke-width', 1.6)
    .attr('y1', 0)
    .attr('y2', height)
    .style('display', 'none');

  const guidelineH = chartGroup
    .append('line')
    .attr('stroke', '#5DC29E')
    .attr('stroke-dasharray', '4')
    .attr('stroke-width', 1.6)
    .attr('x1', 0)
    .attr('x2', width)
    .style('display', 'none');

  // 가격 박스 배경
  const yPriceBox = chartGroup
    .append('rect')
    .attr('fill', '#5DC29E')
    .attr('height', 24)
    .attr('rx', 1)
    .style('display', 'none');

  // 가격 텍스트
  const yLabel = chartGroup
    .append('text')
    .attr('fill', '#fff') // 흰색 텍스트
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('dominant-baseline', 'middle') // 수직 중앙 정렬
    .style('display', 'none');

  svg.on('mousemove', function (event) {
    const [mouseX, mouseY] = d3.pointer(event);
    const x0 = x.invert(mouseX - margin.left);
    const bisect = d3.bisector((d) => d.date).center;
    const index = bisect(data, x0);
    const d = data[index];
    if (!d) return;

    // 마우스 위치 기반 가격 계산
    const priceAtCursor = y.invert(mouseY - margin.top);
    const yPos = y(priceAtCursor);

    guidelineV
      .attr('x1', x(d.date))
      .attr('x2', x(d.date))
      .style('display', 'block');

    // 수평선 (커서 위치 기준)
    guidelineH.attr('y1', yPos).attr('y2', yPos).style('display', 'block');
    const prev = data[index - 1];

    const labelText = Math.round(priceAtCursor).toLocaleString();
    const textWidth = yLabel.node().getComputedTextLength();

    yPriceBox
      .attr('x', width)
      .attr('y', yPos - 10)
      .attr('width', textWidth + 10)
      .style('display', 'block');
    // 가격 텍스트
    yLabel
      .text(labelText)
      .attr('x', width + 5) // y축 오른쪽 살짝 바깥
      .attr('y', yPos + 4) // 텍스트 수직 정렬 살짝 보정
      .style('display', 'block');

    // 퍼센트와 색상 계산
    const getRate = (val) =>
      prev ? ` (${(((val - prev.close) / prev.close) * 100).toFixed(2)}%)` : '';
    const getClass = (val) =>
      prev ? (val > prev.close ? 'up' : val < prev.close ? 'down' : '') : '';

    tooltip
      .style('display', 'block')
      .style('left', `${x(d.date) + margin.left + 5}px`)
      .style('top', `${y(d.high)}px`).html(`
      <strong>${d3.timeFormat('%Y-%m-%d %H:%M')(d.date)}</strong>
      종가&emsp;${d.close.toLocaleString()}<span class="${getClass(d.close)}">${getRate(d.close)}</span><br/>
      시가&emsp;${d.open.toLocaleString()} <span class="${getClass(d.open)}">${getRate(d.open)}</span><br/>
      고가&emsp;${d.high.toLocaleString()} <span class="${getClass(d.high)}">${getRate(d.high)}</span><br/>
      저가&emsp;${d.low.toLocaleString()} <span class="${getClass(d.low)}">${getRate(d.low)}</span>
    `);
  });

  svg.on('mouseleave', function () {
    tooltip.style('display', 'none');
    guidelineV.style('display', 'none');
    guidelineH.style('display', 'none');
    yLabel.style('display', 'none');
    yPriceBox.style('display', 'none');
  });
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
    renderChart();

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

        if (target == 'chart') renderChart();
        if (target === 'company') renderCompanyInfo();
        // 추후 chart, time, date 등도 분기 처리 가능
      });
    });
  } catch (error) {
    console.error('기업 정보 로딩 실패:', error);
  }
})();

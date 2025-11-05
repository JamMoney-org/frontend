import { authorizedFetch } from '../../utils/auth-fetch.js';

let companyData = null;
let chartData = null;
let chartViewRange = '1h';

const setValue = (label, value) => {
  const el = document.querySelector(`td[data-label="${label}"]`);
  if (el) el.textContent = value ?? '-';
};

function renderHeader() {
  const stockInfo = companyData.stockInfoResponseDto;
  const price = Number(stockInfo.stck_prpr);
  const diff = Number(stockInfo.prdy_vrss);
  const diffPercent = Number(stockInfo.prdy_ctrt).toFixed(2);

  document.querySelector('.company-name').innerHTML = `
    ${companyData.korName} <img src="/assets/icon/search.svg" alt="" />
  `;
  document.querySelector(
    '.current-price'
  ).textContent = `${price.toLocaleString()}원`;
  document.querySelector('.price-change').innerHTML = `
    어제보다 <span class="${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">
      ${diff > 0 ? '+' : ''}${diff.toLocaleString()} (${diffPercent}%)
    </span>
  `;
}

function renderCompanyInfo() {
  const stockInfo = companyData.stockInfoResponseDto;
  const price = Number(stockInfo.stck_prpr);
  const diff = Number(stockInfo.prdy_vrss);
  const prevClose = price - diff;

  setValue('기준가', price.toLocaleString());
  setValue('전일종가', prevClose.toLocaleString());

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

  setValue('누적거래량', Number(stockInfo.acml_vol).toLocaleString());
  const amountInEok = (Number(stockInfo.acml_tr_pbmn) / 1e8).toFixed(2);
  setValue('거래대금', `${amountInEok}억`);
  setValue(
    '시가총액',
    companyData.marketCap !== null
      ? `${(companyData.marketCap / 1e8).toFixed(2)}억`
      : ''
  );
  setValue(
    '액면가',
    companyData.faceValue !== null
      ? `${Number(companyData.faceValue).toLocaleString()}원`
      : ''
  );
  setValue('상장일자', companyData.listedDate ?? '');
  setValue(
    '상장수량',
    companyData.listedShares !== null
      ? `${Number(companyData.listedShares).toLocaleString()}주`
      : ''
  );
  setValue('시장정보구분(투자주의)', '해당없음');
  setValue('업종분류', companyData.industry);
  setValue('관리종목', 'N');
  setValue('거래정지', 'N');
  setValue(
    '배당수익률',
    companyData.dividendYield !== null ? `${companyData.dividendYield}%` : '%'
  );
  setValue(
    '주당배당금',
    companyData.dividendPerShare !== null
      ? `${Number(companyData.dividendPerShare).toLocaleString()}원`
      : ''
  );

  setValue(
    'EPS',
    companyData.eps !== null
      ? `${Number(companyData.eps).toLocaleString()}원`
      : ''
  );
  setValue(
    'PER',
    companyData.per !== null ? `${Number(companyData.per)}배` : '배'
  );
  setValue(
    'BPS',
    companyData.bps !== null
      ? `${Number(companyData.bps).toLocaleString()}원`
      : ''
  );
  setValue(
    'PBR',
    companyData.pbr !== null ? `${Number(companyData.pbr)}배` : '배'
  );
  setValue(
    '결산월',
    companyData.settlementMonth !== null
      ? `${companyData.settlementMonth}월`
      : '월'
  );
}

async function fetchCompanyData(companyId) {
  const res = await authorizedFetch(
    `https://jm-money.com/api/company/${companyId}`
  );
  companyData = await res.json();

  const chartRes = await authorizedFetch(
    `https://jm-money.com/api/company/charts/${companyId}`
  );
  chartData = await chartRes.json();
  chartData.sort(
    (a, b) => new Date(a.stockTradeTime) - new Date(b.stockTradeTime)
  );
}

function setupPeriodButtons() {
  const periodButtons = document.querySelectorAll('.period-tabs button');
  periodButtons.forEach((button) => {
    button.addEventListener('click', () => {
      chartViewRange = button.dataset.range;
      periodButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      renderChart();
    });
  });
}

function renderChart() {
  const fullData = chartData.slice().map((d) => ({
    date: new Date(d.stockTradeTime),
    open: Number(d.stck_oprc),
    high: Number(d.stck_hgpr),
    low: Number(d.stck_lwpr),
    close: Number(d.stck_prpr),
  }));

  let data = fullData;
  if (chartViewRange === '1h') {
    const oneHourAgo = new Date(
      fullData.at(-1).date.getTime() - 60 * 60 * 1000
    );
    data = fullData.filter((d) => d.date > oneHourAgo);
  }

  if (chartViewRange === '1d') {
    const sevenHoursAgo = new Date(
      fullData.at(-1).date.getTime() - 7 * 60 * 60 * 1000
    );
    data = fullData.filter((d) => d.date > sevenHoursAgo);
  }

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

  const totalDuration =
    data[data.length - 1].date.getTime() - data[0].date.getTime();

  const paddingRatio = 0.49;
  const xPadding = totalDuration * paddingRatio;
  const latest = new Date(data[data.length - 1].date.getTime() + xPadding);
  const earliest = new Date(data[0].date.getTime() - 10 * 60 * 1000);
  const x = d3.scaleTime().domain([earliest, latest]).range([0, width]);

  const yMin = d3.min(data, (d) => d.low);
  const yMax = d3.max(data, (d) => d.high);
  const padding = (yMax - yMin) * 0.05;

  const y = d3
    .scaleLinear()
    .domain([yMin - padding, yMax + padding])
    .range([height, 0])
    .nice();

  const isMobile = window.innerWidth <= 767;
  const isOver5Hours = totalDuration >= 18000000;
  const xAxisFormat =
    chartViewRange === 'all'
      ? d3.timeFormat('%Y-%m-%d')
      : d3.timeFormat('%H:%M');

  const xTicks =
    chartViewRange === 'all'
      ? d3.timeDay.every(1)
      : d3.timeHour.every(isMobile && isOver5Hours ? 2 : 1);

  chartGroup
    .append('g')
    .attr('class', 'y axis')
    .attr('transform', `translate(${width},0)`)
    .call(d3.axisRight(y));

  chartGroup
    .append('g')
    .attr('class', 'y grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat('').tickSizeOuter(0));

  chartGroup
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(xTicks).tickFormat(xAxisFormat));

  chartGroup
    .append('g')
    .attr('class', 'x grid')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3
        .axisBottom(x)
        .ticks(d3.timeHour.every(isMobile && isOver5Hours ? 2 : 1))
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

  const yPriceBox = chartGroup
    .append('rect')
    .attr('fill', '#5DC29E')
    .attr('height', 24)
    .attr('rx', 1)
    .style('display', 'none');

  const yLabel = chartGroup
    .append('text')
    .attr('fill', '#fff')
    .attr('font-size', '12px')
    .attr('font-weight', 'bold')
    .attr('dominant-baseline', 'middle')
    .style('display', 'none');

  svg.on('mousemove', function (event) {
    const [mouseX, mouseY] = d3.pointer(event);
    const x0 = x.invert(mouseX - margin.left);
    const bisect = d3.bisector((d) => d.date).center;
    const index = bisect(data, x0);
    const d = data[index];
    if (!d) return;

    const priceAtCursor = y.invert(mouseY - margin.top);
    const yPos = y(priceAtCursor);

    guidelineV
      .attr('x1', x(d.date))
      .attr('x2', x(d.date))
      .style('display', 'block');

    guidelineH.attr('y1', yPos).attr('y2', yPos).style('display', 'block');
    const prev = data[index - 1];

    const labelText = Math.round(priceAtCursor).toLocaleString();
    const textWidth = yLabel.node().getComputedTextLength();

    yPriceBox
      .attr('x', width)
      .attr('y', yPos - 10)
      .attr('width', textWidth + 10)
      .style('display', 'block');

    yLabel
      .text(labelText)
      .attr('x', width + 5)
      .attr('y', yPos + 4)
      .style('display', 'block');

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

function renderTimeTable() {
  const tableBody = document.querySelector('#timeTableBody');

  const stockInfo = companyData.stockInfoResponseDto;
  const currentPrice = Number(stockInfo.stck_prpr);
  const prdyVrss = Number(stockInfo.prdy_vrss);
  const prevClose = currentPrice - prdyVrss;
  const todayStr = new Date().toISOString().slice(0, 10);
  chartData
    .slice()
    .filter((item) => item.stockTradeTime.slice(0, 10) === todayStr)
    .reverse()
    .forEach((item) => {
      const tr = document.createElement('tr');

      const time = new Date(item.stockTradeTime).toLocaleTimeString('ko-KR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const price = Number(item.stck_prpr);
      const diff = price - prevClose;
      const volume = Number(item.cntg_vol).toLocaleString();

      tr.innerHTML = `
        <td>${time}</td>
        <td>${price.toLocaleString()}</td>
        <td class="change ${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">
          <span class="arrow">${diff > 0 ? '▲' : diff < 0 ? '▼' : ''}</span>
          <span class="value">${Math.abs(diff).toLocaleString()}</span>
        </td>
        <td>${volume}</td>
      `;

      tableBody.appendChild(tr);
    });
}

function renderDateTable() {
  const stockInfo = companyData.stockInfoResponseDto;
  const diff = Number(stockInfo.prdy_vrss);
  const tableBody = document.querySelector('#date tbody');
  tableBody.innerHTML = '';

  const grouped = {};
  chartData.forEach((item) => {
    const date = new Date(item.stockTradeTime).toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  const sortedDates = Object.keys(grouped).sort(
    (a, b) => new Date(b) - new Date(a)
  );
  const sorted = grouped[sortedDates[0]].sort(
    (a, b) => new Date(a.stockTradeTime) - new Date(b.stockTradeTime)
  );

  let close = Number(sorted[sorted.length - 1].stck_prpr);
  sortedDates.forEach((date, index) => {
    const items = grouped[date];

    const volume = items.reduce((sum, cur) => sum + Number(cur.cntg_vol), 0);

    let diffText = '<td>-</td>';
    if (index === 0) {
      const diffClass = diff > 0 ? 'up' : diff < 0 ? 'down' : '';
      const diffArrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '';
      diffText = `
        <td class="change ${diffClass}">
          <span class="arrow">${diffArrow}</span>
          <span class="value">${Math.abs(diff).toLocaleString()}</span>
        </td>
      `;
    }
    if (index === 1) {
      close -= diff;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${date.replace(/-/g, '.')}</td>
      <td>${close.toLocaleString()}</td>
      ${diffText}
      <td>${volume.toLocaleString()}</td>
    `;
    tableBody.appendChild(tr);
  });
}

(async function initPage() {
  const params = new URLSearchParams(location.search);
  const companyId = params.get('companyId');

  if (!companyId) return;

  try {
    await fetchCompanyData(companyId);
    renderHeader();
    console.log(companyData);
    renderCompanyInfo();
    renderChart();
    setupPeriodButtons();

    document.querySelector('.trade-btn').addEventListener('click', () => {
      window.location.href = `mock_invest_trade.html?companyId=${companyData.companyId}&companyCode=${companyData.code}`;
    });

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
        if (target == 'time') renderTimeTable();
        if (target === 'date') renderDateTable();
        if (target === 'company') renderCompanyInfo();
      });
    });
  } catch (error) {
    console.error('기업 정보 로딩 실패:', error);
  }
})();

// 取得畫布 context
const ctx = document.getElementById('lineChart').getContext('2d');

// 初始化參數

let maxTemp = 1300;
const initialTemp = 30;
let timeExtendRate = 60;
const totalHours = 8;
const numPoints = totalHours - 6;

// 預設資料點（固定溫度 30）
const data = Array.from({ length: numPoints }, (_, i) => ({
  x: i * 60,
  y: initialTemp
}));

// 建立 Chart.js 折線圖
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    datasets: [{
      label: '溫度 (°C)',
      data: data,
      borderColor: 'black',
      backgroundColor: '#888ddd',
      pointRadius: 7,
      pointHoverRadius: 25,
      showLine: true,
      tension: 0
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear',
        title: { display: true, text: '總時間(總運行時間)' },
        ticks: {
          callback(value) {
            const intVal = Math.floor(value);
            const hours = Math.floor(intVal / 60);
            const mins = intVal % 60;
            return hours > 0 ? `${hours}H${mins === 0 ? '' : mins}` : `${mins}`;
          },
          stepSize: 10,
          precision: 0
        },
        min: 0,
        max: totalHours * 60,
        grid: {
          color: (ctx) => ctx.tick.value % 60 === 0 ? '#888' : '#ddd'
        }
      },
      y: {
        min: 0,
        max: maxTemp,
        title: { display: true, text: '溫度 (°C)' }

      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    },
    onHover(e) {
      const point = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)[0];
      e.native.target.style.cursor = point ? 'grab' : 'default';
    },
    animation: true
  }
});

// ===========================
// 拖曳點位共用處理
// ===========================
let draggingPoint = null;
const canvas = chart.canvas;

function getPointIndex(event) {
  const point = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, false)[0];
  return point ? point.index : null;
}

function getXY(event) {
  const rect = canvas.getBoundingClientRect();
  // 用 mouse 或 touch 均取得相對位置
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

// 開始拖曳
function startDrag(event) {
  draggingPoint = getPointIndex(event);
}

// 結束拖曳
function endDrag() {
  draggingPoint = null;
}

// 執行拖曳
function doDrag(event) {
  if (draggingPoint === null) return;

  const { x, y } = getXY(event);
  const xValue = Math.floor(chart.scales.x.getValueForPixel(x));
  const yValue = Math.round(chart.scales.y.getValueForPixel(y));
  const left = draggingPoint === 0 ? 0 : chart.data.datasets[0].data[draggingPoint - 1].x + 1;
  const right = draggingPoint === chart.data.datasets[0].data.length - 1
    ? 9999
    : chart.data.datasets[0].data[draggingPoint + 1].x - 1;

  const newX = draggingPoint === 0 ? 0 : Math.min(Math.max(xValue, left), right);
  const newY = draggingPoint === 0 ? 0 : Math.min(Math.max(yValue, 30), maxTemp);

  chart.data.datasets[0].data[draggingPoint] = { x: newX, y: newY };
  if (newX > chart.options.scales.x.max - 30) {
    chart.options.scales.x.max += timeExtendRate;
  }
  chart.update();
  updateSegmentSummary();
}

// ===========================
// 事件監聽
// ===========================
// 滑鼠
canvas.addEventListener('mousedown', (e) => {
  e.preventDefault();
  startDrag(e);
});
canvas.addEventListener('mousemove', (e) => {
  e.preventDefault();
  doDrag(e);
});
canvas.addEventListener('mouseup', endDrag);

// 觸控
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startDrag(e);
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  doDrag(e);
});
canvas.addEventListener('touchend', endDrag);


// 雙擊新增或修改資料點（溫度或時間差）
canvas.addEventListener('dblclick', (e) => {
  const point = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false)[0];
  if (point) {
    const index = point.index;
    const current = chart.data.datasets[0].data[index];
    const newTemp = prompt("輸入新的溫度：", current.y);
    if (newTemp !== null && !isNaN(newTemp)) {
      chart.data.datasets[0].data[index].y = parseInt(newTemp);
      chart.update();
      updateSegmentSummary();
    }
  } else {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const meta = chart.getDatasetMeta(0);

 for (let i = 0; i < meta.data.length - 1; i++) {
  const pt1 = meta.data[i], pt2 = meta.data[i + 1];
  const midX = (pt1.x + pt2.x) / 2, midY = (pt1.y + pt2.y) / 2;
  if (Math.abs(x - midX) < 20 && Math.abs(y - midY) < 20) {
    const data = chart.data.datasets[0].data;
    const t1 = data[i].x;
    const t2 = data[i + 1].x;
    const totalMin = t2 - t1;
    const hr = Math.floor(totalMin / 60).toString().padStart(2, '0');
    const min = (totalMin % 60).toString().padStart(2, '0');
    const result = prompt("輸入新的時間差 格式(小時:分鐘、小時分鐘、分鐘 或 END)：", `${hr}:${min}`);

    if (result) {
      let newTotalMin = null;
      const trimmed = result.trim().toUpperCase();

      if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
        const [newHr, newMin] = trimmed.split(':').map(n => parseInt(n));
        newTotalMin = newHr * 60 + newMin;
      } else if (/^\d{3,4}$/.test(trimmed)) {
        const newHr = parseInt(trimmed.slice(0, -2));
        const newMin = parseInt(trimmed.slice(-2));
        newTotalMin = newHr * 60 + newMin;
      } else if (/^\d+$/.test(trimmed)) {
        newTotalMin = parseInt(trimmed);
      } else if (trimmed === 'END') {
        chart.data.datasets[0].data = data.slice(0, i + 2);
        chart.update();
        updateSegmentSummary();
        break;
      }

      if (newTotalMin !== null && !isNaN(newTotalMin)) {
        data[i + 1].x = data[i].x + newTotalMin;
        chart.update();
        updateSegmentSummary();
      } else {
        alert("輸入格式錯誤，請使用 HH:MM、HHMM、MM 或 END");
      }
    }

    break;
  }
}

  }
});

// 畫出每段距離文字標籤
function drawDistanceLabels() {
  const meta = chart.getDatasetMeta(0);
  const ctx = chart.ctx;
  ctx.save();
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';

  const data = chart.data.datasets[0].data;

  for (let i = 0; i < data.length; i++) {
    const pt = meta.data[i];

    // 在中間節點畫 PV_x_SV_y
    if (i > 0 && i < data.length - 1) {
      const timeDiff = data[i].x - data[i - 1].x;
      if (timeDiff > 0) {
        const pvNumber = Math.floor((i - 1) / 8) + 1;
        const svNumber = ((i - 1) % 8) + 1;

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'blue';
        ctx.fillText(`PV${pvNumber}_SV${svNumber}`, pt.x, pt.y - 15);
      }
    }

    // 在中間位置畫時間差
    if (i < data.length - 1) {
      const ptNext = meta.data[i + 1];
      const timeDiff = data[i + 1].x - data[i].x;

      if (timeDiff > 0) {
        const midX = (pt.x + ptNext.x) / 2;
        const midY = (pt.y + ptNext.y) / 2;
        const hr = Math.floor(timeDiff / 60);
        const min = timeDiff % 60;

        ctx.fillStyle = 'red';
        ctx.fillText(`${hr > 0 ? hr + '小時' : ''}${min}分`, midX, midY - 10);
      }
    }
  }

  ctx.restore();
}

// 更新右側段落摘要
function updateSegmentSummary() {
  const data = chart.data.datasets[0].data;
  const container = document.getElementById('segment-summary');
  container.innerHTML = '';

  for (let i = 1; i < data.length; i++) {
    const pt = data[i];
    const prevPt = data[i - 1];
    const segmentIndex = i;

    // 計算 PV 和 SV
    const pvNumber = Math.floor((segmentIndex - 1) / 8) + 1;
    const svNumber = ((segmentIndex - 1) % 8) + 1;
    const tnNumber = ((segmentIndex - 1) % 8) + 1;
    const label = `PV${pvNumber}_SV${svNumber}`;
    const tempText = `${label}: <span class="editable" style="color: red;"onclick="editTemp(${i})">${pt.y}</span> °C`;

    const div = document.createElement('div');

    if (i === data.length - 1) {
      // 最後一筆，檢查是否 END
      const timeDiff = pt.x - prevPt.x;
      if (timeDiff === 0) {
        div.innerHTML = `${tempText}<br>tN${tnNumber}: <span class="editable" style="color: red;"onclick="editTime(${i - 1})">END</span>`;
      } else {
        const hr = Math.floor(timeDiff / 60).toString().padStart(2, '0');
        const min = (timeDiff % 60).toString().padStart(2, '0');
        div.innerHTML = `${tempText}<br>tN${tnNumber}: <span class="editable" style="color: red;"onclick="editTime(${i - 1})">${hr}:${min}</span>`;
      }
    } else {
      const timeDiff = pt.x - prevPt.x;
      const hr = Math.floor(timeDiff / 60).toString().padStart(2, '0');
      const min = (timeDiff % 60).toString().padStart(2, '0');
      div.innerHTML = `${tempText}<br>tN${tnNumber}: <span class="editable" style="color: red;"onclick="editTime(${i - 1})">${hr}:${min}</span>`;
    }

    container.appendChild(div);
  }
}




// 手動編輯溫度
function editTemp(index) {
  const pt = chart.data.datasets[0].data[index];
  const newTemp = prompt("輸入新的溫度：", pt.y);
  if (newTemp !== null && !isNaN(newTemp)) {
    pt.y = parseInt(newTemp);
    chart.update();
    updateSegmentSummary();
  }
}

// 手動編輯時間差
function editTime(index) {
  const data = chart.data.datasets[0].data;
  const t1 = data[index].x;
  const t2 = data[index + 1].x;
  const totalMin = t2 - t1;
  const hr = Math.floor(totalMin / 60).toString().padStart(2, '0');
  const min = (totalMin % 60).toString().padStart(2, '0');
  const result = prompt("輸入新的時間差 格式(小時:分鐘、小時分鐘、分鐘 或 END)：", `${hr}:${min}`);

  if (result) {
    let newTotalMin = null;
    const trimmed = result.trim().toUpperCase();

    if (/^\d{1,2}:\d{2}$/.test(trimmed)) {
      const [newHr, newMin] = trimmed.split(':').map(n => parseInt(n));
      newTotalMin = newHr * 60 + newMin;
    } else if (/^\d{3,4}$/.test(trimmed)) {
      const newHr = parseInt(trimmed.slice(0, -2));
      const newMin = parseInt(trimmed.slice(-2));
      newTotalMin = newHr * 60 + newMin;
    } else if (/^\d+$/.test(trimmed)) {
      newTotalMin = parseInt(trimmed);
    } else if (trimmed === 'END') {
      // 把該點時間設為0，並砍掉後面點
      data[index + 1].x = data[index].x;  // 時間差歸0
      chart.data.datasets[0].data = data.slice(0, index + 2);
      chart.update();
      updateSegmentSummary();
      return;
    }

    if (newTotalMin !== null && !isNaN(newTotalMin)) {
      data[index + 1].x = data[index].x + newTotalMin;
      chart.update();
      updateSegmentSummary();
    } else {
      alert("輸入格式錯誤，請使用 HH:MM、HHMM、MM 或 END");
    }
  }
}


// 自訂插件：繪製時間差標籤
Chart.register({
  id: 'custom-labels',
  afterDatasetsDraw(chart) {
    drawDistanceLabels();
  }
});

// 控制輸入變動處理
document.getElementById('maxTemp').addEventListener('change', (e) => {
  maxTemp = parseInt(e.target.value);
  chart.options.scales.y.max = maxTemp;
  chart.update();
});

document.getElementById('timeExtendRate').addEventListener('change', (e) => {
  timeExtendRate = parseInt(e.target.value);
});

// 滾輪縮放功能
canvas.addEventListener('wheel', (e) => {
  if (e.ctrlKey || e.button === 1 || e.deltaY !== 0) {
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    chart.options.scales.x.max *= factor;
    chart.update();
    e.preventDefault();
  }
});



const exampleData = {
  example1: [
    { x: 0, y: 30 },
    { x: 180, y: 200 },
    { x: 420, y: 600 },
    { x: 540, y: 900 },
    { x: 570, y: 950 },
    { x: 600, y: 950 },
    { x: 600, y: 950}  // x 最後一點用最大值，並標示結束點
  ],
  example2: [
    { x: 0, y: 30 },
    { x: 360, y: 600 },
    { x: 558, y: 1100 },
    { x: 654, y: 1260 },
    { x: 669, y: 1260 },
    { x: 669, y: 1260 }
  ],
  example3: [
    { x: 0, y: 30 },
    { x: 360, y: 600 },
    { x: 420, y: 600 },
    { x: 420, y: 600 }
  ],
  example4: [
    { x: 0, y: 30 },
    { x: 60, y: 30 },	
  ],
};
document.getElementById('example1').addEventListener('click', () => {
  loadExample('example1');
});
document.getElementById('example2').addEventListener('click', () => {
  loadExample('example2');
});
document.getElementById('example3').addEventListener('click', () => {
  loadExample('example3');
});
document.getElementById('example4').addEventListener('click', () => {
  loadExample('example4');
});


document.getElementById('outdate').addEventListener('click', updateFloatingSummary);

function updateFloatingSummary() {
  const data = chart.data.datasets[0].data;

  // 找到或建立彈出層
  let isMobile = window.innerWidth <= 768; // 可依實際調整判斷寬度
  const columns = isMobile ? 3 : 6;
  let overlay = document.getElementById('floatingSummary');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'floatingSummary';
    overlay.style.position = 'fixed';
    overlay.style.top = '10px';
    overlay.style.right = '10px';
    overlay.style.backgroundColor = '#222';
    overlay.style.color = '#fff';
    overlay.style.padding = '20px';
    overlay.style.borderRadius = '12px';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'grid';
    overlay.style.gridTemplateColumns = `repeat(${columns}, 100px)`; // 每行5個
    overlay.style.gap = '12px';
    overlay.style.maxHeight = '80vh';
    overlay.style.overflowY = 'auto';
    overlay.style.position = 'fixed';
    overlay.innerHTML = `
      <div style="grid-column: span ${columns}; text-align: right;">
        <span id="closeFloatingSummary" style="cursor: pointer; font-size: 18px; font-weight: bold">✕</span>
      </div>`;
    document.body.appendChild(overlay);

    // 關閉事件
    overlay.querySelector('#closeFloatingSummary').addEventListener('click', () => {
      overlay.remove();
    });
  } else {
    // 清空除掉關閉行之外的所有節點
    Array.from(overlay.children).forEach(child => {
      if (!child.querySelector('#closeFloatingSummary')) {
        overlay.removeChild(child);
      }
    });
  }

  // 更新資料
  for (let i = 1; i < data.length; i++) {
    const pt = data[i];
    const prevPt = data[i - 1];
    const segmentIndex = i;

    // PV 和 SV
    const pvNumber = Math.floor((segmentIndex - 1) / 8) + 1;
    const svNumber = ((segmentIndex - 1) % 8) + 1;
    const tnNumber = ((segmentIndex - 1) % 8) + 1;
	const outNumber = ((segmentIndex - 1) % 8) + 1;
    // 如果是 SV_1，插入 PtN 標籤
    if (svNumber === 1) {
      const ptNBox = createBox('PtN', `${pvNumber}`);
      overlay.appendChild(ptNBox);
    }


    // 製作3個方塊
    const svLabel = `SV_${svNumber}`;
    const svValue = `${pt.x}`;
    const tnLabel = `tN_${tnNumber}`;
    const tnValue = (() => {
      if (i === data.length - 1) {
        const timeDiff = pt.x - prevPt.x;
        if (timeDiff === 0) return 'END';
        const hr = Math.floor(timeDiff / 60).toString().padStart(2, '0');
        const min = (timeDiff % 60).toString().padStart(2, '0');
        return `${hr}.${min}`;
      } else {
        const timeDiff = pt.x - prevPt.x;
        const hr = Math.floor(timeDiff / 60).toString().padStart(2, '0');
        const min = (timeDiff % 60).toString().padStart(2, '0');
        return `${hr}.${min}`;
      }
    })();

    const outLabel = `OUT_${outNumber}`;;
    const outValue = '100.0';

    // 創建方塊
    const svBox = createBox(`SV_${svNumber}`, pt.y);
    const tnBox = createBox(tnLabel, tnValue);
    const outBox = createBox(outLabel, outValue);


    overlay.appendChild(svBox);
    overlay.appendChild(tnBox);
    overlay.appendChild(outBox);
  }
}

// 創建方塊的小工具
function createBox(label, value, labelColor = '#ff3430', valueColor = '#f2ff00', bgColor = '#333') {
  const box = document.createElement('div');
  box.style.display = 'flex';
  box.style.flexDirection = 'column';
  box.style.alignItems = 'center';
  box.style.justifyContent = 'center';
  box.style.background = '#000';
  box.style.borderRadius = '8px';
  box.style.width = '100px';
  box.style.height = '100px';
  box.innerHTML = `

	<div style="font-size: 24px; color: ${labelColor}">${label}</div>
    <div style="font-size: 20px; color: ${valueColor}">${value}</div>
	
	
  `;
  return box;
}


	

function loadExample(name) {
  const data = exampleData[name];
  if (!data) return;
  chart.data.datasets[0].data = data;

  // 找出最大時間點
  const maxX = Math.max(...data.map(p => p.x));
  if (maxX > chart.options.scales.x.max) {
    chart.options.scales.x.max = maxX + timeExtendRate;  // 預留一些空間
  }

  chart.update();
  updateSegmentSummary();
}

document.getElementById('test3').addEventListener('click', () => {
  const errorDiv = document.getElementById('error-message');
  const data = chart.data.datasets[0].data;
  if (data.length < 2) {
    errorDiv.textContent = '資料點不足，無法檢查最後一段時間是否為END';
    return;
  }

  // 取最後兩點，計算時間差
  const lastIndex = data.length - 1;
  const lastDiff = data[lastIndex].x - data[lastIndex - 1].x;

  if (lastDiff !== 0) {
    errorDiv.textContent = '錯誤!最後一段程式時間必須為END';
  } else {
    errorDiv.textContent = '';  // 清空錯誤訊息
    alert('程式正確，請按照右邊的流程圖輸入進溫度控制器');
	 // 自動點擊「流程圖」按鈕
  document.getElementById('outdate').click();
  }
});



// 初始化段落摘要
updateSegmentSummary();

// 新增一段程式（PtN）
// 增加 segment
document.getElementById('addSegment').addEventListener('click', () => {
  const data = chart.data.datasets[0]?.data;
  if (!data || data.length < 2) return;

  const last = data[data.length - 1];
  const beforeLast = data[data.length - 2];
  const timeDiff = last.x - beforeLast.x;

  const newX = last.x + timeDiff;
  const newY = last.y;

  // 現有 segment 數
  const segmentCount = data.length;

  // 計算 PV 和 SV 編號
  const pvNumber = Math.floor(segmentCount / 8) + 1;
  const svNumber = (segmentCount % 8) + 1;

  const label = `PV${pvNumber}_SV${svNumber}`;

  data.push({ x: newX, y: newY, label }); // 把 label 放入資料
  chart.update();
  updateSegmentSummary();
});

// 減少 segment
document.getElementById('removeSegment').addEventListener('click', () => {
  const data = chart.data.datasets[0]?.data;
  if (!data || data.length <= 1) return;

  data.pop();
  chart.update();
  updateSegmentSummary();
});


// 重新載入網頁
document.getElementById("restartApp").addEventListener("click", () => {
  location.reload();
});




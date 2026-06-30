const ctx = document.getElementById("lineChart").getContext("2d");
let maxTemp = 0x514;
const initialTemp = 0x1e;
let timeExtendRate = 0x3c;
const totalHours = 0x8,
  numPoints = totalHours - 0x6,
  data = [
    { x: 0, y: initialTemp },
    { x: 60, y: 500 }
  ],
  chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "溫度 (°C)",
          data: data,
          borderColor: "#ef4444", // Modern Red
          borderWidth: 3,
          fill: true,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#ef4444",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: "#ef4444",
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 3,
          showLine: true,
          tension: 0, // Keep straight lines for industrial controllers
          segment: {
            borderColor: (ctx) => {
              if (!ctx.p0 || !ctx.p1) return "#ef4444";
              if (ctx.p1.parsed.y === ctx.p0.parsed.y) return "#3b82f6"; // Blue for hold
              if (ctx.p1.parsed.y < ctx.p0.parsed.y) return "#9ca3af"; // Gray for drop
              return "#ef4444"; // Red for rise
            },
            backgroundColor: (ctx) => {
              const chartCtx = ctx.chart.ctx;
              const gradient = chartCtx.createLinearGradient(
                0,
                0,
                0,
                ctx.chart.height || 400,
              );
              if (!ctx.p0 || !ctx.p1) {
                gradient.addColorStop(0, "rgba(239, 68, 68, 0.4)");
                gradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");
                return gradient;
              }
              if (ctx.p1.parsed.y === ctx.p0.parsed.y) {
                // Blue gradient for hold
                gradient.addColorStop(0, "rgba(59, 130, 246, 0.4)");
                gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
              } else if (ctx.p1.parsed.y < ctx.p0.parsed.y) {
                // Gray gradient for drop
                gradient.addColorStop(0, "rgba(156, 163, 175, 0.4)");
                gradient.addColorStop(1, "rgba(156, 163, 175, 0.0)");
              } else {
                // Red gradient for rise
                gradient.addColorStop(0, "rgba(239, 68, 68, 0.4)");
                gradient.addColorStop(1, "rgba(239, 68, 68, 0.0)");
              }
              return gradient;
            },
          },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "nearest",
        intersect: true,
      },
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "總時間 (總運行時間)",
            color: "#64748b",
            font: { family: "'Inter', sans-serif" },
          },
          ticks: {
            color: "#64748b",
            font: { family: "'Inter', sans-serif" },
            callback(_0x1765cd) {
              const _0x3b1fb1 = Math.floor(_0x1765cd),
                _0x46ccdf = Math.floor(_0x3b1fb1 / 0x3c),
                _0x31563a = _0x3b1fb1 % 0x3c;
              return _0x46ccdf > 0x0
                ? _0x46ccdf +
                    "時" +
                    (_0x31563a === 0x0 ? "" : " " + _0x31563a + "分")
                : "" + _0x31563a + "分";
            },
            stepSize: 10,
            precision: 0,
          },
          min: 0,
          max: totalHours * 60,
          grid: {
            color: (context) =>
              context.tick.value % 60 === 0
                ? "rgba(0, 0, 0, 0.1)"
                : "rgba(0, 0, 0, 0.03)",
            borderDash: [5, 5],
          },
        },
        y: {
          min: 0,
          max: maxTemp * 1.1,
          title: {
            display: true,
            text: "溫度 (°C)",
            color: "#64748b",
            font: { family: "'Inter', sans-serif" },
          },
          ticks: {
            color: "#64748b",
            font: { family: "'Inter', sans-serif" },
          },
          afterBuildTicks: (axis) => {
            // 只保留小於最大溫度的刻度，並強制加上最大溫度這條線
            axis.ticks = axis.ticks.filter((tick) => tick.value < maxTemp);
            axis.ticks.push({ value: maxTemp });
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
            borderDash: [5, 5],
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          titleFont: { family: "'Inter', sans-serif" },
          bodyFont: { family: "'Inter', sans-serif" },
        },
      },
      onHover(_0x3ad888) {
        const _0x495db6 = chart.getElementsAtEventForMode(
          _0x3ad888,
          "nearest",
          { intersect: !![] },
          ![],
        )[0x0];
        _0x3ad888.native.target.style.cursor = _0x495db6 ? "grab" : "default";
      },
      animation: !![],
    },
  });
let draggingPoint = null;
const canvas = chart.canvas;
function getPointIndex(_0x28c735) {
  const { x, y } = getXY(_0x28c735);

  if (window.nodeBadges) {
    for (const badge of window.nodeBadges) {
      if (
        x >= badge.left &&
        x <= badge.right &&
        y >= badge.top &&
        y <= badge.bottom
      ) {
        return badge.index;
      }
    }
  }

  const _0x3257ce = chart.getElementsAtEventForMode(
    _0x28c735,
    "nearest",
    { intersect: false },
    false,
  )[0x0];
  if (!_0x3257ce) return null;
  const element = _0x3257ce.element;
  const distance = Math.sqrt(
    Math.pow(element.x - x, 2) + Math.pow(element.y - y, 2)
  );
  return distance <= 20 ? _0x3257ce.index : null;
}
function getXY(_0x459a40) {
  const _0x4132f0 = canvas.getBoundingClientRect(),
    _0x5c2436 = _0x459a40.touches
      ? _0x459a40.touches[0x0].clientX
      : _0x459a40.clientX,
    _0x3fe1b6 = _0x459a40.touches
      ? _0x459a40.touches[0x0].clientY
      : _0x459a40.clientY;
  return { x: _0x5c2436 - _0x4132f0.left, y: _0x3fe1b6 - _0x4132f0.top };
}

let dragOffsetX = 0;
let dragOffsetY = 0;

function startDrag(_0x5439d2) {
  draggingPoint = getPointIndex(_0x5439d2);
  if (draggingPoint !== null) {
    const { x, y } = getXY(_0x5439d2);
    const meta = chart.getDatasetMeta(0);
    const point = meta.data[draggingPoint];
    if (point) {
      dragOffsetX = point.x - x;
      dragOffsetY = point.y - y;
    } else {
      dragOffsetX = 0;
      dragOffsetY = 0;
    }
  }
}
function endDrag() {
  if (draggingPoint !== null) {
    draggingPoint = null;
    chart.update("none");
  }
}
function doDrag(_0x6dac00) {
  if (draggingPoint === null) return;
  const autoSnap = document.getElementById("autoSnap")?.checked;
  const { x: rawTouchX, y: rawTouchY } = getXY(_0x6dac00);

  // Apply offset so point doesn't jump
  const _0x56f6ee = rawTouchX + dragOffsetX;
  const _0x5109f8 = rawTouchY + dragOffsetY;

  const rawX = chart.scales.x.getValueForPixel(_0x56f6ee);
  const rawY = chart.scales.y.getValueForPixel(_0x5109f8);
  const _0x20eeae = autoSnap ? Math.round(rawX / 10) * 10 : Math.floor(rawX);
  const _0x27a678 = autoSnap ? Math.round(rawY / 10) * 10 : Math.round(rawY);

  const dataPoints = chart.data.datasets[0x0].data;
  const p = draggingPoint;

  let leftBound = 0;
  if (p > 0) {
    if (p >= 2 && dataPoints[p - 1].x === dataPoints[p - 2].x) {
      leftBound = dataPoints[p - 1].x + 1; // Cannot share X with p-1 if p-1 already shares with p-2
    } else {
      leftBound = dataPoints[p - 1].x; // Allow sharing X with p-1
    }
  }

  let rightBound = 0x270f;
  if (p < dataPoints.length - 1) {
    if (
      p <= dataPoints.length - 3 &&
      dataPoints[p + 1].x === dataPoints[p + 2].x
    ) {
      rightBound = dataPoints[p + 1].x - 1; // Cannot share X with p+1 if p+1 already shares with p+2
    } else {
      rightBound = dataPoints[p + 1].x; // Allow sharing X with p+1
    }
  }

  const _0x2d707e =
    p === 0 ? 0 : Math.min(Math.max(_0x20eeae, leftBound), rightBound);
  const _0x361784 =
    p === 0 ? 0 : Math.min(Math.max(_0x27a678, 0x1e), maxTemp);

  dataPoints[p] = {
    x: _0x2d707e,
    y: _0x361784,
  };

  if (p > 0 && _0x2d707e === dataPoints[p - 1].x) {
    dataPoints[p - 1].y = _0x361784;
  } else if (
    p < dataPoints.length - 1 &&
    _0x2d707e === dataPoints[p + 1].x
  ) {
    dataPoints[p + 1].y = _0x361784;
  }

  if (_0x2d707e > chart.options.scales.x.max - 0x1e) {
    chart.options.scales.x.max += timeExtendRate;
  }

  chart.update("none");
  updateSegmentSummary();
}
let dragRAF = null;
canvas.addEventListener("mousedown", (_0x4d60bf) => {
  _0x4d60bf.preventDefault();
  startDrag(_0x4d60bf);
});
canvas.addEventListener("mousemove", (_0x4bb382) => {
  _0x4bb382.preventDefault();
  if (dragRAF) cancelAnimationFrame(dragRAF);
  dragRAF = requestAnimationFrame(() => doDrag(_0x4bb382));
});
canvas.addEventListener("mouseup", endDrag);

(() => {
  let longPressTimer = null;
  let initialPinchDistance = null;
  let touchMode = "none"; // "dragPoint", "panChart", "pinch"
    let lastPanX = 0;
    
    let lastTapTime = 0;

    function getDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 1) {
        e.preventDefault(); // prevent default aggressively for pinch
      }
      const touches = e.touches;
      if (touches.length === 2) {
        touchMode = "pinch";
        initialPinchDistance = getDistance(touches);
        clearTimeout(longPressTimer);
      } else if (touches.length === 1) {
        lastPanX = touches[0].clientX;

        // Check if we hit a point
        startDrag(e);

        if (draggingPoint !== null) {
          touchMode = "dragPoint";
        } else {
          touchMode = "none";
          // If they didn't hit a point, they might want to pan. Start the 400ms timer.
          longPressTimer = setTimeout(() => {
            if (touchMode === "none") {
              touchMode = "panChart";
              try {
                navigator.vibrate(50);
              } catch (err) {}
            }
          }, 400);
        }

        // Handle double tap
        const now = Date.now();
        if (now - lastTapTime < 500) {
          // It's a double tap (increased to 500ms for better sensitivity)
          if (window.handleChartDblClick) {
            e.preventDefault(); // Stop normal click from firing
            window.handleChartDblClick(e);
          }
          lastTapTime = 0; // reset
        } else {
          lastTapTime = now;
        }
      }
    });

    canvas.addEventListener("touchmove", (e) => {
      const touches = e.touches;
      if (touchMode === "pinch" && touches.length === 2) {
        e.preventDefault();
        const currentDistance = getDistance(touches);
        const scale = initialPinchDistance / currentDistance;
        if (scale > 0.5 && scale < 2.0) {
          chart.options.scales.x.max *= scale;
          chart.update("none");
        }
        initialPinchDistance = currentDistance;
      } else if (touchMode === "none" && draggingPoint === null) {
        // If they swipe quickly before 400ms, cancel the long press
        if (Math.abs(touches[0].clientX - lastPanX) > 10) {
          clearTimeout(longPressTimer);
        }
      } else if (touchMode === "dragPoint") {
        if (draggingPoint !== null) {
          e.preventDefault();
          if (dragRAF) cancelAnimationFrame(dragRAF);
          dragRAF = requestAnimationFrame(() => doDrag(e));
        }
      } else if (touchMode === "panChart" && touches.length === 1) {
        e.preventDefault();
        const dx = touches[0].clientX - lastPanX;
        lastPanX = touches[0].clientX;
        const startXMin = chart.options.scales.x.min || 0;
        const startXMax = chart.options.scales.x.max;
        const pixelsPerMinute = canvas.clientWidth / (startXMax - startXMin);
        const timeShift = -(dx / pixelsPerMinute);
        const newMin = Math.max(0, startXMin + timeShift);
        const actualShift = newMin - startXMin;
        chart.options.scales.x.min = newMin;
        chart.options.scales.x.max = startXMax + actualShift;
        chart.update("none");
      }
    });

    canvas.addEventListener("touchend", (e) => {
      clearTimeout(longPressTimer);
      endDrag();
      touchMode = "none";
    });
  })();
  async function editPoint(pointIndex) {
    const data = chart.data.datasets[0].data[pointIndex];
    const newVal = await customPrompt("輸入新的溫度：", data.y);
    if (newVal !== null && !isNaN(newVal)) {
      chart.data.datasets[0].data[pointIndex].y = parseInt(newVal);
      chart.update();
      updateSegmentSummary();
    }
  }

  async function editSegmentTime(segmentIndex) {
    const data = chart.data.datasets[0].data;
    const tStart = data[segmentIndex].x;
    const tEnd = data[segmentIndex + 1].x;
    const diff = tEnd - tStart;
    const hours = Math.floor(diff / 60)
      .toString()
      .padStart(2, "0");
    const mins = (diff % 60).toString().padStart(2, "0");

    const newVal = await customPrompt(
      "輸入新的時間差 格式(小時:分鐘、小時分鐘、分鐘 或 END)：",
      hours + ":" + mins
    );

    if (newVal) {
      let newDiff = null;
      const val = newVal.trim().toUpperCase();
      if (/^\d{1,2}:\d{2}$/.test(val)) {
        const parts = val.split(":").map((p) => parseInt(p));
        newDiff = parts[0] * 60 + parts[1];
      } else if (/^\d{3,4}$/.test(val)) {
        const h = parseInt(val.slice(0, -2));
        const m = parseInt(val.slice(-2));
        newDiff = h * 60 + m;
      } else if (/^\d+$/.test(val)) {
        newDiff = parseInt(val);
      } else if (val === "END") {
        chart.data.datasets[0].data = data.slice(0, segmentIndex + 2);
        chart.data.datasets[0].data[segmentIndex + 1].x = tStart;
        chart.update();
        updateSegmentSummary();
        return;
      }

      if (newDiff !== null && !isNaN(newDiff)) {
        data[segmentIndex + 1].x = tStart + newDiff;
        chart.update();
        updateSegmentSummary();
      } else {
        await customAlert("輸入格式錯誤，請使用 HH:MM、HHMM、MM 或 END");
      }
    }
  }

  window.handleChartDblClick = async function(e) {
    const pointIndex = getPointIndex(e);
    if (pointIndex !== null) {
      await editPoint(pointIndex);
      return;
    }

    const { x, y } = getXY(e);
    const meta = chart.getDatasetMeta(0);
    for (let i = 0; i < meta.data.length - 1; i++) {
      const pt1 = meta.data[i];
      const pt2 = meta.data[i + 1];
      const midX = (pt1.x + pt2.x) / 2;
      const midY = (pt1.y + pt2.y) / 2;
      if (Math.abs(x - midX) < 20 && Math.abs(y - midY) < 20) {
        await editSegmentTime(i);
        return;
      }
    }
  };

  canvas.addEventListener("dblclick", window.handleChartDblClick);
function drawDistanceLabels() {
  const meta = chart.getDatasetMeta(0);
  const ctx = chart.ctx;
  ctx.save();
  ctx.font = "bold 11px 'Inter', 'Noto Sans TC', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const drawBadge = (text, x, y, bgColor, textColor) => {
    const textWidth = ctx.measureText(text).width;
    const paddingX = 8;
    const paddingY = 5;
    const badgeWidth = textWidth + paddingX * 2;
    const badgeHeight = 11 + paddingY * 2;
    const rectX = x - badgeWidth / 2;
    const rectY = y - badgeHeight / 2;

    // Draw badge background
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(rectX, rectY, badgeWidth, badgeHeight, 6);
    } else {
      ctx.rect(rectX, rectY, badgeWidth, badgeHeight);
    }
    ctx.fill();

    // Draw subtle border
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw text
    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y + 1); // +1px for visual vertical alignment
  };

  const dataPoints = chart.data.datasets[0].data;
    // Label for PV_SV (Node tags) with stacking logic for same X
    const badgesToDraw = [];
    for (let i = 1; i < dataPoints.length; i++) {
      const diffX = dataPoints[i].x - dataPoints[i - 1].x;
      const svIndex = ((i - 1) % 8) + 1;
      const pointMeta = meta.data[i];
      
      if (diffX > 0) {
        badgesToDraw.push({
          text: "第" + svIndex + "段",
          x: pointMeta.x,
          y: pointMeta.y,
          bg: "rgba(37, 99, 235, 0.9)", // Blue badge
          color: "#ffffff"
        });
      } else {
        badgesToDraw.push({
          text: "第" + svIndex + "段(END)",
          x: pointMeta.x,
          y: pointMeta.y,
          bg: "rgba(220, 38, 38, 0.9)", // Red badge for END
          color: "#ffffff"
        });
      }
    }

    const xGroups = {};
    window.nodeBadges = []; // Store hitboxes

    for (let i = 0; i < badgesToDraw.length; i++) {
      const b = badgesToDraw[i];
      const xKey = Math.round(b.x);
      if (!xGroups[xKey]) xGroups[xKey] = { baseY: b.y, count: 0 };

      const stackIndex = xGroups[xKey].count;
      xGroups[xKey].count++;

      const badgeY = xGroups[xKey].baseY - 25 - stackIndex * 28;
      drawBadge(b.text, b.x, badgeY, b.bg, b.color);

      // Calculate hitbox for clicking
      ctx.font = "bold 13px 'Noto Sans TC', sans-serif";
      const textWidth = ctx.measureText(b.text).width;
      const badgeWidth = textWidth + 12;
      const badgeHeight = 22;

      window.nodeBadges.push({
        index: b.pointIndex,
        left: b.x - badgeWidth / 2,
        right: b.x + badgeWidth / 2,
        top: badgeY - badgeHeight / 2,
        bottom: badgeY + badgeHeight / 2,
      });
    }

    for (let i = 0; i < dataPoints.length; i++) {
      const pointMeta = meta.data[i];

      // Draw vertical program divider line
      if (i % 8 === 0) {
        ctx.save();
        const pvIdx = Math.floor(i / 8) + 1;
        const xPos = pointMeta.x;
        const yTop = chart.chartArea.top;
        const yBottom = chart.chartArea.bottom;

        ctx.beginPath();
        ctx.moveTo(xPos, yTop);
        ctx.lineTo(xPos, yBottom);
        ctx.lineWidth = 2;
        // 第一個是紅線 (Red), others cycle through distinct colors
        const programColors = [
          "#ff4d4d",
          "#4cd137",
          "#4facfe",
          "#ffb84d",
          "#9c88ff",
          "#e84118",
          "#00a8ff",
        ];
        ctx.strokeStyle = programColors[(pvIdx - 1) % programColors.length];
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = "bold 14px 'Noto Sans TC', sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("程式" + pvIdx, xPos + 6, yTop + 6);
        ctx.restore();
      }

    // Label for Time Difference (Midpoint tags)
    if (i < dataPoints.length - 1) {
      const nextMeta = meta.data[i + 1];
      const diffX = dataPoints[i + 1].x - dataPoints[i].x;
      if (diffX > 0) {
        const midX = (pointMeta.x + nextMeta.x) / 2;
        const midY = (pointMeta.y + nextMeta.y) / 2;
        const hours = Math.floor(diffX / 60);
        const mins = diffX % 60;
        const timeText = (hours > 0 ? hours + "時 " : "") + mins + "分";

        const diffY = dataPoints[i + 1].y - dataPoints[i].y;
        let badgeBg, badgeText, statusText, statusColor;

        if (diffY > 0) {
          badgeBg = "rgba(254, 226, 226, 0.95)"; // Red light
          badgeText = "#ef4444"; // Red
          statusText = "升溫";
          statusColor = "rgba(239, 68, 68, 0.5)";
        } else if (diffY === 0) {
          badgeBg = "rgba(219, 234, 254, 0.95)"; // Blue light
          badgeText = "#3b82f6"; // Blue
          statusText = "持溫";
          statusColor = "rgba(59, 130, 246, 0.5)";
        } else {
          badgeBg = "rgba(243, 244, 246, 0.95)"; // Gray light
          badgeText = "#4b5563"; // Gray
          statusText = "自然降溫";
          statusColor = "rgba(107, 114, 128, 0.5)";
        }

        drawBadge(timeText, midX, midY - 20, badgeBg, badgeText);

        // Draw status text in the fill area if enough space
        const widthPxls = nextMeta.x - pointMeta.x;
        const heightPxls = chart.chartArea.bottom - midY;
        if (widthPxls > 60 && heightPxls > 40) {
          ctx.save();
          ctx.font = "bold 18px 'Inter', 'Noto Sans TC', sans-serif";
          ctx.fillStyle = statusColor;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // Calculate vertical position (1/3 way from the line to the bottom for better visibility)
          const textY = midY + heightPxls * 0.4;
          ctx.fillText(statusText, midX, textY);
          ctx.restore();
        }
      }
    }
  }
  ctx.restore();
}
function updateSegmentSummary() {
  const _0x4a39cf = chart.data.datasets[0x0].data,
    _0x4ea68b = document.getElementById("segment-summary");
  _0x4ea68b.innerHTML = "";
  for (let _0x5dca3d = 0x1; _0x5dca3d < _0x4a39cf.length; _0x5dca3d++) {
    const _0x169b1e = _0x4a39cf[_0x5dca3d],
      _0xb633ad = _0x4a39cf[_0x5dca3d - 0x1],
      _0x224bf7 = _0x5dca3d,
      _0x4fb27a = Math.floor((_0x224bf7 - 0x1) / 0x8) + 0x1,
      _0x4a1ae5 = ((_0x224bf7 - 0x1) % 0x8) + 0x1,
      _0x4043a1 = ((_0x224bf7 - 0x1) % 0x8) + 0x1,
      _0x558751 = "第" + _0x4a1ae5 + "段溫度";

    let phaseStr = "";
    if (_0x169b1e.y > _0xb633ad.y)
      phaseStr =
        '<span style="color: #ff4d4d; margin-left: 4px;">(升溫)</span>';
    else if (_0x169b1e.y < _0xb633ad.y)
      phaseStr =
        '<span style="color: #aaaaaa; margin-left: 4px;">(自然降溫)</span>';
    else
      phaseStr =
        '<span style="color: #4facfe; margin-left: 4px;">(持溫)</span>';

    const _0x43f5f5 =
        (_0x4a1ae5 === 1
          ? _0x4fb27a === 1
            ? '<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 4px; margin-bottom: 4px;"><div style="font-weight: bold; color: #4facfe; font-size: 1.1em;">程式1</div><div style="font-size: 0.85em; color: #aaa;">程式設定 (數據面板)</div></div>'
            : '<div style="font-weight: bold; color: #4facfe; margin-top: 12px; margin-bottom: 4px; font-size: 1.1em;">程式' +
              _0x4fb27a +
              "</div>"
          : "") +
        _0x558751 +
        ': <span class="editable" style="color: red;"onclick="editTemp(' +
        _0x5dca3d +
        ')">' +
        _0x169b1e.y +
        "</span> °C" +
        phaseStr,
      _0x36d6f8 = document.createElement("div");
    if (_0x5dca3d === _0x4a39cf.length - 0x1) {
      const _0x4104bb = _0x169b1e.x - _0xb633ad.x;
      if (_0x4104bb === 0x0)
        _0x36d6f8.innerHTML =
          _0x43f5f5 +
          "<br>第" +
          _0x4043a1 +
          "段時間" +
          ":\x20<span\x20class=\x22editable\x22\x20style=\x22color:\x20red;\x22onclick=\x22editTime(" +
          (_0x5dca3d - 0x1) +
          ')">END</span>';
      else {
        const _0x3f2b77 = Math.floor(_0x4104bb / 0x3c)
            .toString()
            .padStart(0x2, "0"),
          _0x1253c0 = (_0x4104bb % 0x3c).toString().padStart(0x2, "0");
        _0x36d6f8.innerHTML =
          _0x43f5f5 +
          "<br>第" +
          _0x4043a1 +
          "段時間" +
          ': <span class="editable" style="color: red;"onclick="editTime(' +
          (_0x5dca3d - 0x1) +
          ')">' +
          _0x3f2b77 +
          ":" +
          _0x1253c0 +
          "</span>";
      }
    } else {
      const _0x5123a8 = _0x169b1e.x - _0xb633ad.x,
        _0x4deec2 = Math.floor(_0x5123a8 / 0x3c)
          .toString()
          .padStart(0x2, "0"),
        _0x50e87f = (_0x5123a8 % 0x3c).toString().padStart(0x2, "0");
      _0x36d6f8.innerHTML =
        _0x43f5f5 +
        "<br>第" +
        _0x4043a1 +
        "段時間" +
        ': <span class="editable" style="color: red;"onclick="editTime(' +
        (_0x5dca3d - 0x1) +
        ')">' +
        _0x4deec2 +
        ":" +
        _0x50e87f +
        "</span>";
    }
    _0x4ea68b.appendChild(_0x36d6f8);
  }
}
async function editTemp(_0x5a272c) {
  const _0x4767fa = chart.data.datasets[0x0].data[_0x5a272c],
    _0x58728d = await customPrompt("輸入新的溫度：", _0x4767fa.y);
  _0x58728d !== null &&
    !isNaN(_0x58728d) &&
    ((_0x4767fa.y = parseInt(_0x58728d)),
    chart.update(),
    updateSegmentSummary());
}
async function editTime(_0x4d4461) {
  const _0x4b75d9 = chart.data.datasets[0x0].data,
    _0x3f6437 = _0x4b75d9[_0x4d4461].x,
    _0xdcf3a0 = _0x4b75d9[_0x4d4461 + 0x1].x,
    _0x525dac = _0xdcf3a0 - _0x3f6437,
    _0x37b198 = Math.floor(_0x525dac / 0x3c)
      .toString()
      .padStart(0x2, "0"),
    _0x4898ba = (_0x525dac % 0x3c).toString().padStart(0x2, "0"),
    _0x246927 = await customPrompt(
      "輸入新的時間差 格式(小時:分鐘、小時分鐘、分鐘 或 END)：",
      _0x37b198 + ":" + _0x4898ba,
    );
  if (_0x246927) {
    let _0xf7b1fa = null;
    const _0x6b75db = _0x246927.trim().toUpperCase();
    if (/^\d{1,2}:\d{2}$/.test(_0x6b75db)) {
      const [_0x10b376, _0x113134] = _0x6b75db
        .split(":")
        .map((_0x31c565) => parseInt(_0x31c565));
      _0xf7b1fa = _0x10b376 * 0x3c + _0x113134;
    } else {
      if (/^\d{3,4}$/.test(_0x6b75db)) {
        const _0x402d65 = parseInt(_0x6b75db.slice(0x0, -0x2)),
          _0x430e33 = parseInt(_0x6b75db.slice(-0x2));
        _0xf7b1fa = _0x402d65 * 0x3c + _0x430e33;
      } else {
        if (/^\d+$/.test(_0x6b75db)) _0xf7b1fa = parseInt(_0x6b75db);
        else {
          if (_0x6b75db === "END") {
            ((_0x4b75d9[_0x4d4461 + 0x1].x = _0x4b75d9[_0x4d4461].x),
              (chart.data.datasets[0x0].data = _0x4b75d9.slice(
                0x0,
                _0x4d4461 + 0x2,
              )),
              chart.update(),
              updateSegmentSummary());
            return;
          }
        }
      }
    }
    if (_0xf7b1fa !== null && !isNaN(_0xf7b1fa)) {
      _0x4b75d9[_0x4d4461 + 0x1].x = _0x4b75d9[_0x4d4461].x + _0xf7b1fa;
      chart.update();
      updateSegmentSummary();
    } else {
      await customAlert("輸入格式錯誤，請使用 HH:MM、HHMM、MM 或 END");
    }
  }
}
(Chart.register({
  id: "custom-labels",
  afterDatasetsDraw(chart) {
    drawDistanceLabels();
    if (draggingPoint !== null) {
      const meta = chart.getDatasetMeta(0);
      const pointMeta = meta.data[draggingPoint];
      if (!pointMeta) return;
      const ctx = chart.ctx;
      const x = pointMeta.x;
      const y = pointMeta.y;
      const chartArea = chart.chartArea;

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(239, 68, 68, 0.8)";
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(chartArea.left, y);
      ctx.lineTo(chartArea.right, y);
      ctx.stroke();

      // Axis Badges
      const dataPoint = chart.data.datasets[0].data[draggingPoint];
      ctx.font = "12px 'Inter', sans-serif";

      // Y-axis badge
      ctx.fillStyle = "rgba(239, 68, 68, 1)";
      const yText = dataPoint.y + " °C";
      const yWidth = ctx.measureText(yText).width + 12;
      ctx.fillRect(chartArea.left - yWidth, y - 12, yWidth, 24);
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(yText, chartArea.left - yWidth / 2, y + 1);

      // X-axis badge
      const hours = Math.floor(dataPoint.x / 60);
      const mins = dataPoint.x % 60;
      const xText = (hours > 0 ? hours + "時 " : "") + mins + "分";
      const xWidth = ctx.measureText(xText).width + 16;
      ctx.fillStyle = "rgba(239, 68, 68, 1)";
      ctx.fillRect(x - xWidth / 2, chartArea.bottom, xWidth, 24);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(xText, x, chartArea.bottom + 12);

      ctx.restore();
    }
  },
}),
  document.getElementById("maxTemp").addEventListener("change", (_0x2193f7) => {
    ((maxTemp = parseInt(_0x2193f7.target.value)),
      (chart.options.scales.y.max = maxTemp * 1.1),
      chart.update());
  }),
  document
    .getElementById("timeExtendRate")
    .addEventListener("change", (_0x2e6e82) => {
      timeExtendRate = parseInt(_0x2e6e82.target.value);
    }),
  canvas.addEventListener("wheel", (_0x8e3398) => {
    if (
      _0x8e3398.ctrlKey ||
      _0x8e3398.button === 0x1 ||
      _0x8e3398.deltaY !== 0x0
    ) {
      const _0x439831 = _0x8e3398.deltaY > 0x0 ? 1.1 : 0.9;
      ((chart.options.scales.x.max *= _0x439831),
        chart.update(),
        _0x8e3398.preventDefault());
    }
  }));
const exampleData = {
  example1: [
    { x: 0x0, y: 0x1e },
    { x: 0xb4, y: 0xc8 },
    { x: 0x1a4, y: 0x258 },
    { x: 0x21c, y: 0x384 },
    { x: 0x23a, y: 0x3b6 },
    { x: 0x258, y: 0x3b6 },
    { x: 0x258, y: 0x3b6 },
  ],
  example2: [
    { x: 0x0, y: 0x1e },
    { x: 0x168, y: 0x258 },
    { x: 0x22e, y: 0x44c },
    { x: 0x28e, y: 0x4ec },
    { x: 0x29d, y: 0x4ec },
    { x: 0x29d, y: 0x4ec },
  ],
  example3: [
    { x: 0x0, y: 0x1e },
    { x: 0x168, y: 0x258 },
    { x: 0x1a4, y: 0x258 },
    { x: 0x1a4, y: 0x258 },
  ],
  example4: [
    { x: 0x0, y: 0x1e },
    { x: 0x3c, y: 0x1e },
  ],
};
(document.getElementById("example1").addEventListener("click", () => {
  loadExample("example1");
}),
  document.getElementById("example2").addEventListener("click", () => {
    loadExample("example2");
  }),
  document.getElementById("example3").addEventListener("click", () => {
    loadExample("example3");
  }),
  document.getElementById("example4").addEventListener("click", () => {
    loadExample("example4");
  }),
  document
    .getElementById("outdate")
    .addEventListener("click", () => updateFloatingSummary()));
function updateFloatingSummary() {
  const _0x184a89 = chart.data.datasets[0x0].data;
  let _0x24aeb2 = window.innerWidth <= 0x300;

  let totalItems = 0;
  for (let i = 1; i < _0x184a89.length; i++) {
    if (((i - 1) % 8) + 1 === 1) totalItems++;
    totalItems += 3;
  }
  let desktopCols = Math.ceil(Math.sqrt(totalItems * 1.33));
  if (desktopCols < 4) desktopCols = 4;

  let _0x56825c = document.getElementById("floatingSummary");
  !_0x56825c
    ? ((_0x56825c = document.createElement("div")),
      (_0x56825c.id = "floatingSummary"),
      (_0x56825c.style.position = "fixed"),
      (_0x56825c.style.top = "10px"),
      (_0x56825c.style.right = "10px"),
      (_0x56825c.style.backgroundColor = "#222"),
      (_0x56825c.style.backgroundImage = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"300\" height=\"200\"><text x=\"50%\" y=\"50%\" transform=\"translate(150, 100) rotate(-30) translate(-150, -100)\" fill=\"rgba(255,255,255,0.06)\" font-size=\"24\" font-family=\"sans-serif\" font-weight=\"bold\" letter-spacing=\"4\" text-anchor=\"middle\" dominant-baseline=\"middle\">陽昇電熱有限公司</text></svg>')"),
      (_0x56825c.style.backgroundRepeat = "repeat"),
      (_0x56825c.style.color = "#fff"),
      (_0x56825c.style.padding = "20px"),
      (_0x56825c.style.borderRadius = "12px"),
      (_0x56825c.style.zIndex = "1000"),
      (_0x56825c.style.display = "grid"),
      (_0x56825c.style.gridTemplateColumns = _0x24aeb2
        ? "repeat(3, minmax(0, 1fr))"
        : "repeat(" + desktopCols + ", 120px)"),
      (_0x56825c.style.justifyContent = "center"),
      (_0x56825c.style.width = _0x24aeb2
        ? "calc(100vw - 20px)"
        : "fit-content"),
      (_0x56825c.style.maxWidth = _0x24aeb2 ? "none" : "90vw"),
      (_0x56825c.style.padding = _0x24aeb2 ? "12px" : "20px"),
      (_0x56825c.style.gap = _0x24aeb2 ? "6px" : "12px"),
      (_0x56825c.style.maxHeight = "80vh"),
      (_0x56825c.style.overflowY = "auto"),
      (_0x56825c.style.position = "fixed"),
      (_0x56825c.innerHTML =
        '\n      <div style="grid-column: 1 / -1; text-align: right;">\n        <span id="closeFloatingSummary" style="cursor: pointer; font-size: 18px; font-weight: bold">✕</span>\n      </div>'),
      document.body.appendChild(_0x56825c),
      _0x56825c
        .querySelector("#closeFloatingSummary")
        .addEventListener("click", () => {
          if (_0x56825c.observer) _0x56825c.observer.disconnect();
          _0x56825c.remove();
        }))
    : Array.from(_0x56825c.children).forEach((_0x51e449) => {
        !_0x51e449.querySelector("#closeFloatingSummary") &&
          _0x51e449.className !== "flow-arrows-svg" &&
          _0x56825c.removeChild(_0x51e449);
      });
  for (let _0x102db5 = 0x1; _0x102db5 < _0x184a89.length; _0x102db5++) {
    const _0x1208b3 = _0x184a89[_0x102db5],
      _0x40dbfb = _0x184a89[_0x102db5 - 0x1],
      _0xb3c5f9 = _0x102db5,
      _0x13269e = Math.floor((_0xb3c5f9 - 0x1) / 0x8) + 0x1,
      _0xbf7dba = ((_0xb3c5f9 - 0x1) % 0x8) + 0x1,
      _0x327a50 = ((_0xb3c5f9 - 0x1) % 0x8) + 0x1,
      _0x55810d = ((_0xb3c5f9 - 0x1) % 0x8) + 0x1;
    if (_0xbf7dba === 0x1) {
      const _0xf45822 = createBox("PtN", "" + _0x13269e);
      _0xf45822.dataset.ptn = _0x13269e;
      _0x56825c.appendChild(_0xf45822);
    }
    const _0x54d79c = "SV_" + _0xbf7dba,
      _0x5ea0e6 = "" + _0x1208b3.x,
      _0x1d9106 = "tN_" + _0x327a50,
      _0x4ea9ee = (() => {
        if (_0x102db5 === _0x184a89.length - 0x1) {
          const _0x2f0773 = _0x1208b3.x - _0x40dbfb.x;
          if (_0x2f0773 === 0x0) return "END";
          const _0x307c4b = Math.floor(_0x2f0773 / 0x3c)
              .toString()
              .padStart(0x2, "0"),
            _0x49360e = (_0x2f0773 % 0x3c).toString().padStart(0x2, "0");
          return _0x307c4b + "." + _0x49360e;
        } else {
          const _0x2e87c5 = _0x1208b3.x - _0x40dbfb.x,
            _0x8d9dd7 = Math.floor(_0x2e87c5 / 0x3c)
              .toString()
              .padStart(0x2, "0"),
            _0xc64996 = (_0x2e87c5 % 0x3c).toString().padStart(0x2, "0");
          return _0x8d9dd7 + "." + _0xc64996;
        }
      })(),
      _0x2d4265 = "OUT_" + _0x55810d;
    const _0x22bb98 = "100.0",
      _0x3e56f1 = createBox("SV_" + _0xbf7dba, _0x1208b3.y),
      _0x3d4eff = createBox(_0x1d9106, _0x4ea9ee),
      _0x2bdc4c = createBox(_0x2d4265, _0x22bb98);
      
    _0x3e56f1.dataset.ptn = _0x13269e;
    _0x3d4eff.dataset.ptn = _0x13269e;
    _0x2bdc4c.dataset.ptn = _0x13269e;

    (_0x56825c.appendChild(_0x3e56f1),
      _0x56825c.appendChild(_0x3d4eff),
      _0x56825c.appendChild(_0x2bdc4c));
  }

  if (!_0x56825c.observer) {
    _0x56825c.observer = new ResizeObserver(() => drawFlowArrows(_0x56825c));
    _0x56825c.observer.observe(_0x56825c);
  }
  requestAnimationFrame(() => drawFlowArrows(_0x56825c));
}
const ledDict = {
  0: 63,
  1: 6,
  2: 91,
  3: 79,
  4: 102,
  5: 109,
  6: 125,
  7: 7,
  8: 127,
  9: 111,
  P: 115,
  t: 120,
  T: 120,
  N: 55,
  n: 55,
  M: 43,
  S: 109,
  V: 42,
  U: 62,
  O: 63,
  o: 63,
  E: 121,
  d: 94,
  _: 8,
  "-": 64,
  " ": 0,
};

function parseLEDText(str) {
  if (str === null || str === undefined) str = "";
  // 將特定組合轉為目標字元
  let s = str
    .toString()
    .replace("OUT_", "oUt")
    .replace("tN_", "tM_")
    .replace("PtN", "Ptn")
    .replace("END", "End");

  let blocks = [];
  for (let i = 0; i < s.length; i++) {
    let char = s[i];
    let hasDP = false;
    if (i + 1 < s.length && s[i + 1] === ".") {
      hasDP = true;
      i++; // 跳過小數點
    }
    blocks.push({ char, hasDP });
  }

  // 如果字數不足 4 碼，向左補空白
  while (blocks.length < 4) {
    blocks.unshift({ char: " ", hasDP: false });
  }
  // 確保只取最後 4 碼
  if (blocks.length > 4) {
    blocks = blocks.slice(-4);
  }
  return blocks;
}

function drawSingleLED(block, activeColor) {
  let charCode = ledDict[block.char] !== undefined ? ledDict[block.char] : 0;
  if (block.hasDP) charCode |= 128;

  const offColor = "#1a1a1a";
  const getC = (val) => (charCode & val ? activeColor : offColor);
  const getF = (val) =>
    charCode & val ? `drop-shadow(0 0 4px ${activeColor})` : "none";

  // 以 SVG 繪製七段顯示器
  return `
    <svg viewBox="0 0 100 150" style="width: 23%; max-width: 20px; height: auto; flex-shrink: 0;">
        <!-- A (Top) -->
        <polygon points="22,10 78,10 70,22 30,22" fill="${getC(1)}" style="filter:${getF(1)}; transition: fill 0.2s" />
        <!-- B (Top Right) -->
        <polygon points="80,12 80,68 68,62 68,24" fill="${getC(2)}" style="filter:${getF(2)}; transition: fill 0.2s" />
        <!-- C (Bottom Right) -->
        <polygon points="80,72 80,128 68,116 68,78" fill="${getC(4)}" style="filter:${getF(4)}; transition: fill 0.2s" />
        <!-- D (Bottom) -->
        <polygon points="22,130 78,130 70,118 30,118" fill="${getC(8)}" style="filter:${getF(8)}; transition: fill 0.2s" />
        <!-- E (Bottom Left) -->
        <polygon points="20,72 20,128 32,116 32,78" fill="${getC(16)}" style="filter:${getF(16)}; transition: fill 0.2s" />
        <!-- F (Top Left) -->
        <polygon points="20,12 20,68 32,62 32,24" fill="${getC(32)}" style="filter:${getF(32)}; transition: fill 0.2s" />
        <!-- G (Middle) -->
        <polygon points="22,70 30,64 70,64 78,70 70,76 30,76" fill="${getC(64)}" style="filter:${getF(64)}; transition: fill 0.2s" />
        <!-- DP (Decimal Point) -->
        <circle cx="92" cy="125" r="7" fill="${getC(128)}" style="filter:${getF(128)}; transition: fill 0.2s" />
    </svg>
    `;
}

function createBox(
  _0x414230,
  _0x409eab,
  _0x336e42 = "#ff3430",
  _0x526efd = "#f2ff00",
  _0x45b20b = "#333",
) {
  const container = document.createElement("div");
  container.className = "led-box";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.background = "#000";
  container.style.borderRadius = "8px";
  container.style.borderRadius = "8px";
  container.style.padding = "6px 4px";
  container.style.gap = "6px";
  container.style.width = "100%";
  container.style.maxWidth = "120px";
  container.style.boxSizing = "border-box";
  container.style.boxShadow = "inset 0 0 10px rgba(255,255,255,0.05)";

  const topBlocks = parseLEDText(_0x414230);
  const bottomBlocks = parseLEDText(_0x409eab);

  let topHTML =
    '<div style="display: flex; gap: 2%; justify-content: center; width: 100%;">';
  topBlocks.forEach((b) => (topHTML += drawSingleLED(b, _0x336e42)));
  topHTML += "</div>";

  let bottomHTML =
    '<div style="display: flex; gap: 2%; justify-content: center; width: 100%;">';
  bottomBlocks.forEach((b) => (bottomHTML += drawSingleLED(b, _0x526efd)));
  bottomHTML += "</div>";

  container.innerHTML = topHTML + bottomHTML;
  container.style.position = "relative";
  container.style.cursor = "pointer";
  container.onclick = (e) => {
    let top = String(_0x414230).trim().toUpperCase();
    let bot = String(_0x409eab).trim();
    let ptn = container.dataset.ptn || 1;
    let msg = "";
    
    if (top.includes('PT')) {
      msg = `這代表的是第 ${parseInt(bot) || 1} 個程式\n你也可以改成其他數字`;
    } else if (top.includes('SV') || top.includes('SU')) {
      let num = top.replace(/\D/g, ''); // Extract digits
      msg = `這代表的是第 ${ptn} 個程式的\n第 ${num || 1} 組程式溫度為 ${bot}`;
    } else if (top.includes('TN') || top.includes('TM')) {
      let num = top.replace(/\D/g, '');
      if (bot.toUpperCase() === 'END') {
        msg = `這代表是程式到這邊結束\n進行自然降溫`;
      } else {
        let timeParts = bot.split('.');
        let hr = parseInt(timeParts[0]) || 0;
        let min = parseInt(timeParts[1]) || 0;
        let timeStr = "";
        if (hr > 0 && min > 0) {
          timeStr = `${hr} 小時 ${min} 分鐘`;
        } else if (hr > 0) {
          timeStr = `${hr} 小時`;
        } else {
          timeStr = `${min} 分鐘`;
        }
        msg = `這代表的是第 ${ptn} 個程式的\n第 ${num || 1} 組程式時間為 ${timeStr}`;
      }
    } else if (top.includes('OUT')) {
      msg = `這代表是輸出 ${bot}\n請不要調整這個數值`;
    } else {
      // Fallback
      msg = `標籤：${top}\n數值：${bot}`;
    }

    let existing = document.querySelector('.led-tooltip-floating');
    if (existing) existing.remove();

    let tooltip = document.createElement('div');
    tooltip.className = 'led-tooltip-floating';
    tooltip.innerText = msg;
    // Style as a fixed tooltip to bypass any parent overflow: hidden
    tooltip.style.cssText = "position: fixed; background: rgba(30, 41, 59, 0.95); color: #fff; border: 1px solid #3b82f6; padding: 8px 12px; border-radius: 6px; font-size: 13px; font-weight: normal; white-space: pre; z-index: 20000; pointer-events: none; box-shadow: 0 4px 10px rgba(0,0,0,0.5); text-align: center; line-height: 1.5; transition: opacity 0.3s ease; opacity: 1;";
    
    document.body.appendChild(tooltip);

    // Calculate absolute position
    const rect = container.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    let leftPos = rect.left + rect.width / 2 - tooltipRect.width / 2;
    let topPos = rect.top - tooltipRect.height - 10;
    
    // Prevent clipping off screen edges
    if (leftPos < 10) leftPos = 10;
    if (topPos < 10) topPos = rect.bottom + 10;
    
    tooltip.style.left = leftPos + "px";
    tooltip.style.top = topPos + "px";

    // Fade out and remove after 2.5 seconds
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.style.opacity = '0';
        setTimeout(() => { if (tooltip.parentNode) tooltip.remove(); }, 300);
      }
    }, 2500);
  };
  return container;
}

function drawFlowArrows(container) {
  let svg = container.querySelector(".flow-arrows-svg");
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "flow-arrows-svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "10";

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML =
      '<marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="#fff" /></marker>';
    svg.appendChild(defs);
    container.appendChild(svg);
  }

  svg.style.width = container.scrollWidth + "px";
  svg.style.height = container.scrollHeight + "px";

  Array.from(svg.querySelectorAll("path")).forEach((p) => p.remove());

  const boxes = Array.from(container.querySelectorAll(".led-box"));
  if (boxes.length < 2) return;

  for (let i = 0; i < boxes.length - 1; i++) {
    const boxA = boxes[i];
    const boxB = boxes[i + 1];

    const x1 = boxA.offsetLeft + boxA.offsetWidth + 2;
    const y1 = boxA.offsetTop + boxA.offsetHeight / 2;
    const x2 = boxB.offsetLeft - 2;
    const y2 = boxB.offsetTop + boxB.offsetHeight / 2;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("stroke", "#ffffff");
    path.setAttribute("stroke-opacity", "0.7");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("marker-end", "url(#arrowhead)");

    if (Math.abs(boxA.offsetTop - boxB.offsetTop) < 10) {
      // 同列
      path.setAttribute("d", `M ${x1},${y1} L ${x2},${y2}`);
    } else {
      // 換行折返
      const midY = (boxA.offsetTop + boxA.offsetHeight + boxB.offsetTop) / 2;
      path.setAttribute(
        "d",
        `M ${x1},${y1} L ${x1 + 6},${y1} L ${x1 + 6},${midY} L ${x2 - 6},${midY} L ${x2 - 6},${y2} L ${x2},${y2}`,
      );
    }
    svg.appendChild(path);
  }
}
function loadExample(_0x5b3c3b) {
  const _0x5d08ca = exampleData[_0x5b3c3b];
  if (!_0x5d08ca) return;
  // Deep copy the example data so dragging points doesn't mutate the template
  chart.data.datasets[0x0].data = JSON.parse(JSON.stringify(_0x5d08ca));
  const _0x55745e = Math.max(..._0x5d08ca.map((_0x14c96c) => _0x14c96c.x));
  if (_0x55745e > chart.options.scales.x.max) {
    chart.options.scales.x.max = _0x55745e + timeExtendRate;
  }
  chart.update();
  updateSegmentSummary();
}

document.getElementById("test3").addEventListener("click", startWizard);

function startWizard() {
  let currentStep = 1;
  let wizardData = []; // Array of answers
  let currentTemp = chart.data.datasets[0].data[0].y; // Starts from Ambient temp
  
  // Backup original data in case user cancels
  const originalPoints = JSON.parse(JSON.stringify(chart.data.datasets[0].data));
  const originalXMax = chart.options.scales.x.max;

  // Re-draw chart up to the current step immediately
  function updateLiveChart() {
    const newPoints = [{ x: 0, y: chart.data.datasets[0].data[0].y }];
    let totalTime = 0;
    
    for (let i = 0; i < wizardData.length; i++) {
      const w = wizardData[i];
      if (w.action === 'end') {
        newPoints.push({ x: totalTime, y: newPoints[newPoints.length - 1].y });
        break;
      } else {
        const segmentTime = (w.durationHours || 0) * 60 + (w.durationMins || 0);
        totalTime += segmentTime;
        newPoints.push({ x: totalTime, y: w.targetTemp });
      }
    }
    chart.data.datasets[0].data = newPoints;
    chart.options.scales.x.max = Math.max(totalTime + 60, 120);
    chart.update();
    updateSegmentSummary();
  }

  const isMobile = window.innerWidth <= 1024 || window.innerHeight <= 600;
  const chartCard = document.getElementById("part-chart");

  function closeWizardOverlay() {
    if (overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
  }

  // Create overlay (floating panel or inline card)
  const overlay = document.createElement('div');
  overlay.id = 'wizardOverlay';
  
  if (isMobile && chartCard) {
    // Render as a dedicated card directly above the chart
    Object.assign(overlay.style, {
      position: 'relative',
      width: '100%',
      zIndex: '10',
      background: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      marginBottom: '15px',
      padding: '0' // modal handles padding
    });
    chartCard.parentNode.insertBefore(overlay, chartCard);
    
    // Auto-scroll to wizard
    setTimeout(() => {
      overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  } else {
    Object.assign(overlay.style, {
      position: 'fixed',
      bottom: '20px', right: '20px',
      zIndex: '10000',
      display: 'flex',
      padding: '0'
    });
    document.body.appendChild(overlay);
  }

  const modal = document.createElement('div');
  Object.assign(modal.style, {
    background: isMobile ? 'transparent' : 'rgba(255, 255, 255, 0.95)',
    backdropFilter: isMobile ? 'none' : 'blur(10px)',
    borderRadius: '12px',
    padding: isMobile ? '15px' : '20px',
    width: '100%',
    maxWidth: isMobile ? 'none' : '350px',
    boxShadow: isMobile ? 'none' : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    border: isMobile ? 'none' : '1px solid #e5e7eb',
    fontFamily: "'Noto Sans TC', sans-serif"
  });

  function renderStep() {
    modal.innerHTML = "";
    
    // Header & Context
    const headerRow = document.createElement('div');
    headerRow.style.display = 'flex';
    headerRow.style.justifyContent = 'space-between';
    headerRow.style.alignItems = 'center';
    headerRow.style.marginBottom = '15px';
    
    const header = document.createElement('h2');
    header.style.margin = '0';
    header.style.color = '#1f2937';
    header.style.fontSize = '20px';
    header.innerText = `自動設定 - 第 ${currentStep} 段`;
    headerRow.appendChild(header);

    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕';
    Object.assign(closeBtn.style, { background: 'transparent', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af' });
    closeBtn.onclick = () => {
      closeWizardOverlay();
      chart.data.datasets[0].data = originalPoints;
      chart.options.scales.x.max = originalXMax;
      chart.update();
      updateSegmentSummary();
    };
    headerRow.appendChild(closeBtn);
    modal.appendChild(headerRow);
    
    const context = document.createElement('div');
    context.style.marginBottom = '20px';
    context.style.color = '#4b5563';
    context.style.fontSize = '14px';
    context.innerText = currentStep === 1 ? `起始溫度：${currentTemp} °C (室溫)` : `上一段溫度：${currentTemp} °C`;
    modal.appendChild(context);

    // Initial state for this step
    let selectedAction = wizardData[currentStep - 1] ? wizardData[currentStep - 1].action : null;

    // Action Buttons
    const actionLabel = document.createElement('div');
    actionLabel.style.fontWeight = 'bold'; actionLabel.style.marginBottom = '8px'; actionLabel.innerText = '請選擇動作：';
    modal.appendChild(actionLabel);

    const btnGrid = document.createElement('div');
    btnGrid.style.display = 'grid';
    btnGrid.style.gridTemplateColumns = isMobile ? 'repeat(4, 1fr)' : '1fr 1fr';
    btnGrid.style.gap = '8px';
    btnGrid.style.marginBottom = '20px';

    const actions = [
      { id: 'heat', label: '升溫', color: '#ef4444', offColor: 'rgba(239, 68, 68, 0.4)' },
      { id: 'cool', label: '自然降溫', color: '#9ca3af', offColor: 'rgba(156, 163, 175, 0.4)' },
      { id: 'hold', label: '持溫', color: '#3b82f6', offColor: 'rgba(59, 130, 246, 0.4)' },
      { id: 'end', label: '燒到這裡', color: '#1f2937', offColor: 'rgba(31, 41, 55, 0.4)' }
    ];

    const actionButtons = {};
    
    function createHelpIcon(title, text) {
      const btn = document.createElement('button');
      btn.innerText = '?';
      Object.assign(btn.style, {
        background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '50%',
        width: '20px', height: '20px', marginLeft: '6px', cursor: 'pointer',
        fontSize: '12px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
      });
      btn.onclick = (e) => { e.stopPropagation(); customAlert(`${title}\n\n${text}`); };
      return btn;
    }

    let dynamicInputs = document.createElement('div');
    let tempInput, hrInput, minInput;

    function renderDynamicInputs() {
      dynamicInputs.innerHTML = "";
      if (!selectedAction || selectedAction === 'end') return;

      const needsTemp = selectedAction === 'heat' || selectedAction === 'cool';
      
      if (needsTemp) {
        const row1 = document.createElement('div');
        row1.style.marginBottom = '12px';
        const lbl = document.createElement('label');
        lbl.style.fontWeight = 'bold'; lbl.style.display = 'block'; lbl.style.marginBottom = '4px';
        lbl.innerText = '輸入溫度 (幾度?)';
        lbl.appendChild(createHelpIcon('輸入溫度', '這段時間結束時，窯爐要達到的目標溫度。'));
        row1.appendChild(lbl);
        
        tempInput = document.createElement('input');
        tempInput.type = 'number'; tempInput.placeholder = '例如: 500';
        Object.assign(tempInput.style, { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' });
        if (wizardData[currentStep - 1]) tempInput.value = wizardData[currentStep - 1].targetTemp;
        row1.appendChild(tempInput);
        dynamicInputs.appendChild(row1);
      } else if (selectedAction === 'hold') {
        const rowHold = document.createElement('div');
        rowHold.style.marginBottom = '12px';
        rowHold.style.padding = '12px';
        rowHold.style.backgroundColor = '#f3f4f6';
        rowHold.style.borderRadius = '6px';
        rowHold.style.color = '#374151';
        rowHold.style.fontWeight = 'bold';
        rowHold.innerText = `維持上一段溫度：${currentTemp} °C`;
        dynamicInputs.appendChild(rowHold);
      }

      const row2 = document.createElement('div');
      const lbl2 = document.createElement('label');
      lbl2.style.fontWeight = 'bold'; lbl2.style.display = 'block'; lbl2.style.marginBottom = '4px';
      lbl2.innerText = '時間多久？';
      let timeHelpText = '';
      if (selectedAction === 'heat') {
        timeHelpText = '從上一段溫度走到這個新溫度，總共要經歷多少的時間(過短時間則會以最高速盡可能達到目標)。';
      } else if (selectedAction === 'cool') {
        timeHelpText = '從上一段溫度降到這個溫度，總共要經歷多少的時間(適中的長度會達成緩慢降溫的效果，過短的時間只會完全自然降溫)';
      } else if (selectedAction === 'hold') {
        timeHelpText = '要保持目前溫度多長時間';
      }
      lbl2.appendChild(createHelpIcon('時間多久', timeHelpText));
      row2.appendChild(lbl2);

      const timeFlex = document.createElement('div');
      timeFlex.style.display = 'flex'; timeFlex.style.gap = '8px';
      
      hrInput = document.createElement('input');
      hrInput.type = 'number'; hrInput.placeholder = '小時'; hrInput.min = '0';
      Object.assign(hrInput.style, { flex: '1', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' });
      
      minInput = document.createElement('input');
      minInput.type = 'number'; minInput.placeholder = '分鐘'; minInput.min = '0'; minInput.max = '59';
      Object.assign(minInput.style, { flex: '1', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' });

      if (wizardData[currentStep - 1]) {
        hrInput.value = wizardData[currentStep - 1].durationHours || '';
        minInput.value = wizardData[currentStep - 1].durationMins || '';
      }

      timeFlex.appendChild(hrInput); timeFlex.appendChild(minInput);
      row2.appendChild(timeFlex);
      dynamicInputs.appendChild(row2);
    }

    actions.forEach(act => {
      const btn = document.createElement('button');
      btn.innerText = act.label;
      Object.assign(btn.style, {
        padding: '10px', borderRadius: '8px', border: '2px solid transparent', 
        background: selectedAction === act.id ? act.color : act.offColor,
        cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', 
        color: selectedAction === act.id ? 'white' : '#000000', 
        transition: 'all 0.2s',
        opacity: '1'
      });
      if (selectedAction === act.id) {
        btn.style.borderColor = '#111827';
      }
      btn.onclick = () => {
        selectedAction = act.id;
        Object.keys(actionButtons).forEach(key => { 
          const b = actionButtons[key];
          const a = actions.find(x => x.id === key);
          b.style.background = a.offColor; 
          b.style.borderColor = 'transparent'; 
          b.style.color = '#000000'; // Deep black text for unselected
        });
        btn.style.background = act.color; 
        btn.style.borderColor = '#111827'; 
        btn.style.color = 'white'; // White text for selected
        renderDynamicInputs();
        btnNext.innerText = selectedAction === 'end' ? '完成' : '下一步';
      };
      actionButtons[act.id] = btn;
      btnGrid.appendChild(btn);
    });

    modal.appendChild(btnGrid);
    modal.appendChild(dynamicInputs);
    renderDynamicInputs();

    // Footer buttons
    const footer = document.createElement('div');
    footer.style.display = 'flex';
    footer.style.justifyContent = 'space-between';
    footer.style.marginTop = '20px';

    const btnBack = document.createElement('button');
    btnBack.innerText = currentStep === 1 ? '取消' : '上一步';
    Object.assign(btnBack.style, { padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#f3f4f6', color: '#374151', cursor: 'pointer' });
    btnBack.onclick = () => {
      if (currentStep === 1) {
        closeWizardOverlay();
        // restore original chart
        chart.data.datasets[0].data = originalPoints;
        chart.options.scales.x.max = originalXMax;
        chart.update();
        updateSegmentSummary();
      } else {
        currentStep--;
        wizardData.pop(); // Remove current step to re-evaluate
        currentTemp = currentStep === 1 ? chart.data.datasets[0].data[0].y : wizardData[currentStep - 2].targetTemp;
        updateLiveChart();
        renderStep();
      }
    };

    const btnNext = document.createElement('button');
    btnNext.innerText = selectedAction === 'end' ? '完成' : '下一步';
    Object.assign(btnNext.style, { padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold' });
    
    btnNext.onclick = async () => {
      if (!selectedAction) return customAlert("請先選擇一個動作");

      let tTemp = currentTemp;
      let dHr = 0;
      let dMin = 0;

      if (selectedAction !== 'end') {
        if (selectedAction === 'heat' || selectedAction === 'cool') {
          if (!tempInput.value) return customAlert("請輸入目標溫度");
          tTemp = parseInt(tempInput.value);
          
          if (selectedAction === 'heat' && tTemp <= currentTemp) {
            return customAlert("升溫設定錯誤：目標溫度不能低於或等於上一段溫度（如需維持溫度請選「持溫」）");
          }
          if (selectedAction === 'cool' && tTemp >= currentTemp) {
            return customAlert("降溫設定錯誤：目標溫度不能高於或等於上一段溫度（如需維持溫度請選「持溫」）");
          }
        }
        
        dHr = parseInt(hrInput.value) || 0;
        dMin = parseInt(minInput.value) || 0;

        if (dHr === 0 && dMin === 0) {
          return customAlert("時間不能為 0 小時 0 分鐘");
        }
      }

      wizardData[currentStep - 1] = { action: selectedAction, targetTemp: tTemp, durationHours: dHr, durationMins: dMin };
      updateLiveChart();

      if (selectedAction === 'end') {
        closeWizardOverlay();
        const wantsTutorial = await customConfirm("設定完成！\n\n請問需要給您完整的控制器流程教學嗎？\n您可以按照上面教學在實體控制器上進行設定。", "前往", "不用了");
        if (wantsTutorial) {
          updateFloatingSummary();
        }
      } else {
        currentTemp = tTemp;
        currentStep++;
        renderStep();
      }
    };

    footer.appendChild(btnBack);
    footer.appendChild(btnNext);
    modal.appendChild(footer);
  }

  // Clear existing chart data to start fresh from point 0
  updateLiveChart();

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  renderStep();
}

updateSegmentSummary();
document.getElementById("addSegment").addEventListener("click", () => {
  const _0x53484d = chart.data.datasets[0x0]?.data;
  if (!_0x53484d || _0x53484d.length < 0x2) return;
  const _0x1e7652 = _0x53484d[_0x53484d.length - 0x1],
    _0x234ec9 = _0x53484d[_0x53484d.length - 0x2],
    _0x5b6a69 = _0x1e7652.x - _0x234ec9.x,
    _0x3c548d = _0x1e7652.x + _0x5b6a69,
    _0x383eec = _0x1e7652.y,
    _0x53a2fc = _0x53484d.length,
    _0x4e9905 = (_0x53a2fc % 0x8) + 0x1,
    _0x3eaf9e = "第" + _0x4e9905 + "段";
  
  _0x53484d.push({ x: _0x3c548d, y: _0x383eec, label: _0x3eaf9e });
  if (_0x3c548d > chart.options.scales.x.max) {
    chart.options.scales.x.max += timeExtendRate;
  }
  chart.update();
  updateSegmentSummary();
});
  document.getElementById("removeSegment").addEventListener("click", () => {
    const _0x19abad = chart.data.datasets[0x0]?.data;
    // 至少要保留兩個點（也就是一段），所以 length <= 2 時就不能再刪除
    if (!_0x19abad || _0x19abad.length <= 2) return;
    (_0x19abad.pop(), chart.update(), updateSegmentSummary());
  });
  document.getElementById("restartApp").addEventListener("click", () => {
    location.reload();
  });

// --- Native Chart.js Zoom & Pan Logic ---

const zoomInBtn = document.getElementById("zoomInBtn");
if (zoomInBtn) {
  zoomInBtn.addEventListener("click", () => {
    // 更改為「增加段數」功能
    document.getElementById("addSegment").click();
  });
}

const zoomOutBtn = document.getElementById("zoomOutBtn");
if (zoomOutBtn) {
  zoomOutBtn.addEventListener("click", () => {
    // 更改為「減少段數」功能
    document.getElementById("removeSegment").click();
  });
}

// Middle mouse pan logic (Data Panning)
let isMiddlePanning = false;
let startPanX = 0;
let startXMin = 0;
let startXMax = 0;

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 1) {
    // Middle mouse button
    isMiddlePanning = true;
    startPanX = e.clientX;
    startXMin = chart.options.scales.x.min || 0;
    startXMax = chart.options.scales.x.max;
    canvas.style.cursor = "grabbing";
    e.preventDefault();
  }
});

window.addEventListener("mousemove", (e) => {
  if (isMiddlePanning) {
    const dx = e.clientX - startPanX;
    const pixelsPerMinute = canvas.clientWidth / (startXMax - startXMin);
    const timeShift = -(dx / pixelsPerMinute);

    const newMin = Math.max(0, startXMin + timeShift);
    const actualShift = newMin - startXMin;

    chart.options.scales.x.min = newMin;
    chart.options.scales.x.max = startXMax + actualShift;
    chart.update("none");
    e.preventDefault();
  }
});

window.addEventListener("mouseup", (e) => {
  if (e.button === 1 && isMiddlePanning) {
    isMiddlePanning = false;
    canvas.style.cursor = "default";
  }
});

// Fullscreen Toggle Logic (Hybrid: Native API for Orientation Lock + CSS Fallback)
const fullscreenBtn = document.getElementById("fullscreenBtn");
if (fullscreenBtn) {
  fullscreenBtn.addEventListener("click", () => {
    const isFull = document.body.classList.contains("fullscreen-mode");
    const container = document.getElementById("part-chart");

    if (!isFull) {
      document.body.classList.add("fullscreen-mode");
      fullscreenBtn.textContent = "⛶ 退出全螢幕";

      const tryLock = () => {
        try {
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock("landscape").catch(() => {});
          }
        } catch (e) {}
      };

      if (container.requestFullscreen) {
        container
          .requestFullscreen()
          .then(tryLock)
          .catch(() => {});
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
        tryLock();
      }
    } else {
      document.body.classList.remove("fullscreen-mode");
      fullscreenBtn.textContent = "⛶ 全螢幕";
      // Unlock orientation
      try {
        if (screen.orientation && screen.orientation.unlock) {
          screen.orientation.unlock();
        }
      } catch (err) {}

      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    }

    // Resize chart to fill new container
    setTimeout(() => {
      if (chart) chart.resize();
    }, 100);
  });
}

// Custom Modal Utilities
function customPrompt(titleText, defaultValue = "") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);";
    
    const modal = document.createElement("div");
    modal.style.cssText = "background: #1e293b; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid #334155; text-align: left;";
    
    const title = document.createElement("h3");
    title.style.cssText = "margin: 0 0 16px 0; color: #3b82f6; font-size: 1.25rem;";
    title.textContent = titleText;
    
    const input = document.createElement("input");
    input.type = "text";
    input.value = defaultValue;
    input.style.cssText = "width: 100%; padding: 12px; margin-bottom: 24px; background: #0f172a; border: 1px solid #334155; color: #ffffff; border-radius: 8px; font-size: 1rem; outline: none; box-sizing: border-box;";
    input.onfocus = () => input.style.borderColor = "#3b82f6";
    input.onblur = () => input.style.borderColor = "#334155";
    
    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = "display: flex; justify-content: flex-end; gap: 12px;";
    
    const cancelBtn = document.createElement("button");
    cancelBtn.style.cssText = "background: transparent; color: #f8fafc; border: 1px solid #475569; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 1rem;";
    cancelBtn.textContent = "取消";
    
    const confirmBtn = document.createElement("button");
    confirmBtn.style.cssText = "background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 1rem;";
    confirmBtn.textContent = "確定";
    
    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(confirmBtn);
    modal.appendChild(title);
    modal.appendChild(input);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    input.focus();
    
    const cleanup = () => {
      document.body.removeChild(overlay);
    };
    
    confirmBtn.onclick = () => {
      resolve(input.value);
      cleanup();
    };
    cancelBtn.onclick = () => {
      resolve(null);
      cleanup();
    };
    input.onkeydown = (e) => {
      if (e.key === "Enter") {
        resolve(input.value);
        cleanup();
      }
      if (e.key === "Escape") {
        resolve(null);
        cleanup();
      }
    };
  });
}

function customConfirm(message, confirmText = "確定", cancelText = "取消") {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);";
    
    const modal = document.createElement("div");
    modal.style.cssText = "background: #1e293b; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid #334155; text-align: left;";
    
    const title = document.createElement("h3");
    title.style.cssText = "margin: 0 0 16px 0; color: #3b82f6; font-size: 1.25rem;";
    title.textContent = "提示";
    
    const msg = document.createElement("div");
    msg.style.cssText = "margin-bottom: 24px; font-size: 1.1rem; line-height: 1.5; color: #ffffff !important; white-space: pre-wrap; word-break: break-all; display: block;";
    msg.textContent = message;
    
    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = "display: flex; justify-content: flex-end; gap: 12px;";
    
    const cancelBtn = document.createElement("button");
    cancelBtn.style.cssText = "background: #4b5563; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 1rem;";
    cancelBtn.textContent = cancelText;

    const confirmBtn = document.createElement("button");
    confirmBtn.style.cssText = "background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 1rem;";
    confirmBtn.textContent = confirmText;
    
    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(confirmBtn);
    modal.appendChild(title);
    modal.appendChild(msg);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const cleanup = () => {
      document.body.removeChild(overlay);
    };

    cancelBtn.onclick = () => { resolve(false); cleanup(); };
    confirmBtn.onclick = () => { resolve(true); cleanup(); };
  });
}

function customAlert(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15,23,42,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);";
    
    const modal = document.createElement("div");
    modal.style.cssText = "background: #1e293b; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 1px solid #334155; text-align: left;";
    
    const title = document.createElement("h3");
    title.style.cssText = "margin: 0 0 16px 0; color: #3b82f6; font-size: 1.25rem;";
    title.textContent = "提示";
    
    const msg = document.createElement("div");
    msg.style.cssText = "margin-bottom: 24px; font-size: 1.1rem; line-height: 1.5; color: #ffffff !important; white-space: pre-wrap; word-break: break-all; display: block;";
    msg.textContent = message;
    
    const btnContainer = document.createElement("div");
    btnContainer.style.cssText = "display: flex; justify-content: flex-end;";
    
    const confirmBtn = document.createElement("button");
    confirmBtn.style.cssText = "background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 1rem;";
    confirmBtn.textContent = "確定";
    
    btnContainer.appendChild(confirmBtn);
    modal.appendChild(title);
    modal.appendChild(msg);
    modal.appendChild(btnContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const cleanup = () => {
      document.body.removeChild(overlay);
      window.removeEventListener("keydown", onKey);
    };
    
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        resolve();
        cleanup();
      }
    };
    
    confirmBtn.onclick = () => {
      resolve();
      cleanup();
    };
    window.addEventListener("keydown", onKey);
  });
}

// Auto-scroll to controls on mobile after load
window.addEventListener("load", () => {
  if (window.innerWidth <= 1024) {
    setTimeout(() => {
      const controls = document.getElementById("part-controls");
      if (controls) {
        controls.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300); // slight delay to ensure rendering is complete
  }
});

// Automatically fetch approximate real-world room temperature via IP geolocation
window.fetchedRoomTemp = 30; // fallback default
(async function getRoomTemp() {
  try {
    const geoRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
    const geoData = await geoRes.json();
    if (geoData.latitude && geoData.longitude) {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current_weather=true`);
      const weatherData = await weatherRes.json();
      if (weatherData.current_weather && weatherData.current_weather.temperature) {
        window.fetchedRoomTemp = Math.round(weatherData.current_weather.temperature);
        
        // Update the very first point of the chart if it's still the default 30
        const firstPoint = chart.data.datasets[0].data[0];
        if (firstPoint && firstPoint.y === 30 && firstPoint.x === 0) {
          firstPoint.y = window.fetchedRoomTemp;
          chart.update();
          updateSegmentSummary();
        }
      }
    }
  } catch (err) {
    console.error("無法取得即時室溫", err);
  }
})();

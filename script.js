const ctx = document.getElementById("lineChart").getContext("2d");
let maxTemp = 0x514;
const initialTemp = 0x1e;
let timeExtendRate = 0x3c;
const totalHours = 0x8,
  numPoints = totalHours - 0x6,
  data = Array.from({ length: numPoints }, (_0xc8d9bf, _0x362899) => ({
    x: _0x362899 * 0x3c,
    y: initialTemp,
  })),
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
  const _0x3257ce = chart.getElementsAtEventForMode(
    _0x28c735,
    "nearest",
    { intersect: false, radius: 15 },
    false,
  )[0x0];
  return _0x3257ce ? _0x3257ce.index : null;
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
  const _0x20eeae = autoSnap ? Math.round(rawX / 10) * 10 : Math.floor(rawX),
    _0x27a678 = autoSnap ? Math.round(rawY / 10) * 10 : Math.round(rawY),
    _0x207531 =
      draggingPoint === 0x0
        ? 0x0
        : chart.data.datasets[0x0].data[draggingPoint - 0x1].x + 0x1,
    _0x13366b =
      draggingPoint === chart.data.datasets[0x0].data.length - 0x1
        ? 0x270f
        : chart.data.datasets[0x0].data[draggingPoint + 0x1].x - 0x1,
    _0x2d707e =
      draggingPoint === 0x0
        ? 0x0
        : Math.min(Math.max(_0x20eeae, _0x207531), _0x13366b),
    _0x361784 =
      draggingPoint === 0x0
        ? 0x0
        : Math.min(Math.max(_0x27a678, 0x1e), maxTemp);
  ((chart.data.datasets[0x0].data[draggingPoint] = {
    x: _0x2d707e,
    y: _0x361784,
  }),
    _0x2d707e > chart.options.scales.x.max - 0x1e &&
      (chart.options.scales.x.max += timeExtendRate),
    chart.update("none"),
    updateSegmentSummary());
}
let dragRAF = null;
(canvas.addEventListener("mousedown", (_0x4d60bf) => {
  (_0x4d60bf.preventDefault(), startDrag(_0x4d60bf));
}),
  canvas.addEventListener("mousemove", (_0x4bb382) => {
    _0x4bb382.preventDefault();
    if (dragRAF) cancelAnimationFrame(dragRAF);
    dragRAF = requestAnimationFrame(() => doDrag(_0x4bb382));
  }),
  canvas.addEventListener("mouseup", endDrag),
  (() => {
    let longPressTimer = null;
    let initialPinchDistance = null;
    let touchMode = "none"; // "dragPoint", "panChart", "pinch"
    let lastPanX = 0;

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
  })(),
  canvas.addEventListener("dblclick", (_0x3da710) => {
    const _0x49041f = chart.getElementsAtEventForMode(
      _0x3da710,
      "nearest",
      { intersect: !![] },
      ![],
    )[0x0];
    if (_0x49041f) {
      const _0x340a03 = _0x49041f.index,
        _0x4e4d35 = chart.data.datasets[0x0].data[_0x340a03],
        _0x57a3a4 = prompt("輸入新的溫度：", _0x4e4d35.y);
      _0x57a3a4 !== null &&
        !isNaN(_0x57a3a4) &&
        ((chart.data.datasets[0x0].data[_0x340a03].y = parseInt(_0x57a3a4)),
        chart.update(),
        updateSegmentSummary());
    } else {
      const _0x231d85 = canvas.getBoundingClientRect(),
        _0x41bd2b = _0x3da710.clientX - _0x231d85.left,
        _0x122e69 = _0x3da710.clientY - _0x231d85.top,
        _0x4a94cb = chart.getDatasetMeta(0x0);
      for (
        let _0x5c1c11 = 0x0;
        _0x5c1c11 < _0x4a94cb.data.length - 0x1;
        _0x5c1c11++
      ) {
        const _0x592061 = _0x4a94cb.data[_0x5c1c11],
          _0x1a6f41 = _0x4a94cb.data[_0x5c1c11 + 0x1],
          _0x406be4 = (_0x592061.x + _0x1a6f41.x) / 0x2,
          _0x56ee42 = (_0x592061.y + _0x1a6f41.y) / 0x2;
        if (
          Math.abs(_0x41bd2b - _0x406be4) < 0x14 &&
          Math.abs(_0x122e69 - _0x56ee42) < 0x14
        ) {
          const _0x48762d = chart.data.datasets[0x0].data,
            _0x4bb72f = _0x48762d[_0x5c1c11].x,
            _0x1d5493 = _0x48762d[_0x5c1c11 + 0x1].x,
            _0x5ee0ab = _0x1d5493 - _0x4bb72f,
            _0x24065f = Math.floor(_0x5ee0ab / 0x3c)
              .toString()
              .padStart(0x2, "0"),
            _0xdc25d7 = (_0x5ee0ab % 0x3c).toString().padStart(0x2, "0"),
            _0x1c46f2 = prompt(
              "輸入新的時間差 格式(小時:分鐘、小時分鐘、分鐘 或 END)：",
              _0x24065f + ":" + _0xdc25d7,
            );
          if (_0x1c46f2) {
            let _0x3ed9e2 = null;
            const _0x2a510c = _0x1c46f2.trim().toUpperCase();
            if (/^\d{1,2}:\d{2}$/.test(_0x2a510c)) {
              const [_0x4e7550, _0x544e2a] = _0x2a510c
                .split(":")
                .map((_0x12c347) => parseInt(_0x12c347));
              _0x3ed9e2 = _0x4e7550 * 0x3c + _0x544e2a;
            } else {
              if (/^\d{3,4}$/.test(_0x2a510c)) {
                const _0xac8b64 = parseInt(_0x2a510c.slice(0x0, -0x2)),
                  _0x2b673b = parseInt(_0x2a510c.slice(-0x2));
                _0x3ed9e2 = _0xac8b64 * 0x3c + _0x2b673b;
              } else {
                if (/^\d+$/.test(_0x2a510c)) _0x3ed9e2 = parseInt(_0x2a510c);
                else {
                  if (_0x2a510c === "END") {
                    ((chart.data.datasets[0x0].data = _0x48762d.slice(
                      0x0,
                      _0x5c1c11 + 0x2,
                    )),
                      chart.update(),
                      updateSegmentSummary());
                    break;
                  }
                }
              }
            }
            _0x3ed9e2 !== null && !isNaN(_0x3ed9e2)
              ? ((_0x48762d[_0x5c1c11 + 0x1].x =
                  _0x48762d[_0x5c1c11].x + _0x3ed9e2),
                chart.update(),
                updateSegmentSummary())
              : alert("輸入格式錯誤，請使用 HH:MM、HHMM、MM 或 END");
          }
          break;
        }
      }
    }
  }));
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

    // Label for PV_SV (Node tags)
    if (i > 0) {
      const diffX = dataPoints[i].x - dataPoints[i - 1].x;
      if (diffX > 0) {
        const svIndex = ((i - 1) % 8) + 1;
        const text = "第" + svIndex + "段";
        drawBadge(
          text,
          pointMeta.x,
          pointMeta.y - 25,
          "rgba(37, 99, 235, 0.9)",
          "#ffffff",
        ); // Blue badge
      }
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
function editTemp(_0x5a272c) {
  const _0x4767fa = chart.data.datasets[0x0].data[_0x5a272c],
    _0x58728d = prompt("輸入新的溫度：", _0x4767fa.y);
  _0x58728d !== null &&
    !isNaN(_0x58728d) &&
    ((_0x4767fa.y = parseInt(_0x58728d)),
    chart.update(),
    updateSegmentSummary());
}
function editTime(_0x4d4461) {
  const _0x4b75d9 = chart.data.datasets[0x0].data,
    _0x3f6437 = _0x4b75d9[_0x4d4461].x,
    _0xdcf3a0 = _0x4b75d9[_0x4d4461 + 0x1].x,
    _0x525dac = _0xdcf3a0 - _0x3f6437,
    _0x37b198 = Math.floor(_0x525dac / 0x3c)
      .toString()
      .padStart(0x2, "0"),
    _0x4898ba = (_0x525dac % 0x3c).toString().padStart(0x2, "0"),
    _0x246927 = prompt(
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
    _0xf7b1fa !== null && !isNaN(_0xf7b1fa)
      ? ((_0x4b75d9[_0x4d4461 + 0x1].x = _0x4b75d9[_0x4d4461].x + _0xf7b1fa),
        chart.update(),
        updateSegmentSummary())
      : alert("輸入格式錯誤，請使用\x20HH:MM、HHMM、MM\x20或\x20END");
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
    .addEventListener("click", () => document.getElementById("test3").click()));
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
  (_0x55745e > chart.options.scales.x.max &&
    (chart.options.scales.x.max = _0x55745e + timeExtendRate),
    chart.update(),
    updateSegmentSummary());
}
(document.getElementById("test3").addEventListener("click", () => {
  const _0x3a3b8b = document.getElementById("error-message"),
    _0x1eaf95 = chart.data.datasets[0x0].data;
  if (_0x1eaf95.length < 0x2) {
    _0x3a3b8b.textContent = "資料點不足，無法檢查最後一段時間是否為END";
    return;
  }
  const _0x2ad3e6 = _0x1eaf95.length - 0x1,
    _0x1128c3 = _0x1eaf95[_0x2ad3e6].x - _0x1eaf95[_0x2ad3e6 - 0x1].x;
  if (_0x1128c3 !== 0) {
    const lastPoint = _0x1eaf95[_0x2ad3e6];
    _0x1eaf95.push({ x: lastPoint.x, y: lastPoint.y });
    chart.update();
    updateSegmentSummary();
    _0x3a3b8b.textContent =
      "錯誤!最後一段程式時間必須為END。已為您補上最後一段 END 程式。";
    alert("已自動補上最後一段 END 程式，請按照流程圖輸入進溫度控制器");
    updateFloatingSummary();
  } else {
    _0x3a3b8b.textContent = "";
    alert("程式正確，請按照右邊的流程圖輸入進溫度控制器");
    updateFloatingSummary();
  }
}),
  updateSegmentSummary(),
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
    (_0x53484d.push({ x: _0x3c548d, y: _0x383eec, label: _0x3eaf9e }),
      chart.update(),
      updateSegmentSummary());
  }),
  document.getElementById("removeSegment").addEventListener("click", () => {
    const _0x19abad = chart.data.datasets[0x0]?.data;
    // 至少要保留兩個點（也就是一段），所以 length <= 2 時就不能再刪除
    if (!_0x19abad || _0x19abad.length <= 2) return;
    (_0x19abad.pop(), chart.update(), updateSegmentSummary());
  }),
  document.getElementById("restartApp").addEventListener("click", () => {
    location.reload();
  }));

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

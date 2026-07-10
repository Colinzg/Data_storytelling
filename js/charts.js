/* ================================================================
   charts.js — Chart.js 图表初始化
   📊 数据组编辑区域
   所有图表的创建和配置代码
   配色：午夜蓝 + 金 #e8c564 + 蓝 #6b9fff + 粉 #e8a0bf
   依赖：data.js（数据常量）、Chart.js（CDN）
   ================================================================ */

function initAllCharts() {
    // 全局暗色主题
    Chart.defaults.color = '#8892a6';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family = "'Inter','HarmonyOS Sans SC','Noto Sans SC','PingFang SC',sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(11,17,36,0.95)';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.08)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
    Chart.defaults.plugins.tooltip.titleColor = '#e8ecf4';
    Chart.defaults.plugins.tooltip.bodyColor = '#8892a6';

    initSleepTrend();
    initStudentSleep();
    initNightOwlReasons();
    initGenderGap();
    initAgeSleep();
}

// ---- Chart 1: 睡眠趋势 ----
const sleepTrendShadow = {
    id: 'sleepTrendShadow',
    afterDatasetDraw(chart, args) {
        if (args.index !== 0) return;
        const { ctx } = chart;
        const points = args.meta.data;
        if (!points || points.length < 2) return;

        ctx.save();
        ctx.shadowColor = 'rgba(232,197,100,0.35)';
        ctx.shadowBlur = 14;
        ctx.strokeStyle = 'rgba(232,197,100,0.25)';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            // 模拟 tension 0.4 的平滑曲线
            const prev = points[i - 1];
            const curr = points[i];
            const cp1x = prev.x + (curr.x - prev.x) * 0.4;
            const cp2x = curr.x - (curr.x - prev.x) * 0.4;
            ctx.bezierCurveTo(cp1x, prev.y, cp2x, curr.y, curr.x, curr.y);
        }
        ctx.stroke();
        ctx.restore();
    }
};

function initSleepTrend() {
    const canvas = document.getElementById('chartSleepTrend');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'line',
        plugins: [sleepTrendShadow],
        data: {
            labels: SLEEP_TREND.labels,
            datasets: [{
                label: '中国人均睡眠时长（小时）',
                data: SLEEP_TREND.chinaSleep,
                borderColor: '#e8c564',
                backgroundColor: function(ctx) {
                    if (!ctx.chart.chartArea) return 'rgba(232,197,100,0.06)';
                    const { top, bottom } = ctx.chart.chartArea;
                    const gradient = ctx.chart.ctx.createLinearGradient(0, top, 0, bottom);
                    gradient.addColorStop(0, 'rgba(232,197,100,0.18)');
                    gradient.addColorStop(1, 'rgba(232,197,100,0)');
                    return gradient;
                },
                borderWidth: 2, fill: true, tension: 0.4,
                pointBackgroundColor: '#e8c564',
                pointBorderColor: 'rgba(4,8,16,0.8)',
                pointBorderWidth: 2,
                pointRadius: 4, pointHoverRadius: 7,
            }, {
                label: 'WHO推荐成人睡眠（小时）',
                data: SLEEP_TREND.whoRecommend,
                borderColor: 'rgba(255,255,255,0.25)',
                borderDash: [6, 4], borderWidth: 1,
                fill: false, pointRadius: 0,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '中国居民平均睡眠时间持续下降', color: '#e8c564', font: { size: 14, weight: '500' } },
                legend: { labels: { usePointStyle: true, padding: 20, boxWidth: 8 } }
            },
            scales: {
                y: {
                    min: 6, max: 9,
                    ticks: { callback: v => v + 'h', color: '#8892a6' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                x: { grid: { display: false }, ticks: { color: '#8892a6' } }
            }
        }
    });
}

// ---- Chart 2: 学生睡眠 vs 推荐 ----
const barLabelPlugin = {
    id: 'barLabelPlugin',
    afterDatasetsDraw(chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, dsIdx) => {
            const meta = chart.getDatasetMeta(dsIdx);
            if (!meta || meta.hidden) return;
            ctx.save();
            ctx.font = 'bold 11px Inter, "HarmonyOS Sans SC", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillStyle = dataset.borderColor;
            meta.data.forEach((bar, i) => {
                const v = dataset.data[i];
                ctx.fillText(v + 'h', bar.x, bar.y - 4);
            });
            ctx.restore();
        });
    }
};

function initStudentSleep() {
    const canvas = document.getElementById('chartStudentSleep');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'bar',
        plugins: [barLabelPlugin],
        data: {
            labels: STUDENT_SLEEP.labels,
            datasets: [{
                label: '推荐睡眠时间',
                data: STUDENT_SLEEP.recommended,
                backgroundColor: 'rgba(232,197,100,0.35)',
                borderColor: '#e8c564', borderWidth: 1, borderRadius: 6, borderSkipped: false,
            }, {
                label: '实际睡眠时间',
                data: STUDENT_SLEEP.actual,
                backgroundColor: 'rgba(107,159,255,0.35)',
                borderColor: '#6b9fff', borderWidth: 1, borderRadius: 6, borderSkipped: false,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '各学段睡眠时间：推荐 vs 实际', color: '#e8c564', font: { size: 14, weight: '500' } },
                tooltip: {
                    callbacks: {
                        title: items => items[0] ? items[0].label : '',
                        label: ctx => {
                            const insights = [
                                '推荐 10h，实际 8.5h——睡眠缺口从童年就开始了',
                                '推荐 9h，实际 7.2h——青春期撞上升学压力，缺口拉大到近两小时',
                                '推荐 8h，实际 6.5h——卷子和困意，在深夜同时亮着',
                                '推荐 8h，实际 7.0h——大学稍好，但手机成了新的睡眠杀手',
                            ];
                            return insights[ctx.dataIndex] || '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0, max: 12,
                    ticks: { callback: v => v + 'h', color: '#8892a6' },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                x: { grid: { display: false }, ticks: { color: '#8892a6' } }
            }
        }
    });
}

// ---- Chart 3: 熬夜原因（饼图 + 引导线标注） ----
const leaderLinePlugin = {
    id: 'leaderLines',
    afterDraw(chart) {
        const ctx = chart.ctx;
        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data.length) return;

        const dataset = chart.data.datasets[0];
        const labels = chart.data.labels;
        const total = dataset.data.reduce((a, b) => a + b, 0);

        ctx.save();
        ctx.font = '12px Inter, "HarmonyOS Sans SC", sans-serif';
        ctx.textBaseline = 'middle';

        meta.data.forEach((arc, i) => {
            const value = dataset.data[i];
            const label = labels[i];
            const pct = ((value / total) * 100).toFixed(1);
            const text = `${label}  ${pct}%`;

            const angle = (arc.startAngle + arc.endAngle) / 2;
            const outerR = arc.outerRadius;
            const midR = (arc.innerRadius + arc.outerRadius) / 2;

            // 起点：圆环中间
            const sx = arc.x + Math.cos(angle) * midR;
            const sy = arc.y + Math.sin(angle) * midR;

            // 转折点：外侧偏外
            const pr = outerR + 18;
            const px = arc.x + Math.cos(angle) * pr;
            const py = arc.y + Math.sin(angle) * pr;

            // 横向延伸方向
            const isRight = Math.cos(angle) >= -0.1;
            const hLen = isRight ? 70 : -70;

            // 画引导线：先斜出，再横折
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(px, py);
            ctx.lineTo(px + hLen, py);
            ctx.strokeStyle = dataset.backgroundColor[i];
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // 端点小圆点
            ctx.beginPath();
            ctx.arc(px + hLen, py, 3, 0, 2 * Math.PI);
            ctx.fillStyle = dataset.backgroundColor[i];
            ctx.fill();

            // 文字
            ctx.fillStyle = '#c0c8d4';
            if (isRight) {
                ctx.textAlign = 'left';
                ctx.fillText(text, px + hLen + 10, py);
            } else {
                ctx.textAlign = 'right';
                ctx.fillText(text, px + hLen - 10, py);
            }
        });

        ctx.restore();
    }
};

function initNightOwlReasons() {
    const canvas = document.getElementById('chartNightOwlReasons');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'doughnut',
        plugins: [leaderLinePlugin],
        data: {
            labels: NIGHT_OWL_REASONS.labels,
            datasets: [{
                data: NIGHT_OWL_REASONS.data,
                backgroundColor: [
                    '#6b9fff', '#e8c564', '#e8a0bf',
                    'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)',
                ],
                borderColor: '#040810', borderWidth: 2,
                hoverBorderColor: 'rgba(255,255,255,0.08)',
                rotation: 90,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '60%',
            layout: { padding: { top: 30, bottom: 30, left: 100, right: 80 } },
            plugins: {
                title: { display: false },
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: () => '',
                        label: ctx => {
                            const insights = {
                                '娱乐/刷手机': '近一半人睡前在刷手机——屏幕蓝光抑制褪黑素分泌，越刷越清醒',
                                '学业/工作': '28% 的人因工作学习挤压睡眠，白天和夜晚的边界越来越模糊',
                                '焦虑/失眠': '18% 的人即使放下手机，脑子也停不下来',
                                '社交': '深夜社交——不想错过消息，却错过了睡眠',
                                '其他': '还有些人说不清为什么熬夜，也许只是不想结束今天',
                            };
                            return insights[ctx.label] || '';
                        }
                    }
                }
            }
        }
    });
}

// ---- Chart 4: 性别睡眠差异（哑铃图） ----
function initGenderGap() {
    const container = document.getElementById('genderCompare');
    if (!container) return;

    const d = GENDER_SLEEP_GAP;
    const metrics = [
        { label: '睡眠困扰率', unit: '%', f: d.female[0], m: d.male[0], min: 40, max: 55 },
        { label: '平均睡眠时长', unit: 'h', f: d.female[1], m: d.male[1], min: 6.5, max: 7.5 },
        { label: '家务劳动时间', unit: 'h/天', f: d.female[2], m: d.male[2], min: 1, max: 4 },
        { label: '入睡时间', unit: '时', f: d.female[3], m: d.male[3], min: 23, max: 24.2 },
    ];

    let html = '<div class="gc-legend"><span><i class="dot f"></i> 女性 ♀</span><span><i class="dot m"></i> 男性 ♂</span></div>';
    metrics.forEach(m => {
        const range = m.max - m.min;
        const fPct = ((m.f - m.min) / range) * 100;
        const mPct = ((m.m - m.min) / range) * 100;
        const leftPct = Math.min(fPct, mPct);
        const rightPct = Math.max(fPct, mPct);

        html += `<div class="gc-row">
            <div class="gc-label">${m.label}</div>
            <div class="gc-left-val">${m.f}<span class="gc-unit"> ${m.unit}</span></div>
            <div class="gc-track">
                <div class="gc-line" style="left:${leftPct}%;right:${100 - rightPct}%"></div>
                <div class="gc-dot female" style="left:${fPct}%"></div>
                <div class="gc-dot male"   style="left:${mPct}%"></div>
            </div>
            <div class="gc-right-val">${m.m}<span class="gc-unit"> ${m.unit}</span></div>
        </div>`;
    });
    container.innerHTML = html;
}

// ---- Chart 5: 各年龄段 ----
function initAgeSleep() {
    const canvas = document.getElementById('chartAgeSleep');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: AGE_SLEEP.labels,
            datasets: [{
                label: '睡眠困扰率 (%)',
                data: AGE_SLEEP.disturbRate,
                borderColor: '#e8c564',
                backgroundColor: 'rgba(232,197,100,0.04)',
                borderWidth: 2, fill: true, tension: 0.4,
                pointBackgroundColor: '#e8c564',
                pointBorderColor: 'rgba(4,8,16,0.8)',
                pointBorderWidth: 2,
                pointRadius: 4,
                yAxisID: 'y',
            }, {
                label: '平均睡眠时长 (小时)',
                data: AGE_SLEEP.avgHours,
                borderColor: '#6b9fff',
                backgroundColor: 'rgba(107,159,255,0.04)',
                borderWidth: 2, fill: true, tension: 0.4,
                pointBackgroundColor: '#6b9fff',
                pointBorderColor: 'rgba(4,8,16,0.8)',
                pointBorderWidth: 2,
                pointRadius: 4,
                yAxisID: 'y1',
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: '各年龄段睡眠困扰率与睡眠时长', color: '#e8c564', font: { size: 14, weight: '500' } }
            },
            scales: {
                y: {
                    type: 'linear', display: true, position: 'left',
                    min: 30, max: 55,
                    title: { display: true, text: '睡眠困扰率 (%)', color: '#e8c564' },
                    ticks: { color: '#8892a6' },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                },
                y1: {
                    type: 'linear', display: true, position: 'right',
                    min: 6, max: 8,
                    title: { display: true, text: '睡眠时长 (小时)', color: '#6b9fff' },
                    ticks: { color: '#8892a6' },
                    grid: { drawOnChartArea: false },
                },
                x: { grid: { display: false }, ticks: { color: '#8892a6' } }
            }
        }
    });
}

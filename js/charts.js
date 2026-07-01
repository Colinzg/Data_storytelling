/* ================================================================
   charts.js — Chart.js 图表初始化
   📊 数据组编辑区域
   所有图表的创建和配置代码
   依赖：data.js（数据常量）、Chart.js（CDN）
   ================================================================ */

function initAllCharts() {
    // 全局配置
    Chart.defaults.color = '#8a9bb5';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';
    Chart.defaults.font.family = "'PingFang SC','Microsoft YaHei',sans-serif";

    initSleepTrend();
    initStudentSleep();
    initNightOwlReasons();
    initGenderGap();
    initAgeSleep();
}

// ---- Chart 1: 睡眠趋势 ----
function initSleepTrend() {
    const canvas = document.getElementById('chartSleepTrend');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: SLEEP_TREND.labels,
            datasets: [{
                label: '中国人均睡眠时长（小时）',
                data: SLEEP_TREND.chinaSleep,
                borderColor: '#f5d67b',
                backgroundColor: 'rgba(245,214,123,0.08)',
                borderWidth: 2.5, fill: true, tension: 0.4,
                pointBackgroundColor: '#f5d67b',
                pointRadius: 5, pointHoverRadius: 8,
            }, {
                label: 'WHO推荐成人睡眠（小时）',
                data: SLEEP_TREND.whoRecommend,
                borderColor: 'rgba(110,198,202,0.5)',
                borderDash: [8, 4], borderWidth: 1.5,
                fill: false, pointRadius: 0,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '中国居民平均睡眠时间持续下降', color: '#f5d67b', font: { size: 15 } },
                legend: { labels: { usePointStyle: true, padding: 20 } }
            },
            scales: {
                y: { min: 6, max: 9, ticks: { callback: v => v + 'h' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// ---- Chart 2: 学生睡眠 vs 推荐 ----
function initStudentSleep() {
    const canvas = document.getElementById('chartStudentSleep');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: STUDENT_SLEEP.labels,
            datasets: [{
                label: '推荐睡眠时间',
                data: STUDENT_SLEEP.recommended,
                backgroundColor: 'rgba(245,214,123,0.5)',
                borderColor: '#f5d67b', borderWidth: 1.5, borderRadius: 4,
            }, {
                label: '实际睡眠时间',
                data: STUDENT_SLEEP.actual,
                backgroundColor: 'rgba(91,141,239,0.5)',
                borderColor: '#5b8def', borderWidth: 1.5, borderRadius: 4,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '各学段睡眠时间：推荐 vs 实际', color: '#f5d67b', font: { size: 15 } }
            },
            scales: {
                y: { min: 0, max: 12, ticks: { callback: v => v + 'h' }, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// ---- Chart 3: 熬夜原因 ----
function initNightOwlReasons() {
    const canvas = document.getElementById('chartNightOwlReasons');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: NIGHT_OWL_REASONS.labels,
            datasets: [{
                data: NIGHT_OWL_REASONS.data,
                backgroundColor: [
                    'rgba(91,141,239,0.7)', 'rgba(110,198,202,0.7)',
                    'rgba(245,214,123,0.7)', 'rgba(150,180,210,0.5)',
                    'rgba(100,120,150,0.4)',
                ],
                borderColor: 'rgba(10,14,26,0.8)', borderWidth: 2,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '熬夜原因分布', color: '#f5d67b', font: { size: 15 } },
                legend: { position: 'bottom', labels: { padding: 15 } }
            }
        }
    });
}

// ---- Chart 4: 性别睡眠差异 ----
function initGenderGap() {
    const canvas = document.getElementById('chartGenderGap');
    if (!canvas) return;
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: GENDER_SLEEP_GAP.labels,
            datasets: [{
                label: '女性',
                data: GENDER_SLEEP_GAP.female,
                backgroundColor: 'rgba(245,214,123,0.6)',
                borderColor: '#f5d67b', borderWidth: 1.5, borderRadius: 4,
            }, {
                label: '男性',
                data: GENDER_SLEEP_GAP.male,
                backgroundColor: 'rgba(91,141,239,0.6)',
                borderColor: '#5b8def', borderWidth: 1.5, borderRadius: 4,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '睡眠性别差异：看不见的"第二班"', color: '#f5d67b', font: { size: 15 } }
            },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });
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
                borderColor: '#f5d67b',
                backgroundColor: 'rgba(245,214,123,0.06)',
                borderWidth: 2.5, fill: true, tension: 0.4,
                pointBackgroundColor: '#f5d67b', pointRadius: 5,
                yAxisID: 'y',
            }, {
                label: '平均睡眠时长 (小时)',
                data: AGE_SLEEP.avgHours,
                borderColor: '#5b8def',
                backgroundColor: 'rgba(91,141,239,0.06)',
                borderWidth: 2.5, fill: true, tension: 0.4,
                pointBackgroundColor: '#5b8def', pointRadius: 5,
                yAxisID: 'y1',
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: '各年龄段睡眠困扰率与睡眠时长', color: '#f5d67b', font: { size: 15 } }
            },
            scales: {
                y: {
                    type: 'linear', display: true, position: 'left',
                    min: 30, max: 55,
                    title: { display: true, text: '睡眠困扰率 (%)', color: '#f5d67b' },
                    grid: { color: 'rgba(255,255,255,0.04)' },
                },
                y1: {
                    type: 'linear', display: true, position: 'right',
                    min: 6, max: 8,
                    title: { display: true, text: '睡眠时长 (小时)', color: '#5b8def' },
                    grid: { drawOnChartArea: false },
                },
                x: { grid: { display: false } }
            }
        }
    });
}

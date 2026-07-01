/* ================================================================
   main.js — 场景加载器 & 滚动动画
   🧑‍💼 协调员编辑区域
   封面、家庭介绍、转场、图表、结尾、页脚 → 已在 index.html 中
   五个场景组件 → 从此处动态加载
   ================================================================ */

// ---- 场景组件映射表 ----
const COMPONENTS = [
    { id: 'comp-scene-son',        file: 'components/scene-son.html' },
    { id: 'comp-scene-daughter',   file: 'components/scene-daughter.html' },
    { id: 'comp-scene-parents',    file: 'components/scene-parents.html' },
    { id: 'comp-scene-grandma',    file: 'components/scene-grandma.html' },
    { id: 'comp-scene-morning',    file: 'components/scene-morning.html' },
];

// ---- 页面初始化 ----
async function initPage() {
    // 并行加载所有场景组件
    const loadPromises = COMPONENTS.map(comp => loadComponent(comp.id, comp.file));
    await Promise.all(loadPromises);

    // 隐藏加载提示
    const loading = document.getElementById('page-loading');
    if (loading) loading.classList.add('hidden');

    // 初始化图表（charts.js）
    if (typeof initAllCharts === 'function') {
        initAllCharts();
    }

    // 初始化滚动动画
    initScrollAnimations();
}

// ---- 加载单个场景组件 ----
async function loadComponent(placeholderId, filePath) {
    const placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
        console.warn('找不到占位元素:', placeholderId);
        return;
    }
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        placeholder.outerHTML = html;
    } catch (err) {
        console.error('场景加载失败:', filePath, err);
        placeholder.innerHTML = `<p style="color:#8a9bb5;text-align:center;padding:2rem;">⚠️ 场景加载失败：${filePath}<br><small>请确认通过 http://localhost 访问，而非双击打开文件</small></p>`;
    }
}

// ---- 滚动淡入动画 ----
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // 初始可见元素立即触发
    document.querySelectorAll('.fade-in').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            el.classList.add('visible');
        }
    });
}

// ---- 启动 ----
document.addEventListener('DOMContentLoaded', initPage);

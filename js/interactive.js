/* ================================================================
   interactive.js — 睡眠自测互动模块
   包含：题目数据、答题交互、结果匹配、滚动跳转、AI预留函数
   ================================================================ */

(function () {
    'use strict';

    // ============ 题目数据 ============
    var QUESTIONS = [
        {
            id: 'age',
            question: '你的年龄段是？',
            options: [
                { label: '青少年（18岁以下）', value: '青少年' },
                { label: '青年（18-30岁）', value: '青年' },
                { label: '中年（31-50岁）', value: '中年' },
                { label: '老年（50岁以上）', value: '老年' }
            ]
        },
        {
            id: 'sleepTrouble',
            question: '最困扰你的睡眠问题是？',
            options: [
                { label: '入睡困难，躺很久睡不着', value: '入睡困难' },
                { label: '睡眠浅，夜间频繁惊醒', value: '睡眠浅' },
                { label: '早醒，醒后无法再次入睡', value: '早醒' },
                { label: '整体睡眠时间严重不足', value: '睡眠不足' }
            ]
        },
        {
            id: 'beforeSleepAct',
            question: '睡前1小时你主要行为？',
            options: [
                { label: '学习/加班处理工作', value: '学习加班' },
                { label: '刷手机、短视频、打游戏', value: '刷手机' },
                { label: '做家务、照顾家人', value: '家务照顾' },
                { label: '胡思乱想、焦虑内耗', value: '焦虑内耗' }
            ]
        },
        {
            id: 'rootCause',
            question: '你认为影响睡眠的核心根源？',
            options: [
                { label: '学业压力大', value: '学业压力' },
                { label: '报复性刷电子屏幕不想入睡', value: '报复性刷电子屏幕不想入睡' },
                { label: '工作压力大', value: '工作压力' },
                { label: '家庭琐事、长期操心家人', value: '家庭琐事、长期操心家人' },
                { label: '年龄增长导致睡眠能力下降', value: '年龄增长导致睡眠能力下降' }
            ]
        }
    ];

    // ============ 匹配规则（前端写死） ============
    var MATCH_LIST = [
        {
            key: '学业压力',
            familyMember: '儿子',
            thiefLabel: '学业压力',
            sceneClass: '.scene-son',
            roleDesc: '16岁 · 高中生',
            desc: '调研显示高中生推荐睡眠不少于8小时，学业是青少年睡眠不足首要诱因',
            avatarSvg: '<svg width="72" height="72" viewBox="0 0 72 72"><ellipse cx="36" cy="24" rx="24" ry="18" fill="#2a1a0a"/><path d="M16 30 Q20 18 36 16 Q52 18 56 30" fill="#2a1a0a"/><ellipse cx="36" cy="34" rx="19" ry="18" fill="#e8d0b0"/><circle cx="29" cy="32" r="2.8" fill="#2a1808"/><circle cx="43" cy="32" r="2.8" fill="#2a1808"/><path d="M31 41 Q36 38 41 41" stroke="#b09080" stroke-width="1.5" fill="none"/></svg>'
        },
        {
            key: '报复性刷电子屏幕不想入睡',
            familyMember: '姐姐',
            thiefLabel: '电子屏幕',
            sceneClass: '.scene-daughter',
            roleDesc: '21岁 · 大学生',
            desc: '全国21%人群因睡前长期使用电子设备，大幅降低睡眠质量',
            avatarSvg: '<svg width="72" height="72" viewBox="0 0 72 72"><ellipse cx="36" cy="28" rx="24" ry="22" fill="#1a1a2a"/><rect x="12" y="28" width="48" height="30" rx="6" fill="#1a1a2a"/><ellipse cx="36" cy="34" rx="19" ry="17" fill="#f0dcc5"/><circle cx="29" cy="33" r="2.8" fill="#1a0a05"/><circle cx="43" cy="33" r="2.8" fill="#1a0a05"/><path d="M29 40 Q36 45 43 40" stroke="#c09880" stroke-width="1.5" fill="none"/></svg>'
        },
        {
            key: '工作压力',
            familyMember: '父亲',
            thiefLabel: '工作压力',
            sceneClass: '.scene-parents',
            roleDesc: '45岁 · 公司中层',
            desc: '22%受访者将职场压力列为阻碍优质睡眠的核心因素',
            avatarSvg: '<svg width="72" height="72" viewBox="0 0 72 72"><ellipse cx="36" cy="22" rx="25" ry="16" fill="#3a3a3a"/><rect x="10" y="22" width="52" height="14" rx="7" fill="#3a3a3a"/><ellipse cx="36" cy="34" rx="22" ry="20" fill="#e0c8a8"/><circle cx="28" cy="31" r="2.8" fill="#3a2210"/><circle cx="44" cy="31" r="2.8" fill="#3a2210"/><path d="M30 42 Q36 44 42 42" stroke="#b09080" stroke-width="1.5" fill="none"/></svg>'
        },
        {
            key: '家庭琐事、长期操心家人',
            familyMember: '母亲',
            thiefLabel: '家庭负担',
            sceneClass: '.scene-parents',
            roleDesc: '42岁 · 教师',
            desc: '女性受家庭责任影响睡眠的比例显著高于男性，双重负担加剧失眠',
            avatarSvg: '<svg width="72" height="72" viewBox="0 0 72 72"><ellipse cx="36" cy="26" rx="26" ry="20" fill="#5a3a2a"/><rect x="10" y="26" width="52" height="28" rx="8" fill="#5a3a2a"/><ellipse cx="36" cy="34" rx="20" ry="18" fill="#f0dcc0"/><circle cx="29" cy="33" r="2.5" fill="#3a2210"/><circle cx="43" cy="33" r="2.5" fill="#3a2210"/><path d="M30 41 Q36 45 42 41" stroke="#c09888" stroke-width="1.5" fill="none"/></svg>'
        },
        {
            key: '年龄增长导致睡眠能力下降',
            familyMember: '外婆',
            thiefLabel: '年龄增长',
            sceneClass: '.scene-grandma',
            roleDesc: '67岁 · 退休',
            desc: '66岁以上人群平均夜间清醒2.21次，早醒、浅眠为老年普遍问题',
            avatarSvg: '<svg width="72" height="72" viewBox="0 0 72 72"><ellipse cx="36" cy="28" rx="24" ry="22" fill="#8a8a9a"/><ellipse cx="36" cy="18" rx="14" ry="10" fill="#9a9aaa"/><ellipse cx="36" cy="34" rx="20" ry="18" fill="#e8d5c0"/><circle cx="29" cy="33" r="2.5" fill="#3a2a1a"/><circle cx="43" cy="33" r="2.5" fill="#3a2a1a"/><path d="M29 40 Q36 46 43 40" stroke="#c0a090" stroke-width="1.5" fill="none"/></svg>'
        }
    ];

    // ============ 状态变量 ============
    var currentIndex = 0;
    var userAnswers = {};
    var matchedResult = null;

    // ============ DOM 元素引用 ============
    function getEl(id) { return document.getElementById(id); }

    // ============ 初始化问卷 ============
    function initQuiz() {
        var container = getEl('quiz-container');
        if (!container) {
            setTimeout(initQuiz, 300);
            return;
        }

        currentIndex = 0;
        userAnswers = {};
        matchedResult = null;

        renderQuestion(currentIndex);
        bindNavEvents();
    }

    // ============ 渲染题目 ============
    function renderQuestion(index) {
        var q = QUESTIONS[index];
        var questionEl = getEl('quiz-question');
        var optionsEl = getEl('quiz-options');
        var progressText = getEl('quiz-progress-text');
        var progressBar = getEl('quiz-progress-bar');
        var backBtn = getEl('quiz-btn-back');
        var questionArea = getEl('quiz-question-area');

        // 淡出再淡入动画
        questionArea.classList.remove('quiz-fade-in');
        void questionArea.offsetWidth;
        questionArea.classList.add('quiz-fade-in');

        // 更新进度
        progressText.textContent = '第 ' + (index + 1) + ' 题 / 共 ' + QUESTIONS.length + ' 题';
        progressBar.style.width = ((index + 1) / QUESTIONS.length * 100) + '%';

        // 更新题目
        questionEl.textContent = q.question;

        // 渲染选项
        optionsEl.innerHTML = '';
        q.options.forEach(function (opt) {
            var btn = document.createElement('button');
            btn.className = 'quiz-option';
            btn.textContent = opt.label;
            btn.setAttribute('data-value', opt.value);
            btn.setAttribute('data-id', q.id);

            // 恢复已选高亮
            if (userAnswers[q.id] === opt.value) {
                btn.classList.add('selected');
            }

            btn.addEventListener('click', function () {
                handleOptionClick(q.id, opt.value, btn);
            });
            optionsEl.appendChild(btn);
        });

        // 返回按钮
        backBtn.style.visibility = index > 0 ? 'visible' : 'hidden';
    }

    // ============ 选项点击处理 ============
    function handleOptionClick(questionId, value, btnEl) {
        userAnswers[questionId] = value;

        var siblings = btnEl.parentElement.querySelectorAll('.quiz-option');
        siblings.forEach(function (s) { s.classList.remove('selected'); });
        btnEl.classList.add('selected');

        setTimeout(function () {
            if (currentIndex < QUESTIONS.length - 1) {
                currentIndex++;
                renderQuestion(currentIndex);
            } else {
                showResult();
            }
        }, 400);
    }

    // ============ 导航按钮事件 ============
    function bindNavEvents() {
        var backBtn = getEl('quiz-btn-back');
        var jumpBtn = getEl('quiz-btn-jump');
        var aiBtn = getEl('quiz-btn-ai');
        var retryBtn = getEl('quiz-btn-retry');

        if (backBtn._bound) return;
        backBtn._bound = true;

        backBtn.addEventListener('click', function () {
            if (currentIndex > 0) {
                currentIndex--;
                renderQuestion(currentIndex);
            }
        });

        jumpBtn.addEventListener('click', function () {
            if (matchedResult) {
                var target = document.querySelector(matchedResult.sceneClass);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });

        aiBtn.addEventListener('click', function () {
            var userSelectInfo = {
                age: userAnswers['age'] || '',
                sleepTrouble: userAnswers['sleepTrouble'] || '',
                beforeSleepAct: userAnswers['beforeSleepAct'] || '',
                rootCause: userAnswers['rootCause'] || ''
            };
            fetchSleepAdvice(userSelectInfo);
        });

        retryBtn.addEventListener('click', function () {
            getEl('quiz-result').style.display = 'none';
            getEl('quiz-container').style.display = 'block';
            currentIndex = 0;
            userAnswers = {};
            matchedResult = null;
            getEl('ai-advice-box').innerHTML = '';
            renderQuestion(0);
            var section = getEl('interactive-quiz-section');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    // ============ 结果匹配逻辑 ============
    function findMatch(rootCause) {
        for (var i = 0; i < MATCH_LIST.length; i++) {
            if (MATCH_LIST[i].key === rootCause) {
                return MATCH_LIST[i];
            }
        }
        return MATCH_LIST[0];
    }

    // ============ 显示结果 ============
    function showResult() {
        var rootCause = userAnswers['rootCause'] || '';
        matchedResult = findMatch(rootCause);

        getEl('quiz-container').style.display = 'none';
        var resultEl = getEl('quiz-result');
        resultEl.style.display = 'block';

        getEl('result-title').textContent = '你的睡眠小偷：' + matchedResult.thiefLabel;
        getEl('result-avatar').innerHTML = matchedResult.avatarSvg;
        getEl('result-role').textContent = matchedResult.familyMember + ' · ' + matchedResult.roleDesc;
        getEl('result-thief-label').textContent = '🏷️ 睡眠小偷标签：' + matchedResult.thiefLabel;
        getEl('result-desc').textContent = matchedResult.desc;

        // 触发 fade-in
        var fadeEls = resultEl.querySelectorAll('.fade-in');
        fadeEls.forEach(function (el, idx) {
            el.classList.remove('visible');
            setTimeout(function () {
                el.classList.add('visible');
            }, 150 * (idx + 1));
        });

        setTimeout(function () {
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }

    // ============ 预留 AI 调用函数 ============
    window.fetchSleepAdvice = async function (userSelectInfo) {
        // 入参示例：{ age:"青年", sleepTrouble:"入睡困难", beforeSleepAct:"刷手机", rootCause:"报复性刷电子屏幕不想入睡" }
        // 仅预留函数，不写任何API调用代码
        // 结果显示到 #ai-advice-box
        console.log('预留AI调用函数，入参:', userSelectInfo);
    };

    // ============ 启动 ============
    function tryInit() {
        if (getEl('quiz-container')) {
            initQuiz();
        } else {
            setTimeout(tryInit, 200);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }

})();

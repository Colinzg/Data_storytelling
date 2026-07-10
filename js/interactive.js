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
            avatarImg: 'images/characters/son/1.png'
        },
        {
            key: '报复性刷电子屏幕不想入睡',
            familyMember: '姐姐',
            thiefLabel: '电子屏幕',
            sceneClass: '.scene-daughter',
            roleDesc: '21岁 · 大学生',
            desc: '全国21%人群因睡前长期使用电子设备，大幅降低睡眠质量',
            avatarImg: 'images/characters/daughter/1.png'
        },
        {
            key: '工作压力',
            familyMember: '父亲',
            thiefLabel: '工作压力',
            sceneClass: '.scene-father',
            roleDesc: '45岁 · 公司中层',
            desc: '22%受访者将职场压力列为阻碍优质睡眠的核心因素',
            avatarImg: 'images/characters/father/1.png'
        },
        {
            key: '家庭琐事、长期操心家人',
            familyMember: '母亲',
            thiefLabel: '家庭负担',
            sceneClass: '.scene-mother',
            roleDesc: '42岁 · 教师',
            desc: '女性受家庭责任影响睡眠的比例显著高于男性，双重负担加剧失眠',
            avatarImg: 'images/characters/mother/1.png'
        },
        {
            key: '年龄增长导致睡眠能力下降',
            familyMember: '外婆',
            thiefLabel: '年龄增长',
            sceneClass: '.scene-grandma',
            roleDesc: '67岁 · 退休',
            desc: '66岁以上人群平均夜间清醒2.21次，早醒、浅眠为老年普遍问题',
            avatarImg: 'images/characters/grandma/1.png'
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
        getEl('result-avatar').innerHTML = '<img src="' + matchedResult.avatarImg + '" alt="' + matchedResult.familyMember + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />';
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

        // ============ AI 调用函数 (已修复变量名并优化提示) ============
    window.fetchSleepAdvice = async function (userSelectInfo) {
        const aiBox = document.getElementById('ai-advice-box');
        if (!aiBox) return;

        // 1. UI 状态更新：显示加载中
        aiBox.innerHTML = '<p style="color:#8a9bb5; text-align:center;">🚀 正在分析中，马上为您生成建议...</p>';
        
        // 禁用按钮防止重复点击
        const btn = document.getElementById('quiz-btn-ai');
        if(btn) {
            btn.disabled = true;
            btn.innerText = 'AI 思考中...';
        }

        try {
            // ⚠️ 定义 AI 的人设和输出格式
            const prompt = `
                你现在是一位拥有20年经验的“资深睡眠健康管理师”，你的说话风格非常亲切、温暖、有同理心，像一位老朋友在关心用户。

                用户的测试数据如下：
                - 年龄段：${userSelectInfo.age}
                - 睡前习惯：${userSelectInfo.beforeSleepAct}
                - 潜在根源：${userSelectInfo.rootCause}

                请根据以上数据，为用户生成一份个性化的改善建议。必须严格遵守以下输出格式：

                第一部分【暖心导语】：
                先用一段话（约50-80字）共情用户的现状，告诉用户这种情况很常见，不要焦虑，给予心理上的抚慰和支持。语气要温柔。

                第二部分【行动指南】：
                针对用户的“睡前习惯”和“潜在根源”，给出3条具体的、可执行的生活建议。
                格式要求：使用有序列表（1. 2. 3.），每条建议先加粗一个小标题，再解释具体做法，不要使用任何 Markdown 语法（如 星号）”。

                请直接输出内容，不需要说“好的”、“没问题”等客套话。
            `;

            // 2. 发起 API 请求 (注意：这里修正了变量名为 prompt)
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer sk-74f45b6753fd4940afdec735208d3557`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: "你是一个专业的睡眠健康助手。" },
                        { role: "user", content: prompt } // ✅ 这里修正了：之前误写成了 promptText
                    ],
                    temperature: 0.7
                })
            });

            // ❗重点：检查认证错误
            if (response.status === 401) {
                throw new Error('API 密钥无效或已过期，请检查配置');
            }

            if (!response.ok) {
                throw new Error(`API 请求失败: ${response.status}`);
            }

            const data = await response.json();
            
            // 3. 处理返回结果
            if (data.choices && data.choices.length > 0) {
                let aiText = data.choices[0].message.content;
                
                // 简单的格式化：把换行符转为 HTML 的 <br>，让排版好看点
                aiText = aiText.replace(/\n/g, '<br>');
                
                aiBox.innerHTML = `<div class="advice-content">${aiText}</div>`;
            } else {
                throw new Error('未获取到有效建议');
            }

        } catch (error) {
            console.error(error);
            // 将具体的错误信息显示在页面上
            aiBox.innerHTML = `<p style="color:#ff6b6b; font-size:14px; text-align:center;">❌ ${error.message}</p>`;
        } finally {
            // 恢复按钮状态
            if(btn) {
                btn.disabled = false;
                btn.innerText = '💡 获取我的个性化睡眠改善建议';
            }
        }
    };

    // ============ 启动逻辑 (保持原样) ============
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

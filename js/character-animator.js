/* ================================================================
   character-animator.js — 角色帧动画引擎 v3
   功能：全局滚动锁定 + 逐帧切换 + 点击切换
   - 鼠标在任何位置，只要角色场景在视口内就锁定滚动
   - 下滑逐帧推进 1→8，上滑逐帧回退
   - 8 帧全部切换完后解锁，页面继续正常滚动
   每个角色 8 张图 (1.png ~ 8.png)，存放在 images/characters/{name}/
   ================================================================ */

(function () {
    'use strict';

    const FRAME_COUNT = 8;
    const IMAGE_BASE = 'images/characters/';
    const ACTIVE_ANIMATORS = [];
    const WHEEL_THRESHOLD = 50;

    let wheelAccumulator = 0;
    let globalWheelBound = false;

    // ============ CharacterAnimator 类 ============
    class CharacterAnimator {
        constructor(imgEl, charName, sceneEl, context) {
            this.imgEl = imgEl;
            this.charName = charName;
            this.sceneEl = sceneEl || null;
            this.context = context || 'scene';
            this.currentFrame = 0;
            this.images = [];
            this._loaded = false;

            this._preload();
        }

        // ---- 预加载全部 8 帧 ----
        _preload() {
            let loaded = 0;
            for (let i = 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                img.onload = () => {
                    loaded++;
                    if (loaded === FRAME_COUNT) this._loaded = true;
                };
                img.onerror = () => {
                    console.warn('角色图加载失败: ' + this.charName + '/' + i + '.png');
                };
                img.src = IMAGE_BASE + this.charName + '/' + i + '.png';
                this.images.push(img);
            }
        }

        get framesExhausted() {
            return this.currentFrame >= FRAME_COUNT - 1;
        }

        get atFirstFrame() {
            return this.currentFrame <= 0;
        }

        // ---- 切换到指定帧（淡入淡出过渡） ----
        setFrame(index) {
            if (!this._loaded) return;
            const newFrame = Math.max(0, Math.min(FRAME_COUNT - 1, index));
            if (newFrame === this.currentFrame) return;
            this.currentFrame = newFrame;

            const targetImg = this.images[newFrame];
            if (!targetImg || !targetImg.complete) return;

            // 淡出 → 切换 → 淡入，250ms 连贯过渡
            const self = this;
            this.imgEl.style.transition = 'opacity 0.25s ease-in-out';
            this.imgEl.style.opacity = '0';

            setTimeout(function () {
                self.imgEl.src = targetImg.src;
                self.imgEl.style.opacity = '1';
            }, 250);
        }

        nextFrame() {
            if (!this.framesExhausted) this.setFrame(this.currentFrame + 1);
        }

        prevFrame() {
            if (!this.atFirstFrame) this.setFrame(this.currentFrame - 1);
        }

        _setupClick() {
            const self = this;
            this._onClick = function (e) {
                e.stopPropagation();
                self.nextFrame();
            };
            this.imgEl.addEventListener('click', this._onClick);
            this.imgEl.style.cursor = 'pointer';
        }

        start() {
            const self = this;
            const tryStart = function () {
                if (self._loaded) {
                    self.imgEl.src = self.images[0].src;
                    self.imgEl.style.opacity = '1';
                    self._setupClick();
                } else {
                    setTimeout(tryStart, 100);
                }
            };
            tryStart();
        }

        destroy() {
            if (this._onClick) {
                this.imgEl.removeEventListener('click', this._onClick);
            }
            const idx = ACTIVE_ANIMATORS.indexOf(this);
            if (idx > -1) ACTIVE_ANIMATORS.splice(idx, 1);
        }
    }

    // ============ 查找当前需要锁定的场景角色 ============
    // 条件：场景在视口内 + 帧未播完 + 场景顶部接近视口顶部（±180px）
    // 这样场景刚进入屏幕底部时不会触发，只有滑到"正中间"时才开始锁定
    function findActiveSceneAnimator() {
        let best = null;
        let bestDistance = Infinity;
        const viewH = window.innerHeight;
        const LOCK_ZONE = 180;  // 场景顶部距离视口顶部的锁定范围

        for (let i = 0; i < ACTIVE_ANIMATORS.length; i++) {
            const anim = ACTIVE_ANIMATORS[i];
            if (anim.context !== 'scene' || !anim.sceneEl) continue;
            if (anim.framesExhausted) continue;

            const rect = anim.sceneEl.getBoundingClientRect();

            // 场景必须在视口内
            if (rect.bottom < 0 || rect.top > viewH) continue;

            // 场景顶部必须在锁定区域内（接近视口顶部）
            if (rect.top < -LOCK_ZONE || rect.top > LOCK_ZONE) continue;

            const distance = Math.abs(rect.top);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = anim;
            }
        }

        return best;
    }

    // ============ 全局滚轮处理（滚动锁定） ============
    function handleGlobalWheel(e) {
        const active = findActiveSceneAnimator();

        if (!active) {
            wheelAccumulator = 0;
            return;  // 无需锁定，正常滚动
        }

        if (e.deltaY > 0) {
            // 向下滚 → 推进帧
            if (!active.framesExhausted) {
                e.preventDefault();
                e.stopPropagation();
                wheelAccumulator += e.deltaY;
                while (wheelAccumulator >= WHEEL_THRESHOLD && !active.framesExhausted) {
                    active.nextFrame();
                    wheelAccumulator -= WHEEL_THRESHOLD;
                }
                if (active.framesExhausted) wheelAccumulator = 0;
            }
        } else if (e.deltaY < 0) {
            // 向上滚 → 回退帧
            if (!active.atFirstFrame) {
                e.preventDefault();
                e.stopPropagation();
                wheelAccumulator += Math.abs(e.deltaY);
                while (wheelAccumulator >= WHEEL_THRESHOLD && !active.atFirstFrame) {
                    active.prevFrame();
                    wheelAccumulator -= WHEEL_THRESHOLD;
                }
                if (active.atFirstFrame) wheelAccumulator = 0;
            }
        }
    }

    function ensureGlobalWheel() {
        if (globalWheelBound) return;
        globalWheelBound = true;
        // capture: true 确保在子元素之前拦截事件
        window.addEventListener('wheel', handleGlobalWheel, { capture: true, passive: false });
    }

    // ============ 自动扫描 & 初始化 ============
    function scanAndInit() {
        const sceneImages = document.querySelectorAll('.char-image-container img[data-character]');
        sceneImages.forEach(function (img) {
            if (img._animatorInitialized) return;
            img._animatorInitialized = true;

            const charName = img.getAttribute('data-character');
            const sceneEl = img.closest('.scene');
            const ctx = img.getAttribute('data-context') || 'scene';

            if (!charName) return;

            const animator = new CharacterAnimator(img, charName, sceneEl, ctx);
            animator.start();
            ACTIVE_ANIMATORS.push(animator);
        });

        const avatarImages = document.querySelectorAll('.char-avatar img[data-character]');
        avatarImages.forEach(function (img) {
            if (img._animatorInitialized) return;
            img._animatorInitialized = true;

            const charName = img.getAttribute('data-character');
            if (!charName) return;

            const animator = new CharacterAnimator(img, charName, null, 'avatar');
            animator.start();
            ACTIVE_ANIMATORS.push(animator);
        });

        if (sceneImages.length > 0) {
            ensureGlobalWheel();
        }
    }

    function tryInit() {
        const sceneImgs = document.querySelectorAll('.char-image-container img[data-character]');
        const avatarImgs = document.querySelectorAll('.char-avatar img[data-character]');

        if (sceneImgs.length > 0 || avatarImgs.length > 0) {
            scanAndInit();
        } else {
            setTimeout(tryInit, 300);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(tryInit, 500);
        });
    } else {
        setTimeout(tryInit, 500);
    }

    window.CharacterAnimator = CharacterAnimator;
    window.getCharacterAnimators = function () { return ACTIVE_ANIMATORS.slice(); };

})();

/* ================================================================
   character-animator.js — 角色帧动画引擎 v4
   功能：全局滚动锁定 + 逐帧切换 + 点击切换 + 横向擦除过渡
   - 鼠标在任何位置，只要角色场景在视口内就锁定滚动
   - 下滑逐帧推进 1→8，上滑逐帧回退
   - 8 帧全部切换完后解锁，页面继续正常滚动
   - 帧切换使用横向擦除效果（clip-path wipe）
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

        /**
         * @param {HTMLElement} imgEl    — 页面中的 <img> 元素
         * @param {string}      charName — 角色名
         * @param {HTMLElement} sceneEl  — 所属场景 section
         * @param {string}      context  — 'scene' | 'avatar'
         */
        constructor(imgEl, charName, sceneEl, context) {
            this.charName = charName;
            this.sceneEl = sceneEl || null;
            this.context = context || 'scene';
            this.currentFrame = 0;
            this.images = [];
            this._loaded = false;
            this._switching = false;  // 防止快速切换

            if (this.context === 'scene') {
                this._buildDualLayer(imgEl);
            } else {
                // 头像模式保持简单淡入淡出
                this.imgEl = imgEl;
            }

            this._preload();
        }

        // ---- 构建双层图片结构（用于擦除过渡） ----
        _buildDualLayer(originalImg) {
            const container = originalImg.closest('.char-image-container');
            if (!container) {
                this.imgEl = originalImg;
                return;
            }

            // 移除原始 img
            originalImg.remove();

            // 创建双层结构
            container.style.position = 'relative';
            container.style.overflow = 'hidden';

            // 底层：新画面（始终显示）
            this.backImg = document.createElement('img');
            this.backImg.style.cssText =
                'position:absolute;top:0;left:0;width:100%;height:100%;' +
                'object-fit:cover;object-position:center top;' +
                'opacity:1;z-index:1;pointer-events:none;';

            // 顶层：旧画面（被擦除）
            this.frontImg = document.createElement('img');
            this.frontImg.style.cssText =
                'position:absolute;top:0;left:0;width:100%;height:100%;' +
                'object-fit:cover;object-position:center top;' +
                'opacity:1;z-index:2;cursor:pointer;' +
                'transition: clip-path 0.35s cubic-bezier(0.4, 0, 0.2, 1);';
            this.frontImg.alt = '角色图';
            this.frontImg.title = '点击切换动作 (共 ' + FRAME_COUNT + ' 帧)';

            container.appendChild(this.backImg);
            container.appendChild(this.frontImg);

            // 对外暴露 frontImg 作为主交互元素
            this.imgEl = this.frontImg;
        }

        // ---- 预加载 ----
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

        // ---- 切换到指定帧 ----
        setFrame(index) {
            if (!this._loaded || this._switching) return;
            const newFrame = Math.max(0, Math.min(FRAME_COUNT - 1, index));
            if (newFrame === this.currentFrame) return;
            this.currentFrame = newFrame;

            const targetImg = this.images[newFrame];
            if (!targetImg || !targetImg.complete) return;

            if (this.context === 'scene' && this.frontImg && this.backImg) {
                this._wipeTransition(targetImg);
            } else {
                this._simpleSwitch(targetImg);
            }
        }

        // ---- 擦除过渡：顶层从右向左擦除，露出底层新画面 ----
        _wipeTransition(targetImg) {
            const self = this;
            this._switching = true;

            // 1. 先把新画面放到底层
            this.backImg.src = targetImg.src;

            // 2. 顶层从完全可见开始，向右擦除消失
            //    clip-path: inset(top right bottom left)
            //    inset(0 0 0 0) = 完全可见
            //    inset(0 0 0 100%) = 从左边缘完全擦除（右侧消失）
            this.frontImg.style.clipPath = 'inset(0 0 0 0)';

            // 3. 下一帧触发擦除动画
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    self.frontImg.style.clipPath = 'inset(0 0 0 100%)';
                });
            });

            // 4. 动画完成后：把新画面提到顶层，重置状态
            setTimeout(function () {
                self.frontImg.src = targetImg.src;
                self.frontImg.style.clipPath = 'inset(0 0 0 0)';
                self._switching = false;
            }, 380);
        }

        // ---- 简单切换（头像模式） ----
        _simpleSwitch(targetImg) {
            const self = this;
            this.imgEl.style.transition = 'opacity 0.12s ease-in-out';
            this.imgEl.style.opacity = '0';

            setTimeout(function () {
                self.imgEl.src = targetImg.src;
                self.imgEl.style.opacity = '1';
            }, 120);
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
        }

        start() {
            const self = this;
            const tryStart = function () {
                if (self._loaded) {
                    const firstSrc = self.images[0].src;
                    if (self.context === 'scene' && self.frontImg && self.backImg) {
                        self.frontImg.src = firstSrc;
                        self.backImg.src = firstSrc;
                        self.frontImg.style.clipPath = 'inset(0 0 0 0)';
                    } else if (self.imgEl) {
                        self.imgEl.src = firstSrc;
                        self.imgEl.style.opacity = '1';
                    }
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
    function findActiveSceneAnimator() {
        let best = null;
        let bestDistance = Infinity;
        const viewH = window.innerHeight;
        const LOCK_ZONE = 180;

        for (let i = 0; i < ACTIVE_ANIMATORS.length; i++) {
            const anim = ACTIVE_ANIMATORS[i];
            if (anim.context !== 'scene' || !anim.sceneEl) continue;
            if (anim.framesExhausted) continue;

            const rect = anim.sceneEl.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > viewH) continue;
            if (rect.top < -LOCK_ZONE || rect.top > LOCK_ZONE) continue;

            const distance = Math.abs(rect.top);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = anim;
            }
        }
        return best;
    }

    // ============ 全局滚轮处理 ============
    function handleGlobalWheel(e) {
        const active = findActiveSceneAnimator();
        if (!active) { wheelAccumulator = 0; return; }

        if (e.deltaY > 0) {
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
        window.addEventListener('wheel', handleGlobalWheel, { capture: true, passive: false });
    }

    // ============ 扫描 & 初始化 ============
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

        if (sceneImages.length > 0) ensureGlobalWheel();
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

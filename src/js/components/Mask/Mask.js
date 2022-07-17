import { runFadeInfo } from "../../animations/FadeInfo.js";
import { Bezier } from "../../lib/Bezier/Bezier.js";
import { Vector2 } from "../../lib/Vector/Vector.js";

export default class Mask {
  constructor(app) {
    this.app = app;
    this.canvas = app.canvas;
    this.ctx = app.ctx;

    this.animationState = -1; // -1: disabled, 0: ready, 1: animating, 2: end
    this.reseting = false;
    this.maskAnimator = null;
    this.onAnimationEnd = null;

    this.radius = 0;
    this.pos = new Vector2(0, 0);
    this.globalTextOpacity = 0;
    this.progressTextOpacity = 1;
    this.startGlobalOpacity = false;
    this.oSpeed = 0.05;
  }

  get isDisabled() {
    return this.animationState === -1;
  }

  get isReady() {
    return this.animationState === 0;
  }

  setReady() {
    this.animationState = 0;
    this.reseting = false;
  }

  get isAnimating() {
    return this.animationState === 1;
  }

  get isAnimationEnd() {
    return this.animationState === 2;
  }

  draw() {
    const paddingSize = 50;
    const { stageWidth, stageHeight } = this.app;

    const parseToColorHex = (num) => {
      num *= 255;
      const hex = Math.floor(num).toString(16);
      return hex.length < 2 ? `0${hex}` : hex;
    };

    const drawCover = () => {
      this.ctx.beginPath();
      this.ctx.fillStyle = "#212121";
      this.ctx.fillRect(0, 0, stageWidth, stageHeight);
    };

    const drawTitle = () => {
      this.ctx.beginPath();
      this.ctx.font = `300 24px Roboto`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = `#ffffff${parseToColorHex(this.globalTextOpacity)}`;
      this.ctx.fillText("Masking Animation", stageWidth / 2, paddingSize);
    };

    const drawGuideText = () => {
      this.ctx.beginPath();
      this.ctx.font = `300 14px Roboto`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = `#e8e8e8${parseToColorHex(this.globalTextOpacity)}`;
      this.ctx.fillText("CLICK ANYWHERE", stageWidth / 2, stageHeight / 2);
    };

    const drawProgressText = () => {
      this.ctx.beginPath();
      this.ctx.font = "300 14px Roboto";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = `#e8e8e8${parseToColorHex(
        this.progressTextOpacity
      )}`;
      this.ctx.fillText(
        `Loading... ${this.app.imageManager.totalLoadPercentage}%`,
        stageWidth / 2,
        stageHeight / 2
      );
    };

    const drawCopyright = () => {
      this.ctx.beginPath();
      this.ctx.font = `300 12px Roboto`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = `#e0e0e0${parseToColorHex(this.globalTextOpacity)}`;
      this.ctx.fillText(
        "Copyright © 2022 Sanghyeok Park. All rights reserved.",
        stageWidth / 2,
        stageHeight - paddingSize
      );
    };

    const drawMask = () => {
      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      this.ctx.fill();
    };

    this.ctx.clearRect(0, 0, stageWidth, stageHeight);
    drawCover();
    drawTitle();
    drawGuideText();
    drawProgressText();
    drawCopyright();
    this.ctx.globalCompositeOperation = "destination-out";
    drawMask();
    this.ctx.globalCompositeOperation = "source-over";
  }

  update() {
    this.runMaskAnimator();
    this.checkMaskColideWithInfo();

    this.manageGlobalTextOpacity();
    this.manageProgressTextOpacity();
  }

  manageGlobalTextOpacity() {
    if (!this.startGlobalOpacity) return;
    if (this.reseting) {
      this.globalTextOpacity = 0;
      return;
    }

    this.globalTextOpacity = Math.min(this.globalTextOpacity + this.oSpeed, 1);
  }

  manageProgressTextOpacity() {
    if (!this.app.imageManager.allLoaded) return;
    if (this.progressTextOpacity === 0) return;

    const START_DELAY = 300;

    this.progressTextOpacity = Math.max(
      this.progressTextOpacity - this.oSpeed,
      0
    );

    if (this.progressTextOpacity === 0) {
      setTimeout(() => {
        this.startGlobalOpacity = true;
      }, START_DELAY);
    }
  }

  resize() {
    if (!this.isAnimationEnd) return;
    this.radius = this.getTargetRadius() * 1.02;
  }

  resetMask() {
    this.radius = 0;
    this.globalTextOpacity = 0;
    this.animationState = -1;
    this.maskAnimator = null;
    this.pos = new Vector2(0, 0);
    this.canvas.style.transform = "translate3d(-100%, 0, 0)";
  }

  runMaskAnimator() {
    if (!this.maskAnimator) return;

    const isAnimationEnd = this.maskAnimator();
    if (isAnimationEnd) {
      this.animationState = 2;
      this.maskAnimator = null;
      this.onAnimationEnd();
    } else {
      this.animationState = 1;
    }
  }

  checkMaskColideWithInfo() {
    const centerPos = this.app.info.getCenterPos();

    if (
      centerPos.getDistWith(this.pos) < this.radius &&
      !this.app.info.infoAppeared
    ) {
      this.app.info.infoAppeared = true;
      runFadeInfo(document.querySelector(".info-container"), this.pos);
    }
  }

  getTargetRadius() {
    const { x, y } = this.pos;
    const { stageWidth, stageHeight } = this.app;

    const mw = Math.max(stageWidth - x, x);
    const mh = Math.max(stageHeight - y, y);

    return Math.sqrt(Math.pow(mw, 2) + Math.pow(mh, 2));
  }

  setAnimator(pos, { duration, ease, onEnd = () => {} }) {
    if (!this.isReady) return;
    this.pos = pos.copy();
    this.onAnimationEnd = onEnd;
    this.maskAnimator = this.getMaskAnimator(duration, ease);
  }

  getMaskAnimator(duration, ease) {
    let startTime = null;
    const bezier = Bezier(...ease);

    const animator = () => {
      if (!startTime) startTime = new Date();

      const elapsed = (new Date() - startTime) / 1000;
      const timeRatio = Math.min(elapsed / duration, 1);
      const bezierRatio = Math.min(Math.max(bezier(timeRatio), 0), 1);

      this.radius = this.getTargetRadius() * bezierRatio;

      return bezierRatio === 1;
    };

    return animator;
  }
}

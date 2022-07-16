import { runFadeInfo } from "../../animations/FadeInfo.js";
import { Bezier } from "../../lib/Bezier/Bezier.js";
import { Vector2 } from "../../lib/Vector/Vector.js";

export default class Mask {
  constructor(app) {
    this.app = app;
    this.ctx = app.ctx;

    this.animationState = -1; // -1: disabled, 0: ready, 1: animating, 2: end
    this.reseting = false;
    this.maskAnimator = null;
    this.onAnimationEnd = null;

    this.radius = 0;
    this.pos = new Vector2(0, 0);
    this.globalTextOpacity = 1;
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

    const parseToColorHex = (num) => {
      num *= 255;
      return Math.floor(num).toString(16);
    };

    const drawCover = () => {
      this.ctx.beginPath();
      this.ctx.fillStyle = "#212121";
      this.ctx.fillRect(0, 0, this.app.stageWidth, this.app.stageHeight);
    };

    const drawTitle = () => {
      this.ctx.beginPath();
      this.ctx.font = `300 24px Roboto`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = `#ffffff${parseToColorHex(this.globalTextOpacity)}`;
      console.log(this.globalTextOpacity.toString(16));
      this.ctx.fillText(
        "Masking Animation",
        this.app.stageWidth / 2,
        paddingSize
      );
    };

    const drawGuideText = () => {
      this.ctx.beginPath();
      this.ctx.font = `300 14px Roboto`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = `#e8e8e8${parseToColorHex(this.globalTextOpacity)}`;
      this.ctx.fillText(
        "CLICK ANYWHERE",
        this.app.stageWidth / 2,
        this.app.stageHeight / 2
      );
    };

    const drawCopyright = () => {
      this.ctx.beginPath();
      this.ctx.font = `300 12px Roboto`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = `#e0e0e0${parseToColorHex(this.globalTextOpacity)}`;
      this.ctx.fillText(
        "Copyright © 2022 Sanghyeok Park. All rights reserved.",
        this.app.stageWidth / 2,
        this.app.stageHeight - paddingSize
      );
    };

    const drawMask = () => {
      this.ctx.beginPath();
      this.ctx.fillStyle = "white";
      this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      this.ctx.fill();
    };

    this.ctx.clearRect(0, 0, this.app.stageWidth, this.app.stageHeight);
    drawCover();
    drawTitle();
    drawGuideText();
    drawCopyright();
    this.ctx.globalCompositeOperation = "destination-out";
    drawMask();
    this.ctx.globalCompositeOperation = "source-over";
  }

  update() {
    this.runMaskAnimator();
    this.checkMaskColideWithInfo();

    if (!this.reseting) {
      this.globalTextOpacity = Math.min(
        this.globalTextOpacity + this.oSpeed,
        1
      );
    } else {
      this.globalTextOpacity = 0;
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

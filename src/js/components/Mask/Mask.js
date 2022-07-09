import { runFadeInfo } from "../../animations/FadeInfo.js";
import { Bezier } from "../../lib/Bezier/Bezier.js";
import { getCenterPosFrom } from "../../lib/dom-tools/domRect.js";
import { Vector2 } from "../../lib/Vector/Vector.js";

export default class Mask {
  constructor(app) {
    this.app = app;
    this.ctx = app.ctx;

    this.animationState = -1; // -1: disabled, 0: ready, 1: animating, 2: end
    this.maskAnimator = null;

    this.radius = 0;
    this.pos = new Vector2(0, 0);
  }

  get isDisabled() {
    return this.animationState === -1;
  }

  get isReady() {
    return this.animationState === 0;
  }

  setReady() {
    this.animationState = 0;
  }

  get isAnimating() {
    return this.animationState === 1;
  }

  get isAnimationEnd() {
    return this.animationState === 2;
  }

  draw() {
    const drawCover = () => {
      this.ctx.beginPath();
      this.ctx.fillStyle = "#212121";
      this.ctx.fillRect(0, 0, this.app.stageWidth, this.app.stageHeight);
    };

    const drawText = () => {
      this.ctx.beginPath();
      this.ctx.font = `300 18px Roboto`;
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        "CLICK ANYWHERE",
        this.app.stageWidth / 2,
        this.app.stageHeight / 2
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
    drawText();
    this.ctx.globalCompositeOperation = "destination-out";
    drawMask();
    this.ctx.globalCompositeOperation = "source-over";
  }

  update() {
    // Run mask animator
    if (this.maskAnimator) {
      if (this.maskAnimator()) {
        this.animationState = 2;
        this.maskAnimator = null;
      } else {
        this.animationState = 1;
      }
    }

    // Run checking collide with text
    const title = document.querySelector(".info-container > .title");
    const from = document.querySelector(".info-container > .from");
    const titlePos = getCenterPosFrom(title);
    const fromPos = getCenterPosFrom(from);
    const centerPos = titlePos.add(fromPos).div(2);

    if (
      centerPos.getDistWith(this.pos) < this.radius &&
      !this.app.textAppeared
    ) {
      this.app.textAppeared = true;
      runFadeInfo(document.querySelector(".info-container"), this.pos);
    }
  }

  resize() {
    if (!this.isAnimationEnd) return;
    this.radius = this.getTargetRadius() * 1.02;
  }

  getTargetRadius() {
    const { x, y } = this.pos;
    const { stageWidth, stageHeight } = this.app;

    const mw = Math.max(stageWidth - x, x);
    const mh = Math.max(stageHeight - y, y);

    return Math.sqrt(Math.pow(mw, 2) + Math.pow(mh, 2));
  }

  setAnimator(pos, duration, ease) {
    if (!this.isReady) return;
    this.pos = pos.copy();
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

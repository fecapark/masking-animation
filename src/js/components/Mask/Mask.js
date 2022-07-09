import { Bezier } from "../../lib/Bezier/Bezier.js";
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

  get ready() {
    return this.animationState === 0;
  }

  get isAnimating() {
    return this.animationState === 1;
  }

  get isAnimationEnd() {
    return this.animationState === 2;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.app.stageWidth, this.app.stageHeight);

    // Draw mask cover
    this.ctx.beginPath();
    this.ctx.fillStyle = "#212121";
    this.ctx.fillRect(0, 0, this.app.stageWidth, this.app.stageHeight);

    // Draw some text
    this.ctx.beginPath();
    this.ctx.font = `300 18px Roboto`;
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(
      "CLICK ANYWHERE",
      this.app.stageWidth / 2,
      this.app.stageHeight / 2
    );

    // Draw circle mask
    this.ctx.globalCompositeOperation = "destination-out";

    this.ctx.beginPath();
    this.ctx.fillStyle = "white";
    this.ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.globalCompositeOperation = "source-over";
  }

  update() {
    if (this.maskAnimator) {
      const isEnd = this.maskAnimator();

      if (isEnd) {
        this.animationState = 2;
        this.maskAnimator = null;
      } else {
        this.animationState = 1;
      }
    }
  }

  setReady() {
    this.animationState = 0;
  }

  setAnimator(pos, duration, ease) {
    if (!this.ready) return;
    this.pos = pos.copy();
    this.maskAnimator = this.getMaskAnimator(pos, duration, ease);
  }

  getMaskAnimator(pos, duration, ease) {
    let startTime = null;
    const bezier = Bezier(...ease);

    const getTargetRadius = () => {
      const { x, y } = pos;
      const { stageWidth, stageHeight } = this.app;

      const mw = Math.max(stageWidth - x, x);
      const mh = Math.max(stageHeight - y, y);

      return Math.sqrt(Math.pow(mw, 2) + Math.pow(mh, 2));
    };

    const animator = () => {
      if (!startTime) startTime = new Date();

      const elapsed = (new Date() - startTime) / 1000;
      const timeRatio = Math.min(elapsed / duration, 1);
      const bezierRatio = Math.min(Math.max(bezier(timeRatio), 0), 1);

      this.radius = getTargetRadius() * bezierRatio;

      return bezierRatio === 1;
    };

    return animator;
  }
}

import { runResetMask } from "./animations/ResetMask.js";
import Info from "./components/Info/Info.js";
import Mask from "./components/Mask/Mask.js";
import ImageManager from "./core/imageManager.js";
import { Vector2 } from "./lib/Vector/Vector.js";

export default class App {
  constructor(target) {
    this.target = target;

    // About canvas
    this.canvas = document.createElement("canvas");
    target.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");

    // Components
    this.mask = new Mask(this);
    this.info = new Info(this);
    this.imageManager = new ImageManager(this);

    // About resize
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();

    // Init mask and content
    this.renderContent();
    this.animateMask();
    this.imageManager.setImage();

    document.addEventListener("click", this.setMask.bind(this));
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    this.imageManager.resize();
    this.mask.resize();
  }

  handleExecuteResetMask() {
    if (this.mask.reseting) return;
    this.mask.reseting = true;

    runResetMask(this.canvas, this.info.container, () => {
      this.mask.setReady();
      this.imageManager.nextImage();
      this.info.resetStyles();
      this.info.setText(this.imageManager.currentInfo);
    });
  }

  renderContent() {
    const container = document.querySelector(".container");
    container.innerHTML = `
      <div class="img-wrapper"></div>
    `;
    container.addEventListener("click", this.handleExecuteResetMask.bind(this));

    this.info.setText(this.imageManager.currentInfo);
    container.appendChild(this.info.container);
  }

  setMask(e) {
    e.stopPropagation();

    if (!this.mask.isReady) return;

    const pos = new Vector2(e.offsetX, e.offsetY);
    this.mask.setAnimator(pos, {
      duration: 1.3,
      ease: [0.22, 0.68, 0, 1],
      onEnd: () => {
        this.mask.resetMask();
      },
    });
  }

  animateMask() {
    requestAnimationFrame(this.animateMask.bind(this));
    this.mask.draw();
    this.mask.update();
  }
}

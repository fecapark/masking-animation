import Mask from "./components/Mask/Mask.js";
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
    this.image = null;

    // About resize
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();

    // Init mask and content
    this.renderContent();
    this.setImage();
    this.animateMask();

    document.addEventListener("pointerdown", this.setMask.bind(this));
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    this.resizeImage();
  }

  renderContent() {
    const container = document.querySelector(".container");
    container.innerHTML = `
      <div class="img-wrapper"></div>
      <div class="reload-container">
        <i class="fa-solid fa-arrow-rotate-right"></i>
      </div>
      <div class="info-container">
        <span class="title">Café Terrace at Night</span>
        <span class="sub-title">Vincent van Gogh, 1888</span>
      </div>
    `;
  }

  setImage() {
    this.image = new Image();
    this.image.src = "img/gogh.jpg";
    this.image.onload = () => {
      document.querySelector(".img-wrapper").appendChild(this.image);
      this.mask.setReady();
      this.resizeImage();
    };
  }

  resizeImage() {
    if (!this.image) return;

    const stageRatio = this.stageWidth / this.stageHeight;
    const imageRatio = this.image.naturalWidth / this.image.naturalHeight;

    this.image.width = this.stageWidth;
    this.image.height = this.stageHeight;

    if (stageRatio > imageRatio) {
      this.image.height = Math.round(
        this.image.naturalHeight * (this.stageWidth / this.image.naturalWidth)
      );
    } else {
      this.image.width = Math.round(
        this.image.naturalWidth * (this.stageHeight / this.image.naturalHeight)
      );
    }
  }

  setMask(e) {
    e.stopPropagation();

    if (!this.mask.ready) return;

    const pos = new Vector2(e.offsetX, e.offsetY);
    this.mask.setAnimator(pos, 1, [0.22, 0.68, 0, 1]);
    this.canvas.style.cursor = "default";
  }

  animateMask() {
    requestAnimationFrame(this.animateMask.bind(this));
    this.mask.draw();
    this.mask.update();
  }
}

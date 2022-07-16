import { runResetMask } from "./animations/ResetMask.js";
import Info from "./components/Info/Info.js";
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
    this.info = new Info(this);
    this.image = null;

    // About resize
    this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();

    // Init mask and content
    this.renderContent();
    this.setImage();
    this.animateMask();

    document.addEventListener("click", this.setMask.bind(this));
  }

  resize() {
    this.stageWidth = document.body.clientWidth;
    this.stageHeight = document.body.clientHeight;

    this.canvas.width = this.stageWidth * this.pixelRatio;
    this.canvas.height = this.stageHeight * this.pixelRatio;
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    this.resizeImage();
    this.mask.resize();
  }

  renderContent() {
    const container = document.querySelector(".container");
    container.innerHTML = `
      <div class="img-wrapper"></div>
    `;
    container.addEventListener("click", () => {
      if (this.mask.reseting) return;
      this.mask.reseting = true;
      this.info.container.style.zIndex = "1000";

      requestAnimationFrame(() => {
        runResetMask(this.canvas, this.info.container, () => {
          this.info.container.style.zIndex = "";
          this.info.container.style.opacity = "";
          this.info.container.style.background = "";
          this.mask.setReady();
        });
      });
    });

    this.info.setText({
      title: "Café Terrace at Night",
      from: "Vincent van Gogh, 1888",
    });
    container.appendChild(this.info.container);
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

    if (!this.mask.isReady) return;

    const pos = new Vector2(e.offsetX, e.offsetY);
    this.mask.setAnimator(pos, {
      duration: 1.3,
      ease: [0.22, 0.68, 0, 1],
      onEnd: () => {
        this.canvas.style.cursor = "";
        this.canvas.style.transform = "translate3d(-100%, 0, 0)";
        this.mask.resetMask();
      },
    });
    this.canvas.style.cursor = "default";
  }

  animateMask() {
    requestAnimationFrame(this.animateMask.bind(this));
    this.mask.draw();
    this.mask.update();
  }
}

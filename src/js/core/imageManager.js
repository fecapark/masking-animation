export default class ImageManager {
  constructor(app) {
    this.app = app;
    this.images = [
      {
        image: null,
        src: "img/1.jpg",
        title: "Café Terrace at Night",
        from: "Vincent van Gogh, 1888",
        loadRatio: 0,
      },
      {
        image: null,
        src: "img/2.jpg",
        title: "The Starry Night",
        from: "Vincent van Gogh, 1889",
        loadRatio: 0,
      },
      {
        image: null,
        src: "img/3.jpg",
        title: "Starry Night Over the Rhône",
        from: "Vincent van Gogh, 1888",
        loadRatio: 0,
      },
    ];
    this.ensureImageLoadCount = 0;
    this.currentImageIndex = 0;
  }

  get currentInfo() {
    const { title, from } = this.images[this.currentImageIndex];
    return { title, from };
  }

  get totalLoadPercentage() {
    let result = 0;
    this.images.forEach(({ loadRatio }) => {
      result += loadRatio;
    });
    return Math.min(Math.floor((result / this.images.length) * 100), 100);
  }

  get allLoaded() {
    return this.totalLoadPercentage === 100;
  }

  resize() {
    this.images.forEach(({ image }) => {
      if (!image) return;

      const stageRatio = this.app.stageWidth / this.app.stageHeight;
      const imageRatio = image.naturalWidth / image.naturalHeight;

      image.width = this.app.stageWidth;
      image.height = this.app.stageHeight;

      if (imageRatio > stageRatio) {
        image.width = Math.round(
          image.naturalWidth * (this.app.stageHeight / image.naturalHeight)
        );
      } else {
        image.height = Math.round(
          image.naturalHeight * (this.app.stageWidth / image.naturalWidth)
        );
      }
    });
  }

  setImage() {
    this.images.forEach((imageData) => {
      const image = new Image();
      imageData.image = image;
      this.loadImage(imageData);
    });
  }

  loadImage(imageData) {
    const { image, src } = imageData;

    const xmlReq = new XMLHttpRequest();
    xmlReq.open("GET", src, true);
    xmlReq.responseType = "arraybuffer";

    xmlReq.onloadstart = () => {
      imageData.loadRatio = 0;
    };
    xmlReq.onprogress = (e) => {
      imageData.loadRatio = e.loaded / e.total;
    };

    xmlReq.onload = () => {
      const blob = new Blob([xmlReq.response]);
      image.src = window.URL.createObjectURL(blob);

      imageData.loadRatio = 1;
      image.onload = () => {
        this.ensureImageLoadCount++;
        this.ensureImageLoad();
      };
    };

    xmlReq.send();
  }

  ensureImageLoad() {
    if (this.ensureImageLoadCount < this.images.length) return;
    this.onAllLoaded();
  }

  onAllLoaded() {
    this.changeToCurrentImage();
    this.app.mask.setReady();
    this.resize();
  }

  changeToCurrentImage() {
    const currentImage = this.images[this.currentImageIndex].image;
    const imageWrapper = document.querySelector(".img-wrapper");
    imageWrapper.innerHTML = "";
    imageWrapper.appendChild(currentImage);
  }

  nextImage() {
    this.currentImageIndex++;
    this.currentImageIndex %= this.images.length;
    this.changeToCurrentImage();
  }
}

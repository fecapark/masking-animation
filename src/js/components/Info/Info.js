import { getCenterPosFrom } from "../../lib/dom-tools/domRect.js";

export default class Info {
  constructor(app, { title = "", from = "" } = {}) {
    this.app = app;

    this.titleText = title;
    this.fromText = from;

    this.infoAppeared = false;
  }

  get title() {
    return document.querySelector(".info-container > .title");
  }

  get from() {
    return document.querySelector(".info-container > .from");
  }

  setText({ title = "", from = "" } = {}) {
    this.titleText = title;
    this.fromText = from;
    this.render();
  }

  render() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.classList.add("info-container");
    }

    this.container.innerHTML = `
      <span class="title">${this.titleText}</span>
      <span class="from">${this.fromText}</span>
    `;
  }

  getCenterPos() {
    const titlePos = getCenterPosFrom(this.title);
    const fromPos = getCenterPosFrom(this.from);
    return titlePos.add(fromPos).div(2);
  }
}

import App from "./App.js";
import { stringExtension } from "./core/extension.js";

document.addEventListener("DOMContentLoaded", () => {
  stringExtension();
  new App(document.getElementById("app"));
});

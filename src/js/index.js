import App from "./App.js";
import { stringExtension } from "./core/extension.js";

window.onload = () => {
  stringExtension();
  new App(document.getElementById("app"));
};

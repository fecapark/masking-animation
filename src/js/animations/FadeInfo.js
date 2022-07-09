import SequenceAnimator from "../lib/Animator/SequenceAnimator.js";

export function runFadeInfo() {
  requestAnimationFrame(() => {
    new SequenceAnimator([]).play();
  });
}

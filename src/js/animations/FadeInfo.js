import SequenceAnimator from "../lib/Animator/SequenceAnimator.js";
import { getCenterPosFrom } from "../lib/dom-tools/domRect.js";

function sweptAnimation(infoContainer, maskPos) {
  const title = infoContainer.querySelector(".title");
  const from = infoContainer.querySelector(".from");
  const titlePos = getCenterPosFrom(title);
  const fromPos = getCenterPosFrom(from);
  const centerPos = titlePos.add(fromPos).div(2);

  return [
    [
      {
        target: title,
        styles: [
          {
            prop: "opacity",
            fvalue: "%x",
            from: () => [0],
            to: () => [1],
          },
          {
            prop: "transform",
            fvalue: "translate3d(%xpx, %xpx, 0)",
            from: () => {
              const offset = 12;
              const dir = maskPos.sub(centerPos).normalize();
              const vec = dir.mul(offset);

              return [vec.x, vec.y];
            },
            to: () => [0, 0],
          },
        ],
        duration: 0.35,
        bezier: "material-normal",
      },
      {
        target: from,
        styles: [
          {
            prop: "opacity",
            fvalue: "%x",
            from: () => [0],
            to: () => [1],
          },
          {
            prop: "transform",
            fvalue: "translate3d(%xpx, %xpx, 0)",
            from: () => {
              const offset = 8;
              const dir = maskPos.sub(centerPos).normalize();
              const vec = dir.mul(offset);

              return [vec.x, vec.y];
            },
            to: () => [0, 0],
          },
        ],
        duration: 0.35,
        delay: 0.1,
        bezier: "material-normal",
      },
    ],
  ];
}

export function runFadeInfo(infoContainer, maskPos) {
  requestAnimationFrame(() => {
    new SequenceAnimator([...sweptAnimation(infoContainer, maskPos)]).play();
  });
}

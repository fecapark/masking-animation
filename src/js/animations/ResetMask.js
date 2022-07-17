import { getDummyAnimationData } from "../lib/Animator/Animator.js";
import SequenceAnimator from "../lib/Animator/SequenceAnimator.js";

function moveMask(mask, info) {
  return [
    [
      {
        target: mask,
        styles: [
          {
            prop: "transform",
            fvalue: "translate3d(%x%, 0, 0)",
            from: () => [-100],
            to: () => [0],
          },
        ],
        duration: 1,
        bezier: "super-accel",
      },
      {
        target: info,
        styles: [
          {
            prop: "background",
            fvalue:
              "linear-gradient(0deg, rgba(0, 0, 0, %x) 5%, rgba(0, 0, 0, %x) 60%, rgba(0, 0, 0, 0))",
            from: () => [0.7, 0.5],
            to: () => [0, 0],
          },
        ],
        duration: 0.4,
        delay: 0.1,
        bezier: "material-normal",
      },
    ],
  ];
}

function hideInfo(info) {
  return [
    getDummyAnimationData(0.85),
    {
      target: info,
      styles: [
        {
          prop: "opacity",
          fvalue: "%x",
          from: () => [1],
          to: () => [0],
        },
      ],
      duration: 0.35,
      bezier: "material-normal",
    },
    getDummyAnimationData(0.5),
  ];
}

export function runResetMask(mask, info, onEnd = () => {}) {
  info.style.zIndex = "1000";

  requestAnimationFrame(() => {
    new SequenceAnimator(
      [...moveMask(mask, info), ...hideInfo(info)],
      onEnd
    ).play();
  });
}

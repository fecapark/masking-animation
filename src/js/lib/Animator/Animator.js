import { Bezier } from "../Bezier/Bezier.js";

const BEZIER_EASING_MAP = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  "material-normal": [0.4, 0, 0.2, 1],
  "material-accel": [0, 0, 0.2, 1],
  "super-accel": [0.22, 0.68, 0, 1],
};

export function getDummyAnimationData(delay) {
  return {
    target: document.createElement("div"),
    styles: [
      {
        prop: "opacity",
        fvalue: "%x",
        from: () => [0],
        to: () => [0],
      },
    ],
    duration: delay,
  };
}

export default class Animator {
  constructor(customData, moreOnEnd = () => {}, animationHistoryStorage) {
    this.preFromValues = [];
    this.preToValues = [];

    this.animator = null;
    this.animationHistoryStorage = animationHistoryStorage;
    this.moreOnEnd = moreOnEnd;

    this.data = this.parseData(customData);
  }

  parseData(customData) {
    function checkDataFormat(data) {
      data.styles.forEach((aStyleData) => {
        const { fvalue, from, to } = aStyleData;
        const fromValues = from();
        const toValues = to();

        if (fvalue.count("%x") !== fromValues.length) {
          throw RangeError(
            `You must set amount of from values same as format keywords. (from: ${
              fromValues.length
            }, format('%x'): ${fvalue.count("%x")})`
          );
        }

        if (fromValues.length !== toValues.length) {
          throw RangeError(
            "Animation from and to value must be matched one-to-one."
          );
        }
      });
    }

    const parseStylesAsHistoryData = () => {
      return customData.styles.map((aStyleData) => {
        const { prop, fvalue, from } = aStyleData;
        const fromValues = from();

        if (fvalue.includes("%x") && fromValues.length === 0) {
          const historyData = this.animationHistoryStorage.find(
            customData.target,
            prop,
            fvalue
          );

          if (!historyData)
            throw TypeError(
              "You must set 'from' values for initial animation data."
            );

          aStyleData.from = () => [...historyData.to()];
        }

        return aStyleData;
      });
    };

    const bezierValue =
      typeof customData.bezier === "string"
        ? BEZIER_EASING_MAP[customData.bezier]
        : customData.bezier ?? BEZIER_EASING_MAP["linear"];

    const resultData = {
      target: customData.target,
      styles: parseStylesAsHistoryData(),
      duration: customData.duration,
      delay: customData.delay ?? 0,
      bezier: bezierValue,
      onStart: customData.onStart ?? (() => {}),
      onEnd: customData.onEnd ?? (() => {}),
      pauseOnEnd: customData.pauseOnEnd ?? false,
      reverse: customData.reverse ?? false,
    };

    checkDataFormat(resultData);

    return resultData;
  }

  getCurrentValuesAsRatio(valueIndex, ratio) {
    const result = [];

    for (let i = 0; i < this.preFromValues[valueIndex].length; i++) {
      const aFrom = this.preFromValues[valueIndex][i];
      const aTo = this.preToValues[valueIndex][i];

      result.push(aFrom + (aTo - aFrom) * ratio);
    }

    return result;
  }

  animate(ratio) {
    const animateStyles = this.data.styles;
    const reverse = this.data.reverse;

    animateStyles.forEach((aAnimateStyle, index) => {
      const { prop, fvalue } = aAnimateStyle;

      const animatedValue = this.parseFormatedStyleString(
        fvalue,
        this.getCurrentValuesAsRatio(index, reverse ? 1 - ratio : ratio)
      );

      this.data.target.style.setProperty(prop, animatedValue);
    });
  }

  getAnimator() {
    let startTime = null;
    const bezier = Bezier(...this.data.bezier);

    const animator = () => {
      if (!startTime) startTime = new Date();
      const elapsedTime = (+new Date() - +startTime) / 1000;
      const timeRatio = Math.max(
        Math.min(elapsedTime / this.data.duration, 1),
        0
      );

      this.animate(bezier(timeRatio));

      return timeRatio === 1;
    };

    return animator;
  }

  parseFormatedStyleString(fstring, values) {
    const splited = fstring.split("%x");

    values.forEach((aValue, index) => {
      splited.splice(index * 2 + 1, 0, aValue.toString());
    });

    return splited.join("");
  }

  preCalculateValues() {
    this.data.styles.forEach((aStyleData) => {
      const { from, to } = aStyleData;

      this.preFromValues.push(from());
      this.preToValues.push(to());
    });
  }

  play() {
    const { onStart, target } = this.data;
    this.animator = this.animator ?? this.getAnimator();

    setTimeout(() => {
      requestAnimationFrame(() => {
        onStart({ target });
        this.preCalculateValues();
        this.runAnimationFrame();
      });
    }, this.data.delay * 1000);
  }

  runAnimationFrame() {
    const reqId = requestAnimationFrame(this.runAnimationFrame.bind(this));

    if (!this.animator || this.animator()) {
      cancelAnimationFrame(reqId);
      this.animator = null;

      this.data.onEnd({ target: this.data.target });
      this.moreOnEnd();
    }
  }
}

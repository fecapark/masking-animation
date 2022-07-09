import AnimationHistoryStorage from "./AnimationHistoryStorage.js";
import Animator from "./Animator.js";

export default class SequenceAnimator {
  constructor(customSequences, onAllEnd = () => {}) {
    this.idx = 0;
    this.endCount = 0;
    this.isPaused = false;
    this.onAllEnd = onAllEnd;

    this.animationHistoryStorage = new AnimationHistoryStorage();
    this.sequences = this.parseData(customSequences);
  }

  get currentSequence() {
    return this.sequences[this.idx];
  }

  parseData(customSequences) {
    return customSequences.map((aCustomSequence) => {
      if (!Array.isArray(aCustomSequence)) {
        return [aCustomSequence];
      }

      return aCustomSequence;
    });
  }

  play() {
    if (this.idx >= this.sequences.length) return;
    this.isPaused = false;

    this.currentSequence.forEach((aAnimationData) => {
      new Animator(
        aAnimationData,
        this.checkToNextSequence.bind(this),
        this.animationHistoryStorage
      ).play();
      this.animationHistoryStorage.push(aAnimationData);

      if (aAnimationData.pauseOnEnd) {
        this.isPaused = true;
      }
    });
  }

  checkToNextSequence() {
    const isSequenceEnd = () => {
      return this.endCount >= this.currentSequence.length;
    };

    const isAllSequencesEnd = () => {
      return this.idx >= this.sequences.length;
    };

    this.endCount++;
    if (!isSequenceEnd()) return;

    this.endCount = 0;
    this.idx++;

    if (isAllSequencesEnd()) {
      this.onAllEnd();
      this.isPaused = false;
      return;
    }

    if (this.isPaused) {
      return;
    }

    this.play();
  }
}

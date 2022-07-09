class HistoryStack {
  static datas = [];

  get length() {
    return HistoryStack.datas.length;
  }

  popBy(key) {
    return HistoryStack.datas
      .filter((aHistoryData) => {
        return key(aHistoryData);
      })
      .pop();
  }

  pushAsUniqueData(data, isSameData) {
    HistoryStack.datas = HistoryStack.datas.filter((aHistoryData) => {
      return !isSameData(aHistoryData);
    });

    HistoryStack.datas.push(data);
  }
}

export default class AnimationHistoryStorage {
  historyStack = new HistoryStack();

  get length() {
    return this.historyStack.length;
  }

  isFindingData(historyData, keyData) {
    return (
      historyData.target === keyData.target &&
      historyData.prop === keyData.prop &&
      historyData.fvalue === keyData.fvalue
    );
  }

  find(target, prop, fvalue) {
    return this.historyStack.popBy((aHistoryData) =>
      this.isFindingData(aHistoryData, { target, prop, fvalue })
    );
  }

  push(aAnimationData) {
    const { target, styles } = aAnimationData;

    styles.forEach((aStyleData) => {
      const { prop, fvalue, from, to } = aStyleData;
      this.historyStack.pushAsUniqueData(
        { target, prop, fvalue, from, to },
        (aHistoryData) => {
          return this.isFindingData(aHistoryData, { target, prop, fvalue });
        }
      );
    });
  }
}

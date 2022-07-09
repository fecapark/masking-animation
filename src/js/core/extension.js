export function stringExtension() {
  String.prototype.count = function (toCount) {
    if (toCount === "") return 0;
    return this.valueOf().split(toCount).length - 1;
  };
}

export class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(other) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  sub(other) {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  mul(other) {
    return new Vector2(this.x * other.x, this.y * other.y);
  }

  div(num) {
    return new Vector2(
      num === 0 ? 0 : this.x / num,
      num === 0 ? 0 : this.y / num
    );
  }

  copy() {
    return new Vector2(this.x, this.y);
  }
}

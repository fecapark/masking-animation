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

  mul(num) {
    return new Vector2(this.x * num, this.y * num);
  }

  div(num) {
    return new Vector2(
      num === 0 ? 0 : this.x / num,
      num === 0 ? 0 : this.y / num
    );
  }

  norm() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() {
    const norm = this.norm();
    return new Vector2(this.x / norm, this.y / norm);
  }

  getDistWith(other) {
    return this.sub(other).norm();
  }

  copy() {
    return new Vector2(this.x, this.y);
  }
}

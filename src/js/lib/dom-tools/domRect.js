import { Vector2 } from "../Vector/Vector.js";

export function getCenterPosFrom(element) {
  const domRect = element.getBoundingClientRect();

  return new Vector2(
    domRect.x + domRect.width / 2,
    domRect.y + domRect.height / 2
  );
}

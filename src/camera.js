class Camera {
  #eye;
  #at;
  #up;

  constructor({
    position = vec3(2, 2, 0),
    at = vec3(0, 0, 0),
    up = vec3(0, 1, 0),
  } = {}) {
    this.#eye = position;
    this.#at = at;
    this.#up = up;
  }

  moveTo(position) {
    const v = subtract(this.#at, this.#eye);
    this.#eye = position;
    this.#at = add(position, v);
  }

  moveForward(dist) {
    const v = normalize(subtract(this.#at, this.#eye));

    this.moveTo(add(this.#eye, scale(dist, v)));
  }

  moveBackward(dist) {
    this.moveForward(-dist);
  }

  moveRight(dist) {
    const v = normalize(cross(subtract(this.#at, this.#eye), this.#up));

    this.moveTo(add(this.#eye, scale(dist, v)));
  }

  moveLeft(dist) {
    this.moveRight(-dist);
  }

  moveUp(dist) {
    this.moveTo(add(this.#eye, scale(dist, this.#up)));
  }

  moveDown(dist) {
    this.moveUp(-dist);
  }

  getViewMatrix() {
    return lookAt(this.#eye, this.#at, this.#up);
  }

  lookTo(hAngle, vAngle) {
    const v = subtract(this.#at, this.#eye);
    const dist = Math.sqrt(dot(v, v));
    const newAt = add(
      this.#eye,
      scale(
        dist,
        vec3(
          Math.cos(vAngle) * Math.cos(hAngle),
          Math.sin(vAngle),
          Math.cos(vAngle) * Math.sin(hAngle)
        )
      )
    );
    this.#at = newAt;
  }
}

export default Camera;

import Object3D from "./object3d.js";

class Light extends Object3D {
  #color = vec4(0, 0, 0, 1);

  constructor({ color = vec4(0, 1, 1, 1) } = {}) {
    super();
    this.#color = color;
  }

  get color() {
    return this.#color;
  }

  set color(value) {
    this.#color = value;
  }
}

export default Light;

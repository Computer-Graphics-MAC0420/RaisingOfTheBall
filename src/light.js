import Object3D from "./object3d.js";

class Light extends Object3D {
  #color = vec4(0, 0, 0, 1);

  constructor({ color = vec4(1, 1, 1, 1) } = {}) {
    super();
    this.#color = color;
  }
}

export default Light;

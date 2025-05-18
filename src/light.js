import FixedColor from "./materials/fixed-color.js";
import Sphere from "./meshes/sphere.js";
import Object3D from "./object3d.js";

class Light extends Object3D {
  #color = vec4(0, 0, 0, 1);

  constructor({ color = vec4(1, 1, 1, 1), showGizmo = false } = {}) {
    const options = {};
    if (showGizmo) {
      options.mesh = new Sphere({
        density: 0,
        size: 0.1,
      });
      options.material = new FixedColor({
        color,
      });
    }

    super(options);
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

import { getModelMatrix } from "./utils";

class Mesh {
  #vertices;
  #colors;
  #indices;

  #translation = [0, 0, 0];
  #scale = [1, 1, 1];
  #rotation = [0, 0, 0];

  constructor({ vertices, colors, indices }) {
    this.vertices = vertices || [];
    this.colors = colors || [];
    this.indices = indices || [];
  }

  set vertices(val) {
    this.#vertices = val;
  }
  get vertices() {
    return this.#vertices;
  }
  set colors(val) {
    this.#colors = val;
  }
  get colors() {
    return this.#colors;
  }
  set indices(val) {
    this.#indices = val;
  }
  get indices() {
    return this.#indices;
  }

  get numV() {
    return this.#indices.length;
  }

  setTranslation(t) {
    if (Array.isArray(t)) {
      this.#translation = t;
    } else {
      const { x, y, z } = t;
      if (x) {
        this.#translation[0] = x;
      }
      if (y) {
        this.#translation[1] = y;
      }
      if (z) {
        this.#translation[2] = z;
      }
    }
  }

  getTranslation() {
    return this.#translation;
  }

  setScale(scale) {
    if (Array.isArray(scale)) {
      this.#scale = scale;
    } else {
      const { x, y, z } = scale;
      if (x) {
        this.#scale[0] = x;
      }
      if (y) {
        this.#scale[1] = y;
      }
      if (z) {
        this.#scale[2] = z;
      }
    }
  }
  getScale() {
    return this.#scale;
  }

  getRotation() {
    return this.#rotation;
  }

  setRotation(rot) {
    if (Array.isArray(rot)) {
      this.#rotation = rot;
    } else {
      const { x, y, z } = rot;
      if (x) {
        this.#rotation[0] = x;
      }
      if (y) {
        this.#rotation[1] = y;
      }
      if (z) {
        this.#rotation[2] = z;
      }
    }
  }

  getModelMatrix() {
    return getModelMatrix(this.#translation, this.#rotation, this.#scale);
  }
}

export default Mesh;

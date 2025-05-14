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
    const rotX = rotateX(this.#rotation[0]);
    const rotY = rotateY(this.#rotation[1]);
    const rotZ = rotateZ(this.#rotation[2]);

    const scale = mat4(
      this.#scale[0],
      0,
      0,
      0,
      0,
      this.#scale[1],
      0,
      0,
      0,
      0,
      this.#scale[2],
      0,
      0,
      0,
      0,
      1
    );

    const trans = translate(...this.#translation);

    const model = mult(trans, mult(rotZ, mult(rotY, mult(rotX, scale))));
    return model;
  }
}

export default Mesh;

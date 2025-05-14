import Mesh from "./mesh";
import { getModelMatrix } from "./utils";

class Object3D {
  #position = vec3(0, 0, 0);
  #rotation = vec3(0, 0, 0);
  #scale = vec3(1, 1, 1);
  #mesh;

  constructor({ position, mesh }) {
    this.position = position;
    this.mesh = mesh;
  }

  get position() {
    return this.#position;
  }

  set position(value) {
    this.#position = value;
  }

  get mesh() {
    return this.#mesh;
  }

  set mesh(value) {
    if (!(value instanceof Mesh)) {
      throw new Error("mesh must be an instance of Mesh");
    }
    this.#mesh = value;
  }

  getModelMatrix() {
    const model = mult(
      getModelMatrix(this.#position, this.#rotation, this.#scale),
      this.mesh.getModelMatrix()
    );

    return model;
  }
}

export default Object3D;

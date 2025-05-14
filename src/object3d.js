import Mesh from "./mesh";
import { getModelMatrix } from "./utils";

class Object3D {
  #position = vec3(0, 0, 0);
  #rotation = vec3(0, 0, 0);
  #scale = vec3(1, 1, 1);
  #velocity = vec3(0, 0, 0);
  #mesh;

  constructor({ position, velocity, mesh }) {
    this.position = position;

    if (velocity) {
      this.velocity = velocity;
    }

    this.mesh = mesh;
  }

  get position() {
    return this.#position;
  }

  set position(value) {
    this.#position = value;
  }

  get velocity() {
    return this.#velocity;
  }

  set velocity(value) {
    this.#velocity = value;
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

  update(dt) {
    this.#position = add(this.#position, mult(dt, this.#velocity));
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

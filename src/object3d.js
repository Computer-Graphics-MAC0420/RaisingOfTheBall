import Mesh from "./mesh";
import { getModelMatrix } from "./utils";

class Object3D {
  #position = vec3(0, 0, 0);
  #rotation = vec3(0, 0, 0);
  #scale = vec3(1, 1, 1);
  #velocity = vec3(0, 0, 0);
  #rotationSpeed = vec3(0, 0, 0);

  #mesh;

  constructor({ position, velocity, rotationSpeed, mesh }) {
    this.position = position;

    if (velocity) {
      this.velocity = velocity;
    }

    if (rotationSpeed) {
      this.rotationSpeed = rotationSpeed;
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

  get rotationSpeed() {
    return this.#rotationSpeed;
  }

  set rotationSpeed(value) {
    this.#rotationSpeed = value;
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
    // Update rotation and normalize to keep values between 0 and 2π
    this.#rotation = add(this.#rotation, mult(dt, this.#rotationSpeed));
    // Normalize each rotation component
    this.#rotation = vec3(
      this.#rotation[0] % 360,
      this.#rotation[1] % 360,
      this.#rotation[2] % 360
    );
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

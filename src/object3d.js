import Mesh from "./mesh";
import AvailableShaders, { DEFAULT_SHADER } from "./shaders";
import { getModelMatrix } from "./utils";

/**
 * Representa um objeto 3D no espaço.
 */
class Object3D {
  /** @type {vec3} Posição do objeto no espaço 3D */
  #position = vec3(0, 0, 0);
  /** @type {vec3} Ângulos de rotação em graus (x, y, z) */
  #rotation = vec3(0, 0, 0);
  /** @type {vec3} Escala do objeto em cada eixo */
  #scale = vec3(1, 1, 1);
  /** @type {vec3} Velocidade do objeto (unidades por segundo) */
  #velocity = vec3(0, 0, 0);
  /** @type {vec3} Velocidade de rotação (graus por segundo) */
  #rotationSpeed = vec3(0, 0, 0);

  /** @type {Mesh|null} Mesh que define a geometria do objeto */
  #mesh;
  /** @type {string} Identificador do shader usado para renderizar o objeto */
  #shader = DEFAULT_SHADER;

  /**
   * Cria um novo objeto 3D.
   * @param {Object} options - Opções de configuração
   * @param {vec3} [options.position=vec3(0,0,0)] - Posição inicial
   * @param {vec3} [options.velocity=vec3(0,0,0)] - Velocidade inicial
   * @param {vec3} [options.rotationSpeed=vec3(0,0,0)] - Velocidade de rotação inicial
   * @param {Mesh|null} [options.mesh=null] - Mesh do objeto
   * @param {string} [options.shader=DEFAULT_SHADER] - Shader para renderização
   */
  constructor({
    position = vec3(0, 0, 0),
    velocity = vec3(0, 0, 0),
    rotationSpeed = vec3(0, 0, 0),
    mesh = null,
    shader = DEFAULT_SHADER,
  } = {}) {
    this.position = position;
    this.velocity = velocity;
    this.rotationSpeed = rotationSpeed;

    this.mesh = mesh;
    this.shader = shader;
  }

  /**
   * @returns {vec3} Posição atual do objeto
   */
  get position() {
    return this.#position;
  }

  /**
   * Define a posição do objeto
   * @param {vec3} value - Nova posição
   */
  set position(value) {
    this.#position = value;
  }

  /**
   * @returns {vec3} Velocidade atual do objeto
   */
  get velocity() {
    return this.#velocity;
  }

  /**
   * Define a velocidade do objeto
   * @param {vec3} value - Nova velocidade
   */
  set velocity(value) {
    this.#velocity = value;
  }

  /**
   * @returns {vec3} Velocidade de rotação atual
   */
  get rotationSpeed() {
    return this.#rotationSpeed;
  }

  /**
   * Define a velocidade de rotação
   * @param {vec3} value - Nova velocidade de rotação
   */
  set rotationSpeed(value) {
    this.#rotationSpeed = value;
  }

  /**
   * @returns {Mesh|null} Mesh atual do objeto
   */
  get mesh() {
    return this.#mesh;
  }

  /**
   * Define o mesh do objeto
   * @param {Mesh|null} value - Novo mesh
   * @throws {Error} Se o valor não for uma instância de Mesh ou null
   */
  set mesh(value) {
    if (value && !(value instanceof Mesh)) {
      throw new Error("mesh must be an instance of Mesh");
    }
    this.#mesh = value;
  }

  /**
   * @returns {string} Identificador do shader atual
   */
  get shader() {
    return this.#shader;
  }

  /**
   * Define o shader do objeto
   * @param {string} value - Identificador do novo shader
   * @throws {Error} Se o shader não estiver disponível
   */
  set shader(value) {
    if (!(value in AvailableShaders)) {
      throw new Error(`Shader ${value} not available`);
    }
    this.#shader = value;
  }

  /**
   * Atualiza o estado do objeto com base no tempo decorrido
   * @param {number} dt - Delta de tempo em segundos
   */
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

  /**
   * Calcula a matriz de modelo para este objeto
   * @returns {mat4} Matriz de modelo para transformação
   */
  getModelMatrix() {
    const model = mult(
      getModelMatrix(this.#position, this.#rotation, this.#scale),
      this.mesh.getModelMatrix()
    );

    return model;
  }
}

export default Object3D;

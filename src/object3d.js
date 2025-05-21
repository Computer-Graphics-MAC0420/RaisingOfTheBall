import Mesh from "./mesh";
import AvailableShaders, { DEFAULT_SHADER } from "./shaders";
import Material from "./material";
import Transform from "./transform";

/**
 * Representa um objeto 3D no espaço.
 */
class Object3D {
  /** @type {Transform} Transformação do objeto */
  #transform;

  /** @type {vec3} Velocidade do objeto (unidades por segundo) */
  #velocity = vec3(0, 0, 0);

  /** @type {vec3} Velocidade de rotação (graus por segundo) */
  #rotationSpeed = vec3(0, 0, 0);

  /** @type {Mesh|null} Mesh que define a geometria do objeto */
  #mesh;

  /** @type {Material|null} Material do objeto */
  #material = null;

  /**
   * Cria um novo objeto 3D.
   * @param {Object} options - Opções de configuração
   * @param {Object} [options.transform] - Transformação inicial (position, rotation, scale)
   * @param {vec3} [options.velocity=vec3(0,0,0)] - Velocidade inicial
   * @param {vec3} [options.rotationSpeed=vec3(0,0,0)] - Velocidade de rotação inicial
   * @param {Mesh|null} [options.mesh=null] - Mesh do objeto
   * @param {string} [options.shader=DEFAULT_SHADER] - Shader para renderização (legado, use material)
   * @param {Material|null} [options.material=null] - Material do objeto
   */
  constructor({
    position,
    rotation,
    scale,
    transform = {},
    velocity = vec3(0, 0, 0),
    rotationSpeed = vec3(0, 0, 0),
    mesh = null,
    shader = DEFAULT_SHADER,
    material = null,
  } = {}) {
    if (position || rotation || scale) {
      transform = { position, rotation, scale, ...transform };
    }
    this.#transform = new Transform(transform);

    this.velocity = velocity;
    this.rotationSpeed = rotationSpeed;

    this.mesh = mesh;

    // Se um material for fornecido, use-o
    if (material) {
      this.material = material;
    }
    // Caso contrário, crie um material com o shader fornecido (para compatibilidade)
    else if (shader) {
      this.material = new Material({ shader });
    }
  }

  /**
   * @returns {vec3} Posição atual do objeto
   */
  get position() {
    return this.#transform.position;
  }

  /**
   * Define a posição do objeto
   * @param {vec3} value - Nova posição
   */
  set position(value) {
    this.#transform.position = value;
  }

  /**
   * @returns {vec3} Rotação atual do objeto
   */
  get rotation() {
    return this.#transform.rotation;
  }

  /**
   * Define a rotação do objeto
   * @param {vec3} value - Nova rotação
   */
  set rotation(value) {
    this.#transform.rotation = value;
  }

  /**
   * @returns {vec3} Escala atual do objeto
   */
  get scale() {
    return this.#transform.scale;
  }

  /**
   * Define a escala do objeto
   * @param {vec3} value - Nova escala
   */
  set scale(value) {
    this.#transform.scale = value;
  }

  /**
   * @returns {Transform} Transformação do objeto
   */
  get transform() {
    return this.#transform;
  }

  /**
   * Define a transformação do objeto
   * @param {Transform} value - Nova transformação
   */
  set transform(value) {
    if (value instanceof Transform) {
      this.#transform = value;
    }
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
    return this.material ? this.material.shader : DEFAULT_SHADER;
  }

  /**
   * Define o shader do objeto (compatibilidade)
   * @param {string} value - Identificador do novo shader
   * @throws {Error} Se o shader não estiver disponível
   */
  set shader(value) {
    if (!(value in AvailableShaders)) {
      throw new Error(`Shader ${value} not available`);
    }

    if (!this.material) {
      this.material = new Material({ shader: value });
    } else {
      this.material.shader = value;
    }
  }

  /**
   * @returns {Material|null} Material atual do objeto
   */
  get material() {
    return this.#material;
  }

  /**
   * Define o material do objeto
   * @param {Material|null} value - Novo material
   */
  set material(value) {
    this.#material = value;
  }

  /**
   * Atualiza o estado do objeto com base no tempo decorrido
   * @param {number} dt - Delta de tempo em segundos
   */
  update(dt) {
    this.position = add(this.position, mult(dt, this.velocity));

    const newRotation = add(this.rotation, mult(dt, this.#rotationSpeed));

    this.rotation = vec3(
      newRotation[0] % 360,
      newRotation[1] % 360,
      newRotation[2] % 360
    );
  }

  /**
   * Calcula a matriz de modelo para este objeto
   * @returns {mat4} Matriz de modelo para transformação
   */
  getModelMatrix() {
    return this.#transform.getModelMatrix();
  }
}

export default Object3D;

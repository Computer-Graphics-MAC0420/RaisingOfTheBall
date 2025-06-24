import { getModelMatrix, getModelMatrixGivenMatrix } from "./utils.js";

/**
 * Classe responsável por gerenciar transformações 3D
 * (posição, rotação e escala)
 */
class Transform {
  /** @type {vec3} Posição no espaço 3D */
  #position = vec3(0, 0, 0);

  /** @type {vec3} Ângulos de rotação em graus (x, y, z) */
  #rotation = vec3(0, 0, 0);

  /** @type {vec3} Escala em cada eixo */
  #scale = vec3(1, 1, 1);

  /**
   * Cria uma nova transformação
   * @param {Object} options - Opções de configuração
   * @param {vec3} [options.position] - Posição inicial
   * @param {vec3} [options.rotation] - Rotação inicial em graus
   * @param {vec3} [options.scale] - Escala inicial
   */
  constructor({
    position = vec3(0, 0, 0),
    rotation = vec3(0, 0, 0),
    scale = vec3(1, 1, 1),
  } = {}) {
    this.#position = position;
    this.#rotation = rotation;
    this.#scale = scale;
  }

  /**
   * @returns {vec3} Posição atual
   */
  get position() {
    return this.#position;
  }

  /**
   * Define a posição
   * @param {vec3} value - Nova posição
   */
  set position(value) {
    this.#position = value;
  }

  /**
   * Atualiza a posição
   * @param {Object|Array} t - Nova posição ou objeto com componentes x, y, z
   */
  setPosition(t) {
    if (Array.isArray(t)) {
      this.#position = t;
    } else {
      const { x, y, z } = t;
      if (x !== undefined) {
        this.#position[0] = x;
      }
      if (y !== undefined) {
        this.#position[1] = y;
      }
      if (z !== undefined) {
        this.#position[2] = z;
      }
    }
  }

  /**
   * @returns {vec3} Ângulos de rotação em graus (x, y, z)
   */
  get rotation() {
    return this.#rotation;
  }

  /**
   * Define a rotação
   * @param {vec3} value - Nova rotação em graus
   */
  set rotation(value) {
    this.#rotation = value;
  }

  /**
   * @returns {vec3} Escala atual em cada eixo
   */
  get scale() {
    return this.#scale;
  }

  /**
   * Define a escala
   * @param {vec3} value - Nova escala
   */
  set scale(value) {
    this.#scale = value;
  }

  /**
   * Calcula a matriz de modelo para esta transformação
   * @returns {mat4} Matriz de modelo para transformação
   */
  getModelMatrix() {
    return getModelMatrix(this.#position, this.#rotation, this.#scale);
  }

  /**
   * Calcula a matriz de modelo com base em matrizes de transformação específicas
   * @param {mat4} translationMatrix - Matriz de translação
   * @param {mat4} rotationMatrix - Matriz de rotação
   * @param {vec3} scale - Fator de escala
   * @returns {mat4} Matriz de modelo resultante
   */
  getModelMatrixGivenMatrix(translationMatrix, rotationMatrix, scale) {
    return getModelMatrixGivenMatrix(translationMatrix, rotationMatrix, scale);
  }

  /**
   * Atualiza a posição
   * @param {Object|Array} t - Nova posição ou objeto com componentes x, y, z
   */
  setPosition(t) {
    if (Array.isArray(t)) {
      this.#position = t;
    } else {
      const { x, y, z } = t;
      if (x !== undefined) {
        this.#position[0] = x;
      }
      if (y !== undefined) {
        this.#position[1] = y;
      }
      if (z !== undefined) {
        this.#position[2] = z;
      }
    }
  }

  /**
   * Atualiza a rotação
   * @param {Object|Array} rot - Nova rotação ou objeto com componentes x, y, z
   */
  setRotation(rot) {
    if (Array.isArray(rot)) {
      this.#rotation = rot;
    } else {
      const { x, y, z } = rot;
      if (x !== undefined) {
        this.#rotation[0] = x;
      }
      if (y !== undefined) {
        this.#rotation[1] = y;
      }
      if (z !== undefined) {
        this.#rotation[2] = z;
      }
    }
  }

  /**
   * Atualiza a escala
   * @param {Object|Array} scale - Nova escala ou objeto com componentes x, y, z
   */
  setScale(scale) {
    if (Array.isArray(scale)) {
      this.#scale = scale;
    } else {
      const { x, y, z } = scale;
      if (x !== undefined) {
        this.#scale[0] = x;
      }
      if (y !== undefined) {
        this.#scale[1] = y;
      }
      if (z !== undefined) {
        this.#scale[2] = z;
      }
    }
  }
}

export default Transform;

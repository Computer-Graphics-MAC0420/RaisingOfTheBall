import Texture from "./texture.js";

/**
 * Classe Material
 *
 * Responsável por gerenciar as propriedades de materiais de objetos 3D,
 * como textura, shader, brilho, mapa de normal, etc.
 */
export default class Material {
  #shininess;
  #ambientFactor = 0.2;
  #specularFactor = 0.5;
  #diffuseFactor = 0.5;

  /**
   * Cria uma nova instância de Material
   * @param {Object} options - Opções do material
   * @param {string} [options.shader="default"] - Nome do shader a ser usado
   * @param {Texture|null} [options.texture=null] - Textura do material
   * @param {number} [options.shininess=512.0] - Brilho do material
   * @param {number} [options.ambientFactor=0.2] - Fator ambiente do material
   * @param {number} [options.specularFactor=0.5] - Fator especular do material
   * @param {number} [options.diffuseFactor=0.5] - Fator difuso do material
   */
  constructor(options = {}) {
    const {
      shader = "default",
      texture = null,
      shininess = 128.0,
      ambientFactor = 0.2,
      specularFactor = 0.5,
      diffuseFactor = 0.5,
    } = options;

    this.#shininess = shininess;
    this.#specularFactor = specularFactor;
    this.#diffuseFactor = diffuseFactor;
    this.#ambientFactor = ambientFactor;
    this.shader = shader;
    this.texture = texture;
  }

  /**
   * Define a textura do material
   * @param {Object} texture - Textura a ser aplicada
   */
  setTexture(texture) {
    this.texture = texture;
  }

  set specularFactor(factor) {
    this.#specularFactor = factor;
  }

  get specularFactor() {
    return this.#specularFactor;
  }

  set diffuseFactor(factor) {
    this.#diffuseFactor = factor;
  }

  get diffuseFactor() {
    return this.#diffuseFactor;
  }

  set ambientFactor(factor) {
    this.#ambientFactor = factor;
  }

  get ambientFactor() {
    return this.#ambientFactor;
  }

  /**
   * Aplica o material ao contexto de renderização
   * @param {Object} gl - Contexto WebGL
   * @param {Shader} shader - Shader a ser usado para renderização
   */
  apply(_, shader) {
    if (!shader.program) return;

    if (this.texture) {
      shader.bindTexture(this.texture, "uTexture", 0);
    }

    shader.setUniform1f("uShininess", this.#shininess);
    shader.setUniform1f("uDiffuseFactor", this.#diffuseFactor);
    shader.setUniform1f("uSpecularFactor", this.#specularFactor);
    shader.setUniform1f("uAmbientFactor", this.#ambientFactor);
  }
}

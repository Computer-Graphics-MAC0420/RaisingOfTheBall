import { rgb } from "../colors.js";
import Material from "../material.js";

/**
 * Classe Solid - Representa um material com cor sólida
 *
 * Este material aplica uma única cor sólida aos objetos e possui
 * propriedades para controlar como a luz interage com a superfície.
 */
class Solid extends Material {
  // Propriedades privadas com valores padrão
  #color;
  #diffuseFactor = 0.5;
  #specularFactor = 0.5;
  #ambientFactor = 0.2;

  /**
   * Cria um novo material sólido
   * @param {Object} options - Opções de configuração
   * @param {vec4} [options.color=vec4(1,1,1,1)] - Cor do material (RGBA)
   * @param {number} [options.shininess=32.0] - Intensidade do brilho especular
   * @param {number} [options.diffuseFactor=0.7] - Fator de difusão da luz
   * @param {number} [options.specularFactor=0.3] - Intensidade do reflexo especular
   * @param {number} [options.ambientFactor=0.2] - Intensidade da luz ambiente
   * @param {string} [options.shader="light"] - Shader a ser usado
   */
  constructor(options = {}) {
    const { color } = options;

    // Chama o construtor da classe pai com o shader e outras propriedades
    super(options);

    // Inicializa as propriedades privadas
    this.#color = color;
  }

  /**
   * Obtém a cor do material
   * @returns {vec4} Cor do material
   */
  get color() {
    return this.#color;
  }

  /**
   * Obtém o fator de difusão
   * @returns {number} Valor do fator de difusão
   */
  get diffuseFactor() {
    return this.#diffuseFactor;
  }

  /**
   * Obtém o fator especular
   * @returns {number} Valor do fator especular
   */
  get specularFactor() {
    return this.#specularFactor;
  }

  /**
   * Obtém o fator de luz ambiente
   * @returns {number} Valor do fator de luz ambiente
   */
  get ambientFactor() {
    return this.#ambientFactor;
  }

  /**
   * Aplica o material ao contexto de renderização
   * @param {WebGL2RenderingContext} gl - Contexto WebGL
   * @param {Shader} shader - Shader a ser usado para renderização
   */
  apply(gl, shader) {
    // Aplica a cor do material
    if (shader.program) {
      // Aplica a cor do material
      shader.setUniform4fv("uSolidColor", this.#color);
    }

    // Chama o método apply da classe pai para aplicar outras propriedades
    super.apply(gl, shader);
  }
}

export default Solid;

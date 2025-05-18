import { rgb } from "../colors.js";
import Material from "../material.js";

/**
 * Classe FixedColor - Representa um material com uma cor fixa sem iluminação
 * 
 * Este material aplica uma única cor fixa aos objetos sem considerar 
 * qualquer efeito de iluminação.
 */
class FixedColor extends Material {
  // Propriedade privada para armazenar a cor
  #color;

  /**
   * Cria um novo material de cor fixa
   * @param {Object} options - Opções de configuração
   * @param {vec4} [options.color=vec4(1,1,1,1)] - Cor do material (RGBA)
   */
  constructor({ color = rgb(255, 255, 255) } = {}) {
    // Chama o construtor da classe pai especificando o shader "fixed"
    super({
      shader: "fixed",
    });

    // Inicializa a propriedade privada
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
   * Define a cor do material
   * @param {vec4} value - Nova cor do material
   */
  set color(value) {
    this.#color = value;
  }

  /**
   * Aplica o material ao contexto de renderização
   * @param {WebGL2RenderingContext} gl - Contexto WebGL
   * @param {Shader} shader - Shader a ser usado para renderização
   */
  apply(gl, shader) {
    // Aplica a cor fixa do material
    if (shader.program) {
      shader.setUniform4fv("uColor", this.#color);
    }

    // Chama o método apply da classe pai
    super.apply(gl, shader);
  }
}

export default FixedColor;
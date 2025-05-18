import Texture from "./texture";

/**
 * Classe Material
 *
 * Responsável por gerenciar as propriedades de materiais de objetos 3D,
 * como textura, shader, brilho, mapa de normal, etc.
 */
export default class Material {
  /**
   * Cria uma nova instância de Material
   * @param {Object} options - Opções do material
   * @param {string} [options.shader="default"] - Nome do shader a ser usado
   * @param {Texture|null} [options.texture=null] - Textura do material
   */
  constructor(options = {}) {
    const { shader = "default", texture = null } = options;

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
  }
}

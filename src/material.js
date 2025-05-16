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
   * @param {Object} [options.texture=null] - Textura do material
   * @param {number} [options.shininess=32.0] - Intensidade do brilho especular
   * @param {Object} [options.normalMap=null] - Mapa de normal
   * @param {Object} [options.properties={}] - Propriedades adicionais do material
   */
  constructor(options = {}) {
    const {
      shader = "default",
      texture = null,
      shininess = 32.0,
      normalMap = null,
      properties = {},
    } = options;

    this.shader = shader;
    this.texture = texture;
    this.shininess = shininess;
    this.normalMap = normalMap;
    this.properties = properties;
  }

  /**
   * Define a textura do material
   * @param {Object} texture - A textura a ser aplicada
   */
  setTexture(texture) {
    this.texture = texture;
    return this;
  }

  /**
   * Define o shader do material
   * @param {string} shader - Nome do shader a ser usado
   */
  setShader(shader) {
    this.shader = shader;
    return this;
  }

  /**
   * Define o brilho especular do material
   * @param {number} value - Valor do brilho
   */
  setShininess(value) {
    this.shininess = value;
    return this;
  }

  /**
   * Define o mapa de normal do material
   * @param {Object} normalMap - O mapa de normal a ser usado
   */
  setNormalMap(normalMap) {
    this.normalMap = normalMap;
    return this;
  }

  /**
   * Define uma propriedade personalizada do material
   * @param {string} name - Nome da propriedade
   * @param {*} value - Valor da propriedade
   */
  setProperty(name, value) {
    this.properties[name] = value;
    return this;
  }

  /**
   * Obtém uma propriedade personalizada do material
   * @param {string} name - Nome da propriedade
   * @returns {*} Valor da propriedade ou undefined
   */
  getProperty(name) {
    return this.properties[name];
  }

  /**
   * Aplica o material ao contexto de renderização
   * @param {Object} gl - Contexto WebGL
   * @param {Object} program - Programa de shader compilado
   */
  apply(gl, program) {
    return;
    // Aplicação básica do material
    // Esta função pode ser expandida no futuro para configurar
    // os uniforms necessários com base nas propriedades do material

    // Exemplo de aplicação de textura
    if (this.texture && program.uniforms.uSampler) {
      // Lógica para aplicar a textura
      // Seria implementada quando o sistema de shaders estiver pronto
    }

    // Exemplo de aplicação de brilho especular
    if (program.uniforms.uShininess) {
      // Lógica para configurar o brilho especular
      // gl.uniform1f(program.uniforms.uShininess, this.shininess);
    }
  }
}

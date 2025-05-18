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
   */
  constructor(options = {}) {
    const { shader = "default" } = options;

    this.shader = shader;
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

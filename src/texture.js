/**
 * Classe para gerenciar texturas no WebGL
 */
class Texture {
  /**
   * @type {WebGLTexture} - Textura do WebGL
   */
  #texture;

  /**
   * @type {WebGL2RenderingContext} - Contexto do WebGL
   */
  #gl;

  /**
   * @type {boolean} - Indica se a textura foi carregada
   */
  #loaded = false;

  /**
   * @param {WebGL2RenderingContext} gl - Contexto do WebGL
   * @param {string} imagePath - Caminho para a imagem da textura
   */
  constructor(gl, imagePath) {
    this.#gl = gl;
    this.#texture = gl.createTexture();

    // Carregar a imagem
    const image = new Image();
    image.onload = () => {
      this.#setupTexture(image);
      this.#loaded = true;
    };
    image.onerror = () => {
      console.error(`Falha ao carregar a textura: ${imagePath}`);
    };
    image.src = imagePath;
  }

  /**
   * Configura a textura no WebGL após o carregamento da imagem
   * @private
   * @param {HTMLImageElement} image - Elemento de imagem carregada
   */
  #setupTexture(image) {
    const gl = this.#gl;

    gl.bindTexture(gl.TEXTURE_2D, this.#texture);

    // Configuração de parâmetros da textura
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // Carrega a imagem na textura
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    // Libera o bind da textura
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Ativa a textura em uma unidade de textura específica
   * @param {number} textureUnit - Unidade de textura (0-31)
   */
  bind(textureUnit = 0) {
    const gl = this.#gl;

    // Ativa a unidade de textura
    gl.activeTexture(gl.TEXTURE0 + textureUnit);
    gl.bindTexture(gl.TEXTURE_2D, this.#texture);

    return textureUnit;
  }

  /**
   * Verifica se a textura foi carregada
   * @returns {boolean} - true se a textura foi carregada, false caso contrário
   */
  isLoaded() {
    return this.#loaded;
  }

  /**
   * Libera os recursos da textura
   */
  destroy() {
    if (this.#texture) {
      this.#gl.deleteTexture(this.#texture);
      this.#texture = null;
    }
  }
}

export default Texture;

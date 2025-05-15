/**
 * Classe responsável por gerenciar um shader
 */
class Shader {
  #gl;
  #program;
  #attributes = {};
  #uniforms = {};
  #buffers = {};

  /**
   * Cria uma nova instância de Shader
   * @param {WebGLRenderingContext} gl - O contexto WebGL
   * @param {string} vertexShaderSrc - O código fonte do vertex shader
   * @param {string} fragmentShaderSrc - O código fonte do fragment shader
   */
  constructor(gl, vertexShaderSrc, fragmentShaderSrc) {
    this.#gl = gl;
    this.#program = this._createProgram(vertexShaderSrc, fragmentShaderSrc);

    // Cria os buffers básicos
    this._createBuffers();
  }

  /**
   * Compila um shader
   * @param {number} type - O tipo do shader (gl.VERTEX_SHADER ou gl.FRAGMENT_SHADER)
   * @param {string} source - O código fonte do shader
   * @returns {WebGLShader} O shader compilado
   */
  _compileShader(type, source) {
    const typeStr =
      type === this.#gl.VERTEX_SHADER ? "VERTEX_SHADER" : "FRAGMENT_SHADER";
    console.log(`Compilando ${typeStr}...`);

    const shader = this.#gl.createShader(type);
    this.#gl.shaderSource(shader, source);
    this.#gl.compileShader(shader);

    if (!this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
      const error = this.#gl.getShaderInfoLog(shader);
      console.error(`Erro ao compilar ${typeStr}: ${error}`);
      console.error("Código fonte do shader:", source);
      this.#gl.deleteShader(shader);
      return null;
    }

    console.log(`${typeStr} compilado com sucesso!`);
    return shader;
  }

  /**
   * Cria um programa de shader
   * @param {string} vertexShaderSrc - O código fonte do vertex shader
   * @param {string} fragmentShaderSrc - O código fonte do fragment shader
   * @returns {WebGLProgram} O programa de shader criado
   */
  _createProgram(vertexShaderSrc, fragmentShaderSrc) {
    const vertexShader = this._compileShader(
      this.#gl.VERTEX_SHADER,
      vertexShaderSrc
    );
    const fragmentShader = this._compileShader(
      this.#gl.FRAGMENT_SHADER,
      fragmentShaderSrc
    );

    if (!vertexShader || !fragmentShader) {
      throw new Error("Erro ao compilar shaders");
    }

    const program = this.#gl.createProgram();
    this.#gl.attachShader(program, vertexShader);
    this.#gl.attachShader(program, fragmentShader);
    this.#gl.linkProgram(program);

    if (!this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
      console.error(
        `Erro ao vincular programa: ${this.#gl.getProgramInfoLog(program)}`
      );
      this.#gl.deleteProgram(program);
      return null;
    }

    return program;
  }

  /**
   * Cria os buffers básicos para o shader
   */
  _createBuffers() {
    // Buffer para índices
    this.#buffers.indices = this.#gl.createBuffer();
    if (!this.#buffers.indices) {
      throw new Error("Falha ao criar buffer de índices");
    }

    // Buffer para vértices
    this.#buffers.vertices = this.#gl.createBuffer();
    if (!this.#buffers.vertices) {
      throw new Error("Falha ao criar buffer de vértices");
    }

    // Buffer para normais
    this.#buffers.normals = this.#gl.createBuffer();
    if (!this.#buffers.normals) {
      throw new Error("Falha ao criar buffer de normais");
    }

    // Buffer para cores
    this.#buffers.colors = this.#gl.createBuffer();
    if (!this.#buffers.colors) {
      throw new Error("Falha ao criar buffer de cores");
    }
  }

  /**
   * Usa este shader para renderização
   */
  use() {
    this.#gl.useProgram(this.#program);
  }

  /**
   * Define um atributo do shader
   * @param {string} name - Nome do atributo
   * @param {number} size - Tamanho do atributo (número de componentes)
   * @param {number} type - Tipo do atributo (ex: gl.FLOAT)
   * @param {boolean} normalized - Se o atributo deve ser normalizado
   * @param {number} stride - Distância em bytes entre atributos consecutivos
   * @param {number} offset - Offset em bytes
   */
  defineAttribute(
    name,
    size,
    type = null,
    normalized = false,
    stride = 0,
    offset = 0
  ) {
    const gl = this.#gl;
    type = type || gl.FLOAT;

    const location = gl.getAttribLocation(this.#program, name);

    if (location === -1) {
      console.warn(`Atributo '${name}' não encontrado no shader`);
      return;
    }

    this.#attributes[name] = {
      location,
      size,
      type,
      normalized,
      stride,
      offset,
    };

    gl.enableVertexAttribArray(location);
  }

  /**
   * Define um uniform do shader
   * @param {string} name - Nome do uniform
   */
  defineUniform(name) {
    const location = this.#gl.getUniformLocation(this.#program, name);

    if (location === null) {
      console.warn(`Uniform '${name}' não encontrado no shader`);
      return;
    }

    this.#uniforms[name] = location;
  }

  /**
   * Define o valor de um uniform do tipo matriz 4x4
   * @param {string} name - Nome do uniform
   * @param {boolean} transpose - Se a matriz deve ser transposta
   * @param {Float32Array} value - Valor da matriz
   */
  setUniformMatrix4fv(name, transpose, value) {
    const location = this.#uniforms[name];
    if (location === undefined) {
      console.warn(`Uniform '${name}' não foi definido`);
      return;
    }

    this.#gl.uniformMatrix4fv(location, transpose, value);
  }

  /**
   * Vincula vértices ao buffer
   * @param {Array} vertices - Array de vértices
   */
  bindVertices(vertices) {
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffers.vertices);
    this.#gl.bufferData(
      this.#gl.ARRAY_BUFFER,
      flatten(vertices),
      this.#gl.STATIC_DRAW
    );

    const attr = this.#attributes.aPosition;
    if (attr) {
      this.#gl.vertexAttribPointer(
        attr.location,
        attr.size,
        attr.type,
        attr.normalized,
        attr.stride,
        attr.offset
      );
    }
  }

  /**
   * Vincula normais ao buffer
   * @param {Array} normals - Array de vetores normais
   */
  bindNormals(normals) {
    // Vincular os dados ao buffer
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffers.normals);
    this.#gl.bufferData(
      this.#gl.ARRAY_BUFFER,
      flatten(normals),
      this.#gl.STATIC_DRAW
    );

    // Configurar o atributo no shader
    const attr = this.#attributes.aNormal;
    if (attr) {
      this.#gl.vertexAttribPointer(
        attr.location,
        attr.size,
        attr.type,
        attr.normalized,
        attr.stride,
        attr.offset
      );
    }
  }

  /**
   * Vincula cores ao buffer
   * @param {Array} colors - Array de cores
   */
  bindColors(colors) {
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffers.colors);
    this.#gl.bufferData(
      this.#gl.ARRAY_BUFFER,
      flatten(colors),
      this.#gl.STATIC_DRAW
    );

    const attr = this.#attributes.aColor;
    if (attr) {
      this.#gl.vertexAttribPointer(
        attr.location,
        attr.size,
        attr.type,
        attr.normalized,
        attr.stride,
        attr.offset
      );
    }
  }

  /**
   * Vincula índices ao buffer
   * @param {Array} indices - Array de índices
   */
  bindIndices(indices) {
    this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.#buffers.indices);
    this.#gl.bufferData(
      this.#gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices),
      this.#gl.STATIC_DRAW
    );
  }

  /**
   * Vincula um mesh ao shader
   * @param {Mesh} mesh - O mesh a ser vinculado
   */
  bindMesh(mesh) {
    this.bindVertices(mesh.vertices);
    this.bindNormals(mesh.normals);
    this.bindColors(mesh.colors);
    this.bindIndices(mesh.indices);
  }

  /**
   * @returns {WebGLProgram} O programa WebGL
   */
  get program() {
    return this.#program;
  }
}

export default Shader;

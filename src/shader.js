/**
 * Classe responsável por gerenciar um shader
 */
class Shader {
  #gl;
  #program;
  #attributes = {};
  #uniforms = {};
  #buffers = {};
  #textures = {};

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

    // Buffer para coordenadas de textura
    this.#buffers.texCoords = this.#gl.createBuffer();
    if (!this.#buffers.texCoords) {
      throw new Error("Falha ao criar buffer de coordenadas de textura");
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
      this.#attributes[name] = null;
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
      this.#uniforms[name] = null;
      return;
    }

    this.#uniforms[name] = location;
  }

  /**
   * Obtém a localização de um uniform
   * @param {string} name - Nome do uniform
   * @return {WebGLUniformLocation|null} A localização do uniform ou null se não encontrado
   */
  getLocation(name) {
    const location = this.#uniforms[name];
    if (location === undefined) {
      return null;
    }
    if (location === null) {
      console.warn(`Uniform '${name}' não encontrado no shader`);
      return null;
    }

    return location;
  }

  /**
   * Define o valor de um uniform do tipo matriz 4x4
   * @param {string} name - Nome do uniform
   * @param {boolean} transpose - Se a matriz deve ser transposta
   * @param {Float32Array} value - Valor da matriz
   */
  setUniformMatrix4fv(name, transpose, value) {
    const location = this.getLocation(name);
    this.#gl.uniformMatrix4fv(location, transpose, value);
  }

  /**
   * Define o valor de um uniform do tipo vetor 3D
   * @param {string} name - Nome do uniform
   * @param {Float32Array|Array} value - Valor do vetor (3 componentes)
   */
  setUniform3fv(name, value) {
    const location = this.getLocation(name);
    this.#gl.uniform3fv(location, value);
  }

  /**
   * Define o valor de um uniform do tipo vetor 4D
   * @param {string} name - Nome do uniform
   * @param {Float32Array|Array} value - Valor do vetor (4 componentes)
   */
  setUniform4fv(name, value) {
    const location = this.getLocation(name);
    this.#gl.uniform4fv(location, value);
  }

  /**
   * Define o valor de um uniform do tipo inteiro
   * @param {string} name - Nome do uniform
   * @param {number} value - Valor do inteiro
   */
  setUniform1i(name, value) {
    const location = this.getLocation(name);
    this.#gl.uniform1i(location, value);
  }

  /**
   * Define o valor de um uniform do tipo ponto flutuante
   * @param {string} name - Nome do uniform
   * @param {number} value - Valor do float
   */
  setUniform1f(name, value) {
    const location = this.getLocation(name);
    this.#gl.uniform1f(location, value);
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
   * Vincula coordenadas de textura ao buffer
   * @param {Array} texCoords - Array de coordenadas de textura
   */
  bindTexCoords(texCoords) {
    this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, this.#buffers.texCoords);
    this.#gl.bufferData(
      this.#gl.ARRAY_BUFFER,
      flatten(texCoords),
      this.#gl.STATIC_DRAW
    );

    const attr = this.#attributes.aTexCoord;
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
   * Vincula uma textura ao shader
   * @param {Texture} texture - A textura a ser vinculada
   * @param {string} uniformName - Nome do uniform sampler2D no shader
   * @param {number} textureUnit - Unidade de textura a ser usada (0-31)
   */
  bindTexture(texture, uniformName, textureUnit = 0) {
    // Ativa a textura na unidade especificada
    const unit = texture.bind(textureUnit);

    // Define o uniform sampler2D com o valor da unidade de textura
    this.setUniform1i(uniformName, unit);

    // Armazena a referência à textura
    this.#textures[uniformName] = texture;
  }

  /**
   * Vincula os dados de uma luz ao shader
   * @param {Light} light - A fonte de luz
   */
  bindLight(light) {
    // Envia a posição da luz para o shader
    if (light.position) {
      this.setUniform3fv("uLightPos", light.position);
    }

    // Envia a cor da luz para o shader se disponível
    if (light.color) {
      this.setUniform4fv("uLightColor", light.color);
    }

    // Outras propriedades da luz podem ser adicionadas aqui
    // por exemplo: intensidade, atenuação, etc.
  }

  /**
   * Vincula um mesh ao shader
   * @param {Mesh} mesh - O mesh a ser vinculado
   */
  bindMesh(mesh) {
    this.bindVertices(mesh.vertices);
    this.bindNormals(mesh.normals);
    this.bindColors(mesh.colors);

    // Vincula coordenadas de textura se disponíveis
    if (mesh.texCoords && this.#attributes.aTexCoord) {
      this.bindTexCoords(mesh.texCoords);
    }

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

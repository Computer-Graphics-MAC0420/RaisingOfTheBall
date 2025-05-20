import Object3D from "./object3d";
import Shader from "./shader";
import AvailableShaders from "./shaders";
import Camera from "./camera";
import Light from "./light";
import Texture from "./texture";

class Engine {
  /**
   * @private
   * @type {HTMLCanvasElement} - The canvas element used for rendering
   */
  #canvas;

  /**
   * @private
   * @type {Object.<number, Object3D>} - Dictionary of objects in the scene, indexed by unique IDs
   */
  #objects = {};

  /**
   * @private
   * @type {Object.<string, Shader>} - Dictionary of available shaders, indexed by name
   */
  #shaders = {};

  /**
   * @private
   * @type {Shader|null} - Currently active shader
   */
  #activeShader = null;

  /**
   * @private
   * @type {number[]} - Background color in RGBA format [r, g, b, a]
   */
  #background = [0.0, 0.0, 0.0, 1.0];

  /**
   * @private
   * @type {number} - Timestamp of the last frame in milliseconds
   */
  #lastTime = 0;

  /**
   * @private
   * @type {Camera} - Camera used for rendering the scene
   */
  #camera;

  /**
   * @private
   * @type {Light} - Light source used in the scene
   */
  #light;

  /**
   * @private
   * @type {WebGLFramebuffer} - Framebuffer usado para o shadow mapping
   */
  #shadowFramebuffer = null;

  /**
   * @private
   * @type {WebGLTexture} - Textura que armazena o depth map
   */
  #shadowDepthTexture = null;

  /**
   * @private
   * @type {number} - Resolução do shadow map
   */
  #shadowMapResolution = 1024;

  /**
   * @type {function(number):void|undefined} - Callback function for update events
   * @param {number} dt - Time delta in milliseconds since the last update
   */
  onUpdate;

  #lastTimeFPS;

  get camera() {
    return this.#camera;
  }

  get light() {
    return this.#light;
  }

  constructor(canvasID = "canvas") {
    this._initComponents(canvasID);
  }

  start() {
    this.#lastTime = Date.now();
    this.#lastTimeFPS = Date.now();
    this.mainLoop();
  }

  mainLoop() {
    const now = Date.now();
    const dt = now - this.#lastTime; // milliseconds
    this.#lastTime = now;

    this.update(dt);
    this.render();

    window.requestAnimationFrame(() => this.mainLoop());
  }

  update(dt) {
    if (this.fpsDisplay) {
      this.fpsDisplay.innerText = `FPS: ${this.fps}`;
    }

    if (this.onUpdate) {
      this.onUpdate(dt);
    }

    for (const obj of Object.values(this.#objects)) {
      obj.update(dt);
    }
  }

  render() {
    const now = Date.now();
    const dt = (now - this.#lastTimeFPS) / 1000; // seconds
    this.#lastTimeFPS = now;
    this.fps = Math.round(1 / dt);

    // Passo 1: Renderiza a cena do ponto de vista da luz (cria o shadow map)
    this._renderShadowMap();

    // Passo 2: Renderiza a cena do ponto de vista da câmera, usando o shadow map
    this._renderScene();
  }

  /**
   * Renderiza o shadow map do ponto de vista da luz
   * @private
   */
  _renderShadowMap() {
    const gl = this.gl;

    // Ativa o framebuffer do shadow map
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#shadowFramebuffer);

    // Define a viewport para a resolução do shadow map
    gl.viewport(0, 0, this.#shadowMapResolution, this.#shadowMapResolution);

    // Limpa o depth buffer
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // Ativa o shader de sombra
    this.setActiveShader("shadow");

    // Calcula a matriz de transformação do espaço da luz
    const lightProjection = this.#light.getProjectionMatrix();
    const lightView = this.#light.getViewMatrix();

    // Define as matrizes para o shader de sombra
    this.#activeShader.setUniformMatrix4fv("uView", false, flatten(lightView));
    this.#activeShader.setUniformMatrix4fv(
      "uPerspective",
      false,
      flatten(lightProjection)
    );

    // Renderiza todos os objetos para o shadow map (sem o próprio gizmo da luz)
    for (const obj of Object.values(this.#objects)) {
      this._renderObjectToShadowMap(obj);
    }

    // Restaura o framebuffer padrão
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Restaura a viewport para o tamanho da tela
    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
  }

  /**
   * Renderiza um objeto para o shadow map
   * @private
   * @param {Object3D} obj - Objeto a ser renderizado
   */
  _renderObjectToShadowMap(obj) {
    if (!obj.mesh) return;

    const model = obj.getModelMatrix();
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    // Renderiza apenas usando os vértices (não precisamos de cores, normais, etc.)
    if (obj.mesh.vertices) {
      this.#activeShader.bindVertices(obj.mesh.vertices);

      if (obj.mesh.useIndices) {
        this.#activeShader.bindIndices(obj.mesh.indices);
        this.gl.drawElements(
          this.gl.TRIANGLES,
          obj.mesh.numV,
          this.gl.UNSIGNED_SHORT,
          0
        );
      } else {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertices.length);
      }
    }
  }

  /**
   * Renderiza a cena final usando o shadow map
   * @private
   */
  _renderScene() {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calcula a matriz de transformação shadow
    const lightProjection = this.#light.getProjectionMatrix();
    const lightView = this.#light.getViewMatrix();
    const lightMatrix = mult(lightProjection, lightView);

    // Renderiza o gizmo da luz, se necessário
    this.renderObject(this.#light);

    const objByShader = {};
    for (const obj of Object.values(this.#objects)) {
      if (obj.material) {
        const shaderName = obj.material.shader;
        if (!objByShader[shaderName]) {
          objByShader[shaderName] = [];
        }
        objByShader[shaderName].push(obj);
      }
    }

    // Renderiza todos os objetos com sombra
    for (const [shaderName, objects] of Object.entries(objByShader)) {
      this.setActiveShader(shaderName);

      // Antes de renderizar, configura a textura do shadow map
      gl.activeTexture(gl.TEXTURE1); // Use TEXTURE1 para o shadow map
      gl.bindTexture(gl.TEXTURE_2D, this.#shadowDepthTexture);

      if (this.#activeShader.hasUniform("uShadowMap")) {
        this.#activeShader.setUniform1i("uShadowMap", 1); // TEXTURE1
      }

      if (this.#activeShader.hasUniform("uLightMatrix")) {
        this.#activeShader.setUniformMatrix4fv(
          "uLightMatrix",
          false,
          flatten(lightMatrix)
        );
      }

      for (const obj of objects) {
        this.renderObject(obj);
      }
    }
  }

  _initComponents(canvasID) {
    this.#canvas = document.getElementById(canvasID);
    this.fpsDisplay = document.getElementById("fps");

    if (!this.#canvas) {
      throw new Error("Canvas not found");
    }

    console.log("Canvas: ", this.#canvas.width, this.#canvas.height);

    const gl = this.#canvas.getContext("webgl2");
    if (!gl) {
      alert("Vixe! Não achei WebGL 2.0 aqui :-(");
      throw new Error("WebGL 2.0 not supported");
    }

    this.gl = gl;
  }

  resize(width, height) {
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    this.camera.setResolution(width, height);
  }

  async init() {
    const gl = this.gl;

    this.#camera = new Camera();
    this.#light = new Light({
      showGizmo: true, //! Remove this if you don't want to show the light gizmo
    });

    this.resize(window.innerWidth, window.innerHeight);
    gl.clearColor(...this.#background);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);

    // Inicializando o framebuffer para shadow mapping
    this._initShadowFramebuffer();

    await this._initShaders();
  }

  /**
   * Inicializa o framebuffer para o shadow mapping
   * @private
   */
  _initShadowFramebuffer() {
    const gl = this.gl;
    const resolution = this.#shadowMapResolution;

    // Cria o framebuffer
    this.#shadowFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#shadowFramebuffer);

    // Cria a textura para armazenar os dados de profundidade
    this.#shadowDepthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.#shadowDepthTexture);

    // Configura a textura para armazenar o depth map
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT16, // formato de profundidade
      resolution,
      resolution,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_SHORT,
      null
    );

    // Configurações da textura
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Anexa a textura ao framebuffer como depth attachment
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.#shadowDepthTexture,
      0
    );

    // Já que só precisamos do depth buffer, desabilitamos as cores
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);

    // Verifica se o framebuffer está completo
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error("Framebuffer não está completo:", status);
    }

    // Desvincula o framebuffer para continuar com a renderização normal
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  async _initShaders() {
    for (const [name, shaderConfig] of Object.entries(AvailableShaders)) {
      this.#shaders[name] = new Shader(
        this.gl,
        shaderConfig.vertexSrc,
        shaderConfig.fragmentSrc
      );

      const shader = this.#shaders[name];

      // Define os atributos com base na configuração
      if (shaderConfig.attributes) {
        for (const [attrName, attrConfig] of Object.entries(
          shaderConfig.attributes
        )) {
          shader.defineAttribute(attrName, attrConfig.size);
        }
      }

      // Define os uniforms com base na configuração
      if (shaderConfig.uniforms) {
        for (const uniformName of shaderConfig.uniforms) {
          shader.defineUniform(uniformName);
        }
      }
    }

    // Define como shader ativo
    this.setActiveShader("default");
  }

  bindVertices(vertices) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindVertices(vertices);
  }

  bindNormals(normals) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindNormals(normals);
  }

  bindColors(colors) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindColors(colors);
  }

  bindIndices(indices) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindIndices(indices);
  }

  bindMesh(mesh) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindMesh(mesh);
  }

  bindCamera() {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }
    const view = this.#camera.getViewMatrix();
    const projection = this.#camera.getProjectionMatrix();

    this.#activeShader.setUniformMatrix4fv("uView", false, flatten(view));
    this.#activeShader.setUniformMatrix4fv(
      "uPerspective",
      false,
      flatten(projection)
    );
  }

  renderMesh(mesh) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.bindMesh(mesh);

    const model = mesh.getModelMatrix();
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    if (mesh.useIndices) {
      // Renderiza usando índices
      this.gl.drawElements(
        this.gl.TRIANGLES,
        mesh.numV,
        this.gl.UNSIGNED_SHORT,
        0
      );
    } else {
      // Renderiza sem usar índices
      this.gl.drawArrays(this.gl.TRIANGLES, 0, mesh.vertices.length);
    }
  }

  renderObject(obj) {
    const gl = this.gl;
    if (!(obj instanceof Object3D)) {
      throw new Error("obj must be an instance of Object3D");
    }

    // Use o shader do material ou o shader padrão do objeto
    this.setActiveShader(obj.shader);

    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    // Vincula a luz ao shader usando o novo método bindLight
    this.#activeShader.bindLight(this.#light);

    this.bindCamera();

    if (obj.mesh) {
      this.bindMesh(obj.mesh);
    }

    // Se o objeto tiver um material, aplique-o
    if (obj.material) {
      // Aplique os uniforms adicionais do material
      obj.material.apply(this.gl, this.#activeShader);
    }

    const model = obj.getModelMatrix();
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    if (obj.mesh.useIndices) {
      // Renderiza usando índices
      this.gl.drawElements(
        this.gl.TRIANGLES,
        obj.mesh.numV,
        this.gl.UNSIGNED_SHORT,
        0
      );
    } else {
      // Renderiza sem usar índices
      this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertices.length);
    }
  }

  getUniqueID() {
    const MAX = 1000000;
    const MIN = 1;
    const id = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    if (this.#objects[id]) {
      return this.getUniqueID();
    }

    return id;
  }

  getObject(id) {
    return this.#objects[id];
  }

  addObject(obj) {
    if (!(obj instanceof Object3D)) {
      throw new Error("obj must be an instance of Object3D");
    }
    const id = this.getUniqueID();
    this.#objects[id] = obj;

    console.log("Adding object with id: ", id);
  }

  removeObject(id) {
    delete this.#objects[id];
  }

  /**
   * Define o shader ativo
   * @param {string} shaderName - Nome do shader a ser ativado
   */
  setActiveShader(shaderName) {
    const shader = this.#shaders[shaderName];
    if (!shader) {
      throw new Error(`Shader ${shaderName} não encontrado`);
    }

    this.#activeShader = shader;
    shader.use();
  }

  /**
   * Adiciona um novo shader
   * @param {string} name - Nome do shader
   * @param {Shader} shader - Instância do shader
   */
  addShader(name, shader) {
    if (!(shader instanceof Shader)) {
      throw new Error("shader deve ser uma instância de Shader");
    }

    this.#shaders[name] = shader;
  }

  /**
   * Obtém um shader pelo nome
   * @param {string} name - Nome do shader
   * @returns {Shader} - Instância do shader ou undefined se não existir
   */
  getShader(name) {
    return this.#shaders[name];
  }
}

export default Engine;

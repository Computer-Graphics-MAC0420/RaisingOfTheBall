import Object3D from "./object3d";
import Shader from "./shader";
import AvailableShaders from "./shaders";
import Camera from "./camera";
import Light from "./light";

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
   * @type {function(number):void|undefined} - Callback function for update events
   * @param {number} dt - Time delta in milliseconds since the last update
   */
  onUpdate;

  get camera() {
    return this.#camera;
  }

  constructor(canvasID = "canvas") {
    this._initComponents(canvasID);
  }

  start() {
    this.#lastTime = Date.now();
    this.mainLoop();
  }

  mainLoop() {
    const now = Date.now();
    const dt = now - this.#lastTime; // milliseconds
    this.#lastTime = now;

    this.update(dt);
    this.render();

    window.requestAnimationFrame(this.mainLoop.bind(this));
  }

  update(dt) {
    if (this.onUpdate) {
      this.onUpdate(dt);
    }

    for (const obj of Object.values(this.#objects)) {
      obj.update(dt);
    }
  }

  render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    for (const obj of Object.values(this.#objects)) {
      this.renderObject(obj);
    }
  }

  _initComponents(canvasID) {
    this.#canvas = document.getElementById(canvasID);

    if (!this.#canvas) {
      throw new Error("Canvas not found");
    }

    console.log("Canvas: ", this.#canvas.width, this.#canvas.height);
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
    window.addEventListener("resize", () => {
      this.#canvas.width = window.innerWidth;
      this.#canvas.height = window.innerHeight;
      this.gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    });

    const gl = this.#canvas.getContext("webgl2");
    if (!gl) {
      alert("Vixe! Não achei WebGL 2.0 aqui :-(");
      throw new Error("WebGL 2.0 not supported");
    }

    this.gl = gl;
  }

  async init() {
    const gl = this.gl;
    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    gl.clearColor(...this.#background);
    gl.enable(gl.DEPTH_TEST);

    this.perspective = perspective(60, 1, 0.1, 5);
    this.#camera = new Camera();
    this.#light = new Light();

    await this._initShaders();
  }

  async _initShaders() {
    for (const [name, shader] of Object.entries(AvailableShaders)) {
      this.#shaders[name] = new Shader(
        this.gl,
        shader.vertexSrc,
        shader.fragmentSrc
      );
    }

    for (const shader of Object.values(this.#shaders)) {
      // Define os atributos
      shader.defineAttribute("aPosition", 3);
      shader.defineAttribute("aNormal", 3);
      shader.defineAttribute("aColor", 4);

      shader.defineUniform("uView");
      shader.defineUniform("uModel");
      shader.defineUniform("uPerspective");
    }

    // Define como shader ativo
    this.setActiveShader("default");

    // Calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
    // que é feita apenas 1 vez
    this.perspective = perspective(60, 1, 0.1, 50);
    this.#activeShader.setUniformMatrix4fv(
      "uPerspective",
      false,
      flatten(this.perspective)
    );

    // Calcula a matriz de transformação da camera, apenas 1 vez
    let eye = vec3(1.75, 1.75, 1.75);
    let at = vec3(0, 0, 0);
    let up = vec3(0, 1, 0);
    this.view = lookAt(eye, at, up);
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
    this.#activeShader.setUniformMatrix4fv("uView", false, flatten(view));
  }

  renderMesh(mesh) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.bindMesh(mesh);

    const model = mesh.getModelMatrix();
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    this.gl.drawElements(
      this.gl.TRIANGLES,
      mesh.numV,
      this.gl.UNSIGNED_BYTE,
      0
    );
  }

  renderObject(obj) {
    if (!(obj instanceof Object3D)) {
      throw new Error("obj must be an instance of Object3D");
    }

    this.setActiveShader(obj.shader);

    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.bindCamera();
    this.#activeShader.setUniformMatrix4fv(
      "uPerspective",
      false,
      flatten(this.perspective)
    );

    this.bindMesh(obj.mesh);

    const model = obj.getModelMatrix();
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    this.gl.drawElements(
      this.gl.TRIANGLES,
      obj.mesh.numV,
      this.gl.UNSIGNED_BYTE,
      0
    );
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

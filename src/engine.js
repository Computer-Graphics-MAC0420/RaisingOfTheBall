import gVertexShaderSrc from "./shaders/vertex.glsl?raw";
import gFragmentShaderSrc from "./shaders/fragment.glsl?raw";
import Object3D from "./object3d";

function createBuffer(gl, bufferType) {
  const buffer = gl.createBuffer();
  if (!buffer) {
    throw new Error("Failed to create buffer");
  }

  gl.bindBuffer(bufferType, buffer);

  return buffer;
}

class Engine {
  #canvas;
  #objects = {};
  #shader = {};
  #background = [0.0, 0.0, 0.0, 1.0];
  #lastTime = 0;

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
    for (const obj of Object.values(this.#objects)) {
      obj.update(dt);
    }
  }

  render() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    this.bindCamera();

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

    await this._initShaders();
  }

  async _initShaders() {
    const gl = this.gl;
    this.#shader.program = makeProgram(
      gl,
      gVertexShaderSrc,
      gFragmentShaderSrc
    );
    gl.useProgram(this.#shader.program);

    this.#shader.bufIndices = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER);
    this.#shader.bufVertices = createBuffer(gl, gl.ARRAY_BUFFER);

    this.#shader.aPosition = gl.getAttribLocation(
      this.#shader.program,
      "aPosition"
    );
    gl.vertexAttribPointer(this.#shader.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.#shader.aPosition);

    // buffer de cores
    this.#shader.bufColors = createBuffer(gl, gl.ARRAY_BUFFER);

    this.#shader.aColor = gl.getAttribLocation(this.#shader.program, "aColor");
    gl.vertexAttribPointer(this.#shader.aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.#shader.aColor);

    // resolve os uniforms

    this.#shader.uView = gl.getUniformLocation(this.#shader.program, "uView");
    this.#shader.uModel = gl.getUniformLocation(this.#shader.program, "uModel");

    this.#shader.uPerspective = gl.getUniformLocation(
      this.#shader.program,
      "uPerspective"
    );

    // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
    // que é feita apenas 1 vez
    this.perspective = perspective(60, 1, 0.1, 5);
    gl.uniformMatrix4fv(
      this.#shader.uPerspective,
      false,
      flatten(this.perspective)
    );

    // calcula a matriz de transformação da camera, apenas 1 vez
    let eye = vec3(1.75, 1.75, 1.75);
    let at = vec3(0, 0, 0);
    let up = vec3(0, 1, 0);
    this.view = lookAt(eye, at, up);
  }

  bindVertices(vertices) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.#shader.bufVertices);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(vertices),
      this.gl.STATIC_DRAW
    );
  }

  bindColors(colors) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.#shader.bufColors);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(colors),
      this.gl.STATIC_DRAW
    );
  }

  bindIndices(indices) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.#shader.bufIndices);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array(indices),
      this.gl.STATIC_DRAW
    );
  }

  bindMesh(mesh) {
    this.bindVertices(mesh.vertices);
    this.bindColors(mesh.colors);
    this.bindIndices(mesh.indices);
  }

  bindCamera() {
    this.gl.uniformMatrix4fv(this.#shader.uView, false, flatten(this.view));
  }

  renderMesh(mesh) {
    this.bindMesh(mesh);

    const model = cube.getModelMatrix();
    this.gl.uniformMatrix4fv(this.#shader.uModel, false, flatten(model));

    this.gl.drawElements(
      this.gl.TRIANGLES,
      mesh.numV,
      this.gl.UNSIGNED_BYTE,
      0
    );
  }

  renderObject(obj) {
    this.bindMesh(obj.mesh);

    const model = obj.getModelMatrix();
    this.gl.uniformMatrix4fv(this.#shader.uModel, false, flatten(model));

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
}

export default Engine;

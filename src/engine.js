import gVertexShaderSrc from "./shaders/vertex.glsl?raw";
import gFragmentShaderSrc from "./shaders/fragment.glsl?raw";
import Mesh from "./mesh";
import Object3D from "./object3d";

const EIXO_X = 0;
const EIXO_Y = 1;
const EIXO_Z = 2;

var gCtx = {
  axis: 0, // eixo rodando
  theta: [0, 0, 0], // angulos por eixo
  pause: false, //
  vista: mat4(), // view matrix, inicialmente identidade
  perspectiva: mat4(), // projection matrix
  cycle: 0,
};

const cube = new Mesh({
  vertices: [
    vec3(-0.5, -0.5, 0.5),
    vec3(-0.5, 0.5, 0.5),
    vec3(0.5, 0.5, 0.5),
    vec3(0.5, -0.5, 0.5),
    vec3(-0.5, -0.5, -0.5),
    vec3(-0.5, 0.5, -0.5),
    vec3(0.5, 0.5, -0.5),
    vec3(0.5, -0.5, -0.5),
  ],
  colors: [
    vec4(0.0, 0.0, 0.0, 1.0), // black
    vec4(1.0, 0.0, 0.0, 1.0), // red
    vec4(1.0, 1.0, 0.0, 1.0), // yellow
    vec4(0.0, 1.0, 0.0, 1.0), // green
    vec4(0.0, 0.0, 1.0, 1.0), // blue
    vec4(1.0, 0.0, 1.0, 1.0), // magenta
    vec4(1.0, 1.0, 1.0, 1.0), // white
    vec4(0.0, 1.0, 1.0, 1.0), // cyan
  ],
  indices: [
    1, 0, 3, 3, 2, 1, 2, 3, 7, 7, 6, 2, 3, 0, 4, 4, 7, 3, 6, 5, 1, 1, 2, 6, 4,
    5, 6, 6, 7, 4, 5, 4, 0, 0, 1, 5,
  ],
});

const obj1 = new Object3D({
  position: vec3(-0.7, 0, 0),
  mesh: cube,
});

const obj2 = new Object3D({
  position: vec3(0.7, 0, 0),
  mesh: cube,
});

class Engine {
  constructor() {
    this.background = [0.0, 0.0, 0.0, 1.0];

    this.shader = {};
    this.init();
  }

  init() {
    this.canvas = document.getElementById("canvas");

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    });

    const gl = this.canvas.getContext("webgl2");
    this.gl = gl;

    if (!gl) alert("Vixe! Não achei WebGL 2.0 aqui :-(");

    console.log("Canvas: ", this.canvas.width, this.canvas.height);

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(...this.background);
    gl.enable(gl.DEPTH_TEST);

    this._initShaders();
    this.render();
  }

  _initShaders() {
    const gl = this.gl;
    this.shader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
    gl.useProgram(this.shader.program);

    // buffer dos índices dos vértices
    this.shader.bufIndices = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.shader.bufIndices);

    // buffer dos vértices
    this.shader.bufVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.bufVertices);

    this.shader.aPosition = gl.getAttribLocation(
      this.shader.program,
      "aPosition"
    );
    gl.vertexAttribPointer(this.shader.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.shader.aPosition);

    // buffer de cores
    this.shader.bufColors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.bufColors);

    this.shader.aColor = gl.getAttribLocation(this.shader.program, "aColor");
    gl.vertexAttribPointer(this.shader.aColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.shader.aColor);

    // resolve os uniforms
    this.shader.uModelView = gl.getUniformLocation(
      this.shader.program,
      "uModelView"
    );
    this.shader.uPerspective = gl.getUniformLocation(
      this.shader.program,
      "uPerspective"
    );

    // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
    // que é feita apenas 1 vez
    gCtx.perspectiva = perspective(60, 1, 0.1, 5);
    gl.uniformMatrix4fv(
      this.shader.uPerspective,
      false,
      flatten(gCtx.perspectiva)
    );

    // calcula a matriz de transformação da camera, apenas 1 vez
    let eye = vec3(1.75, 1.75, 1.75);
    let at = vec3(0, 0, 0);
    let up = vec3(0, 1, 0);
    this.view = lookAt(eye, at, up);
  }

  bindVertices(vertices) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shader.bufVertices);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(vertices),
      this.gl.STATIC_DRAW
    );
  }

  bindColors(colors) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.shader.bufColors);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      flatten(colors),
      this.gl.STATIC_DRAW
    );
  }

  bindIndices(indices) {
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.shader.bufIndices);
    this.gl.bufferData(
      this.gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array(cube.indices),
      this.gl.STATIC_DRAW
    );
  }

  bindMesh(mesh) {
    this.bindVertices(mesh.vertices);
    this.bindColors(mesh.colors);
    this.bindIndices(mesh.indices);
  }

  renderMesh(mesh) {
    this.bindMesh(mesh);

    const model = cube.getModelMatrix();
    this.gl.uniformMatrix4fv(
      this.shader.uModelView,
      false,
      flatten(mult(this.view, model))
    );

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
    this.gl.uniformMatrix4fv(
      this.shader.uModelView,
      false,
      flatten(mult(this.view, model))
    );

    this.gl.drawElements(
      this.gl.TRIANGLES,
      obj.mesh.numV,
      this.gl.UNSIGNED_BYTE,
      0
    );
  }

  render() {
    const gl = this.gl;

    // Update animation
    gCtx.cycle += 5 * (Math.PI / 180);
    // const s = Math.sin(gCtx.cycle);
    // const c = Math.cos(gCtx.cycle);

    // const scale = s * 0.1 + 1;
    // cube.setScale([scale, scale, scale]);
    // cube.setTranslation({ x: s * 0.3, y: c * 0.3, z: c * 0.3 });

    // const rot = cube.getRotation();
    // rot[gCtx.axis] += 2.0;
    // cube.setRotation(rot);

    // Render
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.renderObject(obj1);
    this.renderObject(obj2);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

export default Engine;

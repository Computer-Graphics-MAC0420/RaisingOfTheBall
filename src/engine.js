import gVertexShaderSrc from "./shaders/vertex.glsl?raw";
import gFragmentShaderSrc from "./shaders/fragment.glsl?raw";

const EIXO_X = 0;
const EIXO_Y = 1;
const EIXO_Z = 2;

var gCtx = {
  axis: 0, // eixo rodando
  theta: [0, 0, 0], // angulos por eixo
  pause: false, //
  vista: mat4(), // view matrix, inicialmente identidade
  perspectiva: mat4(), // projection matrix
};

var gaPosicoes = [
  vec3(-0.5, -0.5, 0.5),
  vec3(-0.5, 0.5, 0.5),
  vec3(0.5, 0.5, 0.5),
  vec3(0.5, -0.5, 0.5),
  vec3(-0.5, -0.5, -0.5),
  vec3(-0.5, 0.5, -0.5),
  vec3(0.5, 0.5, -0.5),
  vec3(0.5, -0.5, -0.5),
];

var gaCores = [
  vec4(0.0, 0.0, 0.0, 1.0), // black
  vec4(1.0, 0.0, 0.0, 1.0), // red
  vec4(1.0, 1.0, 0.0, 1.0), // yellow
  vec4(0.0, 1.0, 0.0, 1.0), // green
  vec4(0.0, 0.0, 1.0, 1.0), // blue
  vec4(1.0, 0.0, 1.0, 1.0), // magenta
  vec4(1.0, 1.0, 1.0, 1.0), // white
  vec4(0.0, 1.0, 1.0, 1.0), // cyan
];

var gaIndices = [
  1, 0, 3, 3, 2, 1, 2, 3, 7, 7, 6, 2, 3, 0, 4, 4, 7, 3, 6, 5, 1, 1, 2, 6, 4, 5,
  6, 6, 7, 4, 5, 4, 0, 0, 1, 5,
];

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
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint8Array(gaIndices),
      gl.STATIC_DRAW
    );

    // buffer dos vértices
    this.shader.bufVertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.bufVertices);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gaPosicoes), gl.STATIC_DRAW);

    this.shader.aPosition = gl.getAttribLocation(
      this.shader.program,
      "aPosition"
    );
    gl.vertexAttribPointer(this.shader.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.shader.aPosition);

    // buffer de cores
    this.shader.bufColors = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.shader.bufColors);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(gaCores), gl.STATIC_DRAW);

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

  render() {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // modelo muda a cada frame da animação
    gCtx.theta[gCtx.axis] += 2.0;

    let rx = rotateX(gCtx.theta[EIXO_X]);
    let ry = rotateY(gCtx.theta[EIXO_Y]);
    let rz = rotateZ(gCtx.theta[EIXO_Z]);
    let model = mult(rz, mult(ry, rx));

    gl.uniformMatrix4fv(
      this.shader.uModelView,
      false,
      flatten(mult(this.view, model))
    );
    gl.drawElements(gl.TRIANGLES, gaIndices.length, gl.UNSIGNED_BYTE, 0);

    window.requestAnimationFrame(this.render.bind(this));
  }
}

export default Engine;

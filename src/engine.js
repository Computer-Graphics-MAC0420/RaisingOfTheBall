import vertexShaderSrc from "./shaders/vertex.glsl?raw";
import fragmentShaderSrc from "./shaders/fragment.glsl?raw";

export class Engine {
  constructor(canvasID = "canvas") {
    this.canvas = document.getElementById(canvasID);

    if (!this.canvas) {
      throw new Error("Canvas not found");
    }

    this.gl = this.canvas.getContext("webgl2");

    if (!this.gl) {
      console.error("WebGL not supported, falling back on experimental-webgl");
      throw new Error("WebGL not supported");
    }

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    });

    this.shader = {};
  }

  async init() {
    this._initShaders();
  }

  _initShaders() {
    this.shader.program = makeProgram(
      this.gl,
      vertexShaderSrc,
      fragmentShaderSrc
    );
    this.gl.useProgram(this.shader.program);

    this.shader.bufIndexes = this.gl.createBuffer();
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIndices);
    // gl.bufferData(
    //   gl.ELEMENT_ARRAY_BUFFER,
    //   new Uint8Array(gaIndices),
    //   gl.STATIC_DRAW
    // );

    this.shader.bufVertices = this.gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
    // gl.bufferData(gl.ARRAY_BUFFER, flatten(gaPosicoes), gl.STATIC_DRAW);

    this.shader.aPosition = this.gl.getAttribLocation(
      this.shader.program,
      "aPosition"
    );
    // gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    // gl.enableVertexAttribArray(aPosition);

    // buffer de cores
    this.shader.bufColors = this.gl.createBuffer();
    // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, bufCores);
    // this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(gaCores), this.gl.STATIC_DRAW);

    this.shader.aColor = this.gl.getAttribLocation(
      this.shader.program,
      "aColor"
    );
    // this.gl.vertexAttribPointer(aColor, 4, this.gl.FLOAT, false, 0, 0);
    // this.gl.enableVertexAttribArray(aColor);

    // resolve os uniforms
    this.shader.uModelView = this.gl.getUniformLocation(
      this.shader.program,
      "uModelView"
    );
    this.shader.uPerspective = this.gl.getUniformLocation(
      this.shader.program,
      "uPerspective"
    );

    // calcula a matriz de transformação perspectiva (fovy, aspect, near, far)
    // que é feita apenas 1 vez
    this.perspective = perspective(60, 1, 0.1, 5);
    this.gl.uniformMatrix4fv(
      this.shader.uPerspective,
      false,
      flatten(this.perspective)
    );

    // calcula a matriz de transformação da camera, apenas 1 vez
    let eye = vec3(1.75, 1.75, 1.75);
    let at = vec3(0, 0, 0);
    let up = vec3(0, 1, 0);
    this.view = lookAt(eye, at, up);

    console.debug("Shader program created");
  }
}

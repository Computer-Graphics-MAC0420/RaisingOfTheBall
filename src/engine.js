import vertexShaderSrc from "./shaders/vertex.glsl?raw";
import fragmentShaderSrc from "./shaders/fragment.glsl?raw";

function makeProgram(gl, vertexShaderSrc, fragmentShaderSrc) {
  var vertexShader = compile(gl, gl.VERTEX_SHADER, vertexShaderSrc);
  var fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc);
  var program = link(gl, vertexShader, fragmentShader);
  if (!program) {
    alert("ERRO: na criação do programa.");
    throw new Error("Error creating program");
    return null;
  }
  return program;
}

export class Engine {
  constructor(canvasID = "canvas") {
    this.canvas = document.getElementById(canvasID);

    if (!this.canvas) {
      throw new Error("Canvas not found");
    }

    this.gl = this.canvas.getContext("webgl");

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
  }

  async init() {}

  _initShaders() {}
}

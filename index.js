// Get the canvas element
"use strict";

var gCanvas;
var gl;
var gScene;
var gVertexShaderSrc;
var gFragmentShaderSrc;
var gShader;

// Make the canvas fill the entire screen

// Get the context (2d or webgl depending on your needs)
const ctx = canvas.getContext("2d");

// Resize canvas when window is resized
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  // Redraw your content here after resize
});

// Your drawing code here
window.onload = main;

async function main() {
  loadComponents();

  gCanvas.width = window.innerWidth;
  gCanvas.height = window.innerHeight;

  await loadShaders();
  initShaders();

  initScene();
}

function loadComponents() {
  gCanvas = document.getElementById("canvas");
  gl = gCanvas.getContext("webgl");
  if (!gl) {
    console.error("WebGL not supported, falling back on experimental-webgl");
    throw new Error("WebGL not supported");
  }
}

const loadFile = (filename) =>
  fetch(filename).then((response) => response.text());

async function loadShaders() {
  const vertexShader = await loadFile("vertex.glsl");
  const fragmentShader = await loadFile("fragment.glsl");

  gVertexShaderSrc = vertexShader;
  gFragmentShaderSrc = fragmentShader;
  gShader = {};
}

function initShaders() {
  gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
  gl.useProgram(gShader.program);

  // buffer dos índices dos vértices
  gShader.bIndex = gl.createBuffer();
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIndices);
  // gl.bufferData(
  //   gl.ELEMENT_ARRAY_BUFFER,
  //   new Uint8Array(gaIndices),
  //   gl.STATIC_DRAW
  // );

  // buffer dos vértices
  gShader.bVertices = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, bufVertices);
  // gl.bufferData(gl.ARRAY_BUFFER, flatten(gaPosicoes), gl.STATIC_DRAW);

  gShader.aPosition = gl.getAttribLocation(gShader.program, "aPosition");
  // gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(aPosition);

  // buffer de cores
  gShader.bColors = gl.createBuffer();
  // gl.bindBuffer(gl.ARRAY_BUFFER, bufCores);
  // gl.bufferData(gl.ARRAY_BUFFER, flatten(gaCores), gl.STATIC_DRAW);

  gShader.aColor = gl.getAttribLocation(gShader.program, "aColor");
  gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aColor);

  // resolve os uniforms
  gShader.uModelView = gl.getUniformLocation(gShader.program, "uModelView");
  gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");

  // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)
  // que é feita apenas 1 vez
  gCtx.perspectiva = perspective(60, 1, 0.1, 5);
  gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspectiva));

  // calcula a matriz de transformação da camera, apenas 1 vez
  let eye = vec3(1.75, 1.75, 1.75);
  let at = vec3(0, 0, 0);
  let up = vec3(0, 1, 0);
  gCtx.vista = lookAt(eye, at, up);
}

function initScene() {
  gScene = new Scene();
}

class Scene {
  constructor() {
    this.objects = [];
  }

  addObject(object) {
    this.objects.push(object);
  }

  render() {
    for (const object of this.objects) {
      object.render();
    }
  }
}

class Object3D {
  constructor(pos) {
    this.position = pos;
  }

  render() {
    // Implement rendering logic here
  }

  update(dt) {
    // Implement update logic here
  }
}

class Cube extends Object3D {
  constructor(pos) {
    super(pos);
    this.size = 1;
  }

  render() {
    const vertices = [
      vec3(0, 0, 0),
      vec3(1, 0, 0),
      vec3(1, 1, 0),
      vec3(0, 1, 0),
      vec3(0, 0, 1),
      vec3(1, 0, 1),
      vec3(1, 1, 1),
      vec3(0, 1, 1),
    ];

    const indexes = [
      0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 2, 3, 7, 2, 7, 6, 0,
      3, 7, 0, 7, 4, 1, 2, 6, 1, 6, 5,
    ];

    const colors = [
      vec4(1, 0, 0, 1),
      vec4(0, 1, 0, 1),
      vec4(0, 0, 1, 1),
      vec4(1, 1, 0, 1),
      vec4(1, 0, 1, 1),
      vec4(0, 1, 1, 1),
      vec4(1, 1, 1, 1),
      vec4(0.5, 0.5, 0.5, 1),
    ];

    return {
      vertices,
      indexes,
      colors,
    };
  }

  update(dt) {
    // Implement cube update logic here
  }
}

// Vertex shader para renderização do shadow map
precision mediump float;

attribute vec3 aPosition;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uLightMatrix; // matriz de transformação da perspectiva da luz

void main() {
  // Transformação da posição do vértice para o espaço da luz
  gl_Position = uPerspective * uView * uModel * vec4(aPosition, 1.0);
}

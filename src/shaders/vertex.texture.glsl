#version 300 es

// Atributos de vértice
in vec3 aPosition;
in vec3 aNormal;
in vec4 aColor;
in vec2 aTexCoord;

// Matrizes recebidas como uniform
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;

// Variáveis para o fragment shader
out vec2 vTexCoord;

void main() {
  // Calcula a posição final do vértice multiplicando as matrizes
  gl_Position = uPerspective * uView * uModel * vec4(aPosition, 1.0f);

  // Passa as coordenadas de textura para o fragment shader
  vTexCoord = aTexCoord;
}

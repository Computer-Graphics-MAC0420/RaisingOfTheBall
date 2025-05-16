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
uniform vec3 uLightPos;

// Variáveis para o fragment shader
out vec2 vTexCoord;
out vec3 vNormal;
out vec3 vLightDir;
out vec3 vViewDir;

void main() {
  // Posição do vértice no espaço do modelo
  vec4 worldPos = uModel * vec4(aPosition, 1.0f);

  // Calcula a posição final do vértice multiplicando as matrizes
  gl_Position = uPerspective * uView * worldPos;

  // Passa as coordenadas de textura para o fragment shader
  vTexCoord = aTexCoord;

  // Transforma a normal para o espaço do mundo
  vNormal = mat3(uModel) * aNormal;

  // Direção da luz (do vértice para a luz)
  vLightDir = normalize(uLightPos - worldPos.xyz);

  // Direção da visão (do vértice para a câmera)
  vViewDir = normalize(-worldPos.xyz);
}

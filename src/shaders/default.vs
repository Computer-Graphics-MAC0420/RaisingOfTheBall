#version 300 es

// aPosition é um buffer de entrada
in vec3 aPosition;
in vec3 aNormal; // buffer com a normal de cada vértice
in vec4 aColor;  // buffer com a cor de cada vértice

uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uPerspective;
uniform mat4 uLightMatrix; // matriz da transformação da luz (projeção * visão)

uniform vec3 uLightPos; // posição da luz

out vec4 vColor; // varying -> passado ao fShader
out vec3 vNormal; // normal interpolada
out vec3 vvNormal; // normal não interpolada
out vec3 vLight;
out vec3 vView;
out vec4 vPositionLightSpace; // posição do vértice no espaço da luz, para shadow mapping

void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0f); // posição do vértice no espaço do modelo
    vec4 screenPos = uView * worldPos; // posição do vértice no espaço da tela
    vec4 clipPos = uPerspective * screenPos; // posição do vértice no espaço de recorte
    gl_Position = clipPos;

    // Calcula a posição do vértice no espaço da luz para o shadow mapping
    vPositionLightSpace = uLightMatrix * worldPos;

    mat4 mModelView = uView * uModel; // matriz de transformação
    mat4 uInverseTranspose = transpose(inverse(mModelView));

    vvNormal = aNormal; // normal não interpolada
    vColor = aColor; // Solid color

    vNormal = normalize(mat3(uInverseTranspose) * aNormal);
    vLight = normalize((uView * vec4(uLightPos, 1) - screenPos).xyz);
    vView = normalize(-screenPos.xyz); // vetor de visão
}
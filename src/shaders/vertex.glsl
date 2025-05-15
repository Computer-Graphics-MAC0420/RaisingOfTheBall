#version 300 es

// aPosition é um buffer de entrada
in vec3 aPosition;
in vec3 aNormal; // buffer com a normal de cada vértice
in vec4 aColor;  // buffer com a cor de cada vértice

uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uPerspective;

uniform vec3 uLightPos; // posição da luz

out vec4 vColor; // varying -> passado ao fShader
out vec3 vNormal; // normal interpolada
out vec3 vvNormal; // normal não interpolada
out vec3 vLight;
out vec3 vView;

void main() {
    mat4 modelView = uView * uModel; // matriz de transformação
    vec4 pos = modelView * vec4(aPosition, 1);

    mat4 uInverseTranspose = transpose(inverse(modelView));

    gl_Position = uPerspective * pos;
    vvNormal = aNormal; // normal não interpolada

    vColor = aColor; 
    vNormal = mat3(uInverseTranspose) * aNormal;
    vLight = (uView * vec4(uLightPos, 1) - pos).xyz;
    vView = -pos.xyz; // vetor de visão
}
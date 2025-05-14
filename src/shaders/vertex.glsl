#version 300 es

// aPosition é um buffer de entrada
in vec3 aPosition;
in vec3 aNormal; // buffer com a normal de cada vértice

uniform mat4 uView;
uniform mat4 uModel;
uniform mat4 uPerspective;

in vec4 aColor;  // buffer com a cor de cada vértice
out vec4 vColor; // varying -> passado ao fShader

void main() {
    mat4 modelView = uView * uModel; // matriz de transformação

    gl_Position = uPerspective * modelView * vec4(aPosition, 1);
    vColor = aColor; 
}
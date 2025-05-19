#version 300 es

precision highp float;

out vec4 outColor;

in vec3 vvNormal; // normal não interpolada
in vec3 vNormal; // normal interpolada

bool mode = false; // true -> normal interpolada, false -> normal não interpolada

void main() {
  vec3 norm;
  if(mode) {
    norm = vNormal;
  } else {
    norm = vvNormal;
  }

  outColor = vec4(abs(norm.x), abs(norm.y), abs(norm.z), 1); // cor da normal
}
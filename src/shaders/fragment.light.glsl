#version 300 es

precision highp float;

in vec3 vView;
out vec4 outColor;

in vec3 vNormal; // normal interpolada
in vec3 vLight;

void main() {
  vec3 normalV = normalize(vNormal);
  vec3 lightV = normalize(vLight);
  vec3 viewV = normalize(vView);

  // Cor do material (branco)
  vec4 materialColor = vec4(1.0f, 1.0f, 1.0f, 1.0f);

  // Componente ambiente (luz mínima)
  vec4 ambientColor = vec4(0.2f, 0.2f, 0.2f, 1.0f);

  // Cálculo da difusão
  float dotP = dot(normalV, lightV);
  float kd = max(0.0f, dotP); // Isso já garante que superfícies de costas para a luz não recebem luz difusa
  vec4 diffuse = kd * materialColor;

  // Cor final: ambiente + difusão
  outColor = ambientColor + diffuse;
}
#version 300 es

precision highp float;

in vec3 vView;
out vec4 outColor;

in vec3 vNormal; // normal interpolada
in vec3 vLight;

// Uniforms para propriedades da luz
uniform vec4 uLightColor; // Cor da luz (padrão: branco)

float uAlfaEsp = 20.0f; // Aumentando o expoente especular (reduz a área do brilho)
vec4 materialColor = 0.3f * vec4(1.0f, 0.2f, 0.0f, 1.0f); // Reduzindo a intensidade da cor do material
vec4 uSpecularColor = vec4(0.5f, 0.5f, 0.5f, 1.0f); // Reduzindo a intensidade do brilho especular
vec4 ambientColor = vec4(0.1f, 0.1f, 0.1f, 1.0f); // Reduzindo a luz ambiente

void main() {
  vec3 normalV = normalize(vNormal);
  vec3 lightV = normalize(vLight);
  vec3 viewV = normalize(vView);
  vec3 halfV = normalize(lightV + viewV);

  // Cálculo da difusão
  float kd = max(0.0f, dot(normalV, lightV)); // Isso já garante que superfícies de costas para a luz não recebem luz difusa
  vec4 diffuse = kd * materialColor * uLightColor;

  // specular
  float ks = pow(max(0.0f, dot(normalV, halfV)), uAlfaEsp);

  vec4 specular = vec4(0, 0, 0, 1); // parte não iluminada
  if(kd > 0.0f) {  // parte iluminada
    specular = ks * uLightColor;
  }

  // Cor final: ambiente + difusão
  outColor = ambientColor + specular + diffuse;
}
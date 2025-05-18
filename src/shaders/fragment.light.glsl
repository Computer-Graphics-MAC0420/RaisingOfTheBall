#version 300 es

precision highp float;

in vec3 vView;
out vec4 outColor;

in vec3 vNormal; // normal interpolada
in vec3 vLight;

// Uniforms para propriedades da luz
uniform vec4 uLightColor; // Cor da luz (padrão: branco)

float uAlfaEsp = 500.0f; // Aumentando o expoente especular (reduz a área do brilho)
float kAmbient = 0.2f;
float kDiffuse = 0.5f;
float kSpecular = 0.5f;

// Colors
vec4 materialColor = vec4(1.0f); // Reduzindo a intensidade da cor do material

void main() {
  vec3 lightColor = uLightColor.rgb;
  vec3 normalV = normalize(vNormal);
  vec3 lightV = normalize(vLight);
  vec3 viewV = normalize(vView);
  vec3 halfV = normalize(lightV + viewV);

  // Cálculo da luz ambiente
  vec3 ambient = materialColor.xyz * lightColor;

  // Cálculo da difusão
  float diffuseStrength = max(0.0f, dot(normalV, lightV));
  vec3 diffuse = diffuseStrength * materialColor.xyz * lightColor;

  // // Cálculo do brilho especular
  float specularStrength = pow(max(0.0f, dot(normalV, halfV)), uAlfaEsp);
  vec3 specular = vec3(0, 0, 0); // parte não iluminada
  if(specularStrength > 0.0f) {  // parte iluminada
    specular = specularStrength * lightColor;
  }

  // Cor final: ambiente + difusão
  vec3 result = ambient * kAmbient + diffuse * kDiffuse + specular * kSpecular;
  outColor = vec4(result, 1.0f);
}
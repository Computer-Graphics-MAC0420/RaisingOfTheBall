#version 300 es
precision mediump float;

in vec2 vTexCoord;
in vec3 vNormal;
in vec3 vLightDir;
in vec3 vViewDir;

uniform sampler2D uTexture;
uniform vec4 uLightColor;

out vec4 fragColor;

void main() {
  // Amostra a textura nas coordenadas recebidas
  vec4 texColor = texture(uTexture, vTexCoord);

  // Parâmetros de iluminação
  vec3 lightColor = uLightColor.rgb;
  float ambientStrength = 0.2f;
  float specularStrength = 0.5f;
  float shininess = 32.0f;

  // Normaliza os vetores
  vec3 normal = normalize(vNormal);
  vec3 lightDir = normalize(vLightDir);
  vec3 viewDir = normalize(vViewDir);

  // Componente de luz ambiente
  vec3 ambient = ambientStrength * lightColor;

  // Componente de luz difusa
  float diff = max(dot(normal, lightDir), 0.0f);
  vec3 diffuse = diff * lightColor;

  // Componente de luz especular
  vec3 halfwayDir = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfwayDir), 0.0f), shininess);
  vec3 specular = specularStrength * spec * lightColor;

  // Combinação final
  vec3 result = (ambient + diffuse + specular) * texColor.rgb;

  fragColor = vec4(result, texColor.a);
}

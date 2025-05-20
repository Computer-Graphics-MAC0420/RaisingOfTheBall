#version 300 es

precision highp float;

in vec3 vView;
in vec3 vNormal;
in vec3 vLight;
in vec4 vPositionLightSpace;

out vec4 outColor;

uniform vec4 uLightColor;

uniform float uShininess;
uniform float uAmbientFactor;
uniform float uDiffuseFactor;
uniform float uSpecularFactor;

in vec2 vTexCoord;
uniform sampler2D uTexture;

uniform sampler2D uShadowMap;

float calculateShadow(vec4 positionLightSpace) {
  vec3 projCoords = positionLightSpace.xyz / positionLightSpace.w;

  // Converte de [-1,1] para [0,1]
  projCoords = projCoords * 0.5f + 0.5f;

  // Obtém a profundidade atual do fragmento no espaço da luz
  float currentDepth = projCoords.z;

  // Evita sombras em fragmentos fora do frustum da luz
  if(currentDepth > 1.0f) {
    return 1.0f;
  }

  // Aplica bias para evitar shadow acne (problemas de precisão)
  float bias = 0.005f;

  // Obtém a profundidade mais próxima armazenada no shadow map
  float closestDepth = texture(uShadowMap, projCoords.xy).r;

  // O fragmento está na sombra se a sua profundidade for maior que a do shadow map
  float shadow = currentDepth - bias > closestDepth ? 0.0f : 1.0f;

  return shadow;
}

void main() {
  vec4 texColor = texture(uTexture, vTexCoord);

  // Extrair componente RGB da cor da luz
  vec3 lightColor = uLightColor.rgb;

  // Normalizar os vetores de entrada
  vec3 normalV = normalize(vNormal);
  vec3 lightV = normalize(vLight);
  vec3 viewV = normalize(vView);

  // Calcular vetor meio caminho entre luz e visão (para reflexão especular)
  vec3 halfV = normalize(lightV + viewV);

  // Ambient light
  vec3 ambient = texColor.rgb * lightColor;

  // Diffuse light
  float diffuseStrength = max(0.0f, dot(normalV, lightV));
  vec3 diffuse = diffuseStrength * texColor.rgb * lightColor;

  // Specular light
  float specularStrength = pow(max(0.0f, dot(normalV, halfV)), uShininess);
  vec3 specular = vec3(0.0f, 0.0f, 0.0f);

  if(diffuseStrength > 0.0f) {
    specular = specularStrength * lightColor;
  }

  // Shadow
  float shadow = calculateShadow(vPositionLightSpace);

  // Final color
  vec3 result = ambient * uAmbientFactor +
    shadow * (diffuse * uDiffuseFactor + specular * uSpecularFactor);

  outColor = vec4(result, texColor.a);
}
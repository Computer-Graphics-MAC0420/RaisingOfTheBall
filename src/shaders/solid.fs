#version 300 es

precision highp float;

// Entradas do vertex shader
in vec3 vView;   // Vetor de visão (do vértice para a câmera)
in vec3 vNormal; // Normal interpolada no espaço de visão
in vec3 vLight;  // Vetor da luz (do vértice para a fonte de luz)
in vec4 vPositionLightSpace; // Posição do fragmento no espaço da luz

// Saída para o framebuffer
out vec4 outColor;

// Uniforms para iluminação e material
uniform vec4 uLightColor;   // Cor da luz
uniform vec4 uSolidColor;   // Cor do material

// Uniforms para parâmetros de iluminação
uniform float uShininess;     // Expoente especular (controla tamanho do brilho)
uniform float uAmbientFactor; // Fator de luz ambiente
uniform float uDiffuseFactor; // Fator de reflexão difusa
uniform float uSpecularFactor; // Fator de reflexão especular

// Uniforms para shadow mapping
uniform sampler2D uShadowMap;  // Textura do shadow map

// Função para calcular a visibilidade de sombra (0.0 = sombra, 1.0 = luz)
float calculateShadow(vec4 positionLightSpace) {
  // Obtém as coordenadas normalizadas da posição no espaço da luz
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

  if(projCoords.x > 1.0f || projCoords.x < 0.0f || projCoords.y > 1.0f || projCoords.y < 0.0f) {
    return 1.0f;
  }

  // O fragmento está na sombra se a sua profundidade for maior que a do shadow map
  float shadow = currentDepth - bias > closestDepth ? 0.0f : 1.0f;

  return shadow;
}

void main() {
  // Extrair componente RGB da cor da luz
  vec3 lightColor = uLightColor.rgb;

  // Normalizar os vetores de entrada
  vec3 normalV = normalize(vNormal);
  vec3 lightV = normalize(vLight);
  vec3 viewV = normalize(vView);

  // Calcular vetor meio caminho entre luz e visão (para reflexão especular)
  vec3 halfV = normalize(lightV + viewV);

  // Componente de luz ambiente
  // Multiplica a cor do material pela cor da luz
  vec3 ambient = uSolidColor.rgb * lightColor;

  // Componente de luz difusa
  // Calcula o fator de difusão com produto escalar entre normal e luz
  float diffuseStrength = max(0.0f, dot(normalV, lightV));
  vec3 diffuse = diffuseStrength * uSolidColor.rgb * lightColor;

  // Componente de luz especular
  // Usa o modelo Blinn-Phong com o vetor meio caminho
  float specularStrength = pow(max(0.0f, dot(normalV, halfV)), uShininess);
  vec3 specular = vec3(0.0f, 0.0f, 0.0f);

  // Aplica reflexão especular apenas em superfícies viradas para a luz
  if(diffuseStrength > 0.0f) {
    specular = specularStrength * lightColor;
  }

  // Calcula o fator de sombra (0.0 = totalmente na sombra, 1.0 = totalmente iluminado)
  float shadow = calculateShadow(vPositionLightSpace);

  // Cor final: combina as três componentes de iluminação
  // aplicando os fatores de intensidade para cada uma e o fator de sombra
  // Nota: A luz ambiente não é afetada pelas sombras
  vec3 result = ambient * uAmbientFactor +
    shadow * (diffuse * uDiffuseFactor + specular * uSpecularFactor);

  outColor = vec4(result, uSolidColor.a);
}
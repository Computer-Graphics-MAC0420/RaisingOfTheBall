#version 300 es

precision highp float;

// Entradas do vertex shader
in vec3 vView;   // Vetor de visão (do vértice para a câmera)
in vec3 vNormal; // Noramal interpolad no espaço de visão
in vec3 vLight;  // Vetor da luz (do vértice para a fonte de luz)

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

  // Cor final: combina as três componentes de iluminação
  // aplicando os fatores de intensidade para cada uma
  vec3 result = ambient * uAmbientFactor +
    diffuse * uDiffuseFactor +
    specular * uSpecularFactor;

  outColor = vec4(result, uSolidColor.a);
}
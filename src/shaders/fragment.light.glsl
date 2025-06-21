#version 300 es

precision highp float;

in vec3 vView;
in vec3 vNormal; // normal interpolated
in vec3 vLight;
in vec4 vColor;  // vertex color from mesh

out vec4 outColor;

float uAlfaEsp = 20.0f; // Specular exponent
vec4 uSpecularColor = vec4(0.5f, 0.5f, 0.5f, 1.0f); // Specular highlight color
vec4 ambientColor = vec4(0.1f, 0.1f, 0.1f, 1.0f); // Ambient light

void main() {
  vec3 normalV = normalize(vNormal);
  vec3 lightV = normalize(vLight);
  vec3 viewV = normalize(vView);
  vec3 halfV = normalize(lightV + viewV);

  // Use vertex color as material color
  vec4 materialColor = vColor;

  // Diffuse lighting calculation
  float kd = max(0.0f, dot(normalV, lightV));
  vec4 diffuse = kd * materialColor;

  // Specular lighting calculation
  float ks = pow(max(0.0f, dot(normalV, halfV)), uAlfaEsp);
  
  vec4 specular = vec4(0, 0, 0, 1); // unlit part
  if(kd > 0.0f) {  // lit part
    specular = ks * uSpecularColor;
  }

  // Final color: ambient + diffuse + specular
  outColor = ambientColor * materialColor + diffuse + specular;
}
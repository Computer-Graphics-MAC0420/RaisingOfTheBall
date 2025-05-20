import FixedColor from "./materials/fixed-color.js";
import Sphere from "./meshes/sphere.js";
import Object3D from "./object3d.js";

class Light extends Object3D {
  #color = vec4(0, 0, 0, 1);

  // Parâmetros da perspectiva da luz para shadow mapping
  #shadowFov = 60;
  #shadowNear = 0.1;
  #shadowFar = 100.0;
  #shadowAspect = 1.0; // geralmente 1.0 para shadow map quadrado

  constructor({
    color = vec4(1, 1, 1, 1),
    showGizmo = false,
    shadowFov = 60,
    shadowNear = 0.1,
    shadowFar = 100.0,
  } = {}) {
    const options = {};
    if (showGizmo) {
      options.mesh = new Sphere({
        density: 0,
        size: 0.1,
      });
      options.material = new FixedColor({
        color,
      });
    }

    super(options);
    this.#color = color;
    this.#shadowFov = shadowFov;
    this.#shadowNear = shadowNear;
    this.#shadowFar = shadowFar;
  }

  get color() {
    return this.#color;
  }

  set color(value) {
    this.#color = value;
  }

  /**
   * Retorna a matriz de visualização da perspectiva da luz
   * @returns {Array} - Matriz 4x4 da perspectiva da luz
   */
  getViewMatrix() {
    // Posição da luz como a origem da visualização
    const eye = this.position;

    // Direcionando para o centro da cena (origem)
    // Isso faz com que a luz sempre aponte para o centro da cena onde estão os objetos
    const at = vec3(0, 0, 0);

    // Vetor "para cima" na cena (eixo Y é para cima em coordenadas do mundo)
    const up = vec3(0, 1, 0);

    // Criar a matriz de visualização da luz
    return lookAt(eye, at, up);
  }

  /**
   * Retorna a matriz de projeção para o shadow mapping
   * @returns {Array} - Matriz 4x4 de projeção para o shadow mapping
   */
  getProjectionMatrix() {
    // Usar projeção perspectiva para o shadow mapping
    // Isso pode ser ajustado para ortogonal se necessário para sombras específicas
    return perspective(
      this.#shadowFov,
      this.#shadowAspect,
      this.#shadowNear,
      this.#shadowFar
    );
  }
}

export default Light;

import FixedColor from "./materials/fixed-color.js";
import Sphere from "./meshes/sphere.js";
import Object3D from "./object3d.js";

class Light extends Object3D {
  #color = vec4(0, 0, 0, 1);

  // Parâmetros da perspectiva da luz para shadow mapping
  #shadowFov = 90; // FOV mais amplo para capturar mais área da cena
  #shadowNear = 1.0;
  #shadowFar = 1000.0;
  #shadowAspect = 1.0; // geralmente 1.0 para shadow map quadrado

  // Parâmetros para projeção ortográfica (alternativa)
  #shadowLeft = -800;
  #shadowRight = 800;
  #shadowBottom = -800;
  #shadowTop = 800;

  constructor({
    color = vec4(1, 1, 1, 1),
    showGizmo = false,
    // shadowFov = 120,
    // shadowNear = 0.5,
    // shadowFar = 100.0,
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
    // this.#shadowFov = shadowFov;
    // this.#shadowNear = shadowNear;
    // this.#shadowFar = shadowFar;
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

    // Para projeção ortográfica, é melhor a luz apontar diretamente para baixo
    // Calculamos um ponto diretamente abaixo da luz
    const at = vec3(eye[0], eye[1], eye[2] - 100); // 100 unidades abaixo da luz

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
    // Testar com projeção ortográfica para shadow mapping
    // Ortográfica às vezes funciona melhor para sombras direcionais
    return ortho(
      this.#shadowLeft,
      this.#shadowRight,
      this.#shadowBottom,
      this.#shadowTop,
      this.#shadowNear,
      this.#shadowFar
    );

    // Versão em perspectiva (comentada temporariamente)
    // return perspective(
    //   this.#shadowFov,
    //   this.#shadowAspect,
    //   this.#shadowNear,
    //   this.#shadowFar
    // );
  }
}

export default Light;

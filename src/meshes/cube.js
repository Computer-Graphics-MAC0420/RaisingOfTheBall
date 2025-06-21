import Mesh from "../mesh.js";
import { square, generateFlatNormals, expandVertices } from "../utils.js";

class Cube extends Mesh {
  constructor({ size = 1, color = vec4(0.8, 0.8, 0.8, 1) }) {
    const vertices = [
      vec3(-0.5, -0.5, 0.5), // 0: frente-baixo-esquerda
      vec3(-0.5, 0.5, 0.5), // 1: frente-cima-esquerda
      vec3(0.5, 0.5, 0.5), // 2: frente-cima-direita
      vec3(0.5, -0.5, 0.5), // 3: frente-baixo-direita
      vec3(-0.5, -0.5, -0.5), // 4: atrás-baixo-esquerda
      vec3(-0.5, 0.5, -0.5), // 5: atrás-cima-esquerda
      vec3(0.5, 0.5, -0.5), // 6: atrás-cima-direita
      vec3(0.5, -0.5, -0.5), // 7: atrás-baixo-direita
    ].map((v) => scale(size, v));

    const colors = Array(vertices.length)
      .fill(0)
      .map(() => vec4(color));

    const indices = [
      square(3, 2, 1, 0),
      square(4, 5, 6, 7),
      square(0, 4, 7, 3),
      square(1, 2, 6, 5),
      square(2, 3, 7, 6),
      square(0, 1, 5, 4),
    ].flat();

    const normals = generateFlatNormals(vertices, indices);
    const expandedVertices = expandVertices(vertices, indices);

    const texCoords = [
      square(vec2(0, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)),
      square(vec2(0, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)),
      square(vec2(0, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)),
      square(vec2(0, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)),
      square(vec2(0, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)),
      square(vec2(0, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)),
      square(vec2(0, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)),
      square(vec2(0, 1), vec2(1, 1), vec2(1, 0), vec2(0, 0)),
    ].flat();

    super({
      vertices: expandedVertices,
      colors,
      normals,
      texCoords,
      useIndices: false,
    });
  }
}

export default Cube;

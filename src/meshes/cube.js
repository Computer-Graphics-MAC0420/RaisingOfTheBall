import Mesh from "../mesh";
import { square, generateFlatNormals, expandVertices } from "../utils";

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

    // Coordenadas de textura para cada vértice do cubo
    // Cada face do cubo tem coordenadas de 0,0 a 1,1
    const texCoords = [
      // Face frontal (0,1,2,3)
      vec2(0, 0),
      vec2(0, 1),
      vec2(1, 1),
      vec2(1, 0),
      // Face traseira (4,5,6,7)
      vec2(1, 0),
      vec2(1, 1),
      vec2(0, 1),
      vec2(0, 0),
      // Face inferior (0,4,7,3)
      vec2(0, 1),
      vec2(0, 0),
      vec2(1, 0),
      vec2(1, 1),
      // Face superior (1,2,6,5)
      vec2(0, 0),
      vec2(1, 0),
      vec2(1, 1),
      vec2(0, 1),
      // Face direita (2,3,7,6)
      vec2(0, 1),
      vec2(0, 0),
      vec2(1, 0),
      vec2(1, 1),
      // Face esquerda (0,1,5,4)
      vec2(1, 0),
      vec2(1, 1),
      vec2(0, 1),
      vec2(0, 0),
    ];

    // Expandir as coordenadas de textura de acordo com os índices
    const expandedTexCoords = [];
    for (let i = 0; i < indices.length; i++) {
      // Cada quadrado (face) usa 4 vértices, 6 índices
      // Mapear o índice do vértice para a coordenada de textura correta
      const faceIndex = Math.floor(i / 6);
      const vertexInFace = i % 6;
      let texCoordIndex;

      if (vertexInFace === 0 || vertexInFace === 3) texCoordIndex = 0;
      else if (vertexInFace === 1) texCoordIndex = 1;
      else if (vertexInFace === 2 || vertexInFace === 5) texCoordIndex = 2;
      else if (vertexInFace === 4) texCoordIndex = 3;

      expandedTexCoords.push(texCoords[faceIndex * 4 + texCoordIndex]);
    }

    super({
      vertices: expandedVertices,
      colors,
      normals,
      texCoords: expandedTexCoords,
      useIndices: false,
    });
  }
}

export default Cube;

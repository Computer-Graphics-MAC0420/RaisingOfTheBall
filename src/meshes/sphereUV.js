import Mesh from "../mesh";
import {
  expandVertices,
  generateFlatNormals,
  generateSmoothNormals,
} from "../utils";

/**
 * Gera uma esfera UV com coordenadas de textura otimizadas.
 * Uma esfera UV é formada através da parametrização direta da equação esférica,
 * garantindo um mapeamento adequado das coordenadas de textura.
 */
function crieEsferaUV(slices = 32, stacks = 16) {
  // Vértices e índices para a malha
  const vertices = [];
  const texCoords = [];
  const indices = [];

  // Criação dos vértices e coordenadas de textura
  for (let stack = 0; stack <= stacks; stack++) {
    // phi vai de 0 a PI (do norte ao sul)
    const phi = (stack * Math.PI) / stacks;
    const sinPhi = Math.sin(phi);
    const cosPhi = Math.cos(phi);

    for (let slice = 0; slice <= slices; slice++) {
      // theta vai de 0 a 2*PI (ao redor da esfera)
      const theta = (slice * 2 * Math.PI) / slices;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      // Coordenadas cartesianas x, y, z em uma esfera unitária
      const x = cosTheta * sinPhi; // x = r * sin(phi) * cos(theta)
      const y = cosPhi; // y = r * cos(phi)
      const z = sinTheta * sinPhi; // z = r * sin(phi) * sin(theta)

      // Adiciona o vértice
      vertices.push(vec3(x, y, z));

      // Coordenadas de textura (u, v) - mapeamento direto
      // u: de 0 a 1 baseado em theta (longitude)
      // v: de 0 a 1 baseado em phi (latitude)
      const u = 1 - slice / slices; // 1 - (theta / 2π)
      const v = stack / stacks; // phi / π
      texCoords.push(vec2(u, v));
    }
  }

  // Criação dos índices para triangulação
  for (let stack = 0; stack < stacks; stack++) {
    for (let slice = 0; slice < slices; slice++) {
      const first = stack * (slices + 1) + slice;
      const second = first + slices + 1;

      // Dois triângulos formam um quadrilátero
      // Garantindo que os vértices estão na ordem anti-horária para face frontal
      // Primeiro triângulo
      indices.push(first);
      indices.push(second);
      indices.push(first + 1);

      // Segundo triângulo
      indices.push(first + 1);
      indices.push(second);
      indices.push(second + 1);
    }
  }

  return { vertices, indices, texCoords };
}

class SphereUV extends Mesh {
  constructor({
    segments = 32,
    rings = 16,
    color = vec4(0.8, 0.8, 0.8, 1),
    size = 1,
    smooth = true,
  } = {}) {
    // Cria a geometria da esfera
    const { vertices, indices, texCoords } = crieEsferaUV(segments, rings);

    // Aplica o fator de escala
    const scaledVertices = vertices.map((v) => scale(size, v));

    // Gera as normais
    let normals = [];
    let useIndices = true;
    let finalVertices = scaledVertices;
    let finalIndices = indices;
    let finalTexCoords = texCoords;

    if (smooth) {
      // Para renderização suave, calculamos as normais diretamente das posições dos vértices
      // Em uma esfera, a normal em cada ponto é o vetor normalizado da origem até o ponto
      // Como a esfera original é unitária, podemos usar os vértices originais como normais
      // Mas para garantir vetores unitários corretos, normalizamos explicitamente
      normals = scaledVertices.map((v) => {
        // Normaliza cada vetor para garantir que seja unitário
        return normalize(vec3(v[0], v[1], v[2]));
      });
    } else {
      // Para renderização "flat", calculamos normais por face
      normals = generateFlatNormals(scaledVertices, indices);
      // Expandimos para ter um vértice por normal
      finalVertices = expandVertices(scaledVertices, indices);
      // Também expandimos as coordenadas de textura
      finalTexCoords = indices.map((idx) => texCoords[idx]);
      // Sem índices em modo flat
      useIndices = false;
      finalIndices = undefined;
    }

    // Cores para todos os vértices
    const colors = Array(finalVertices.length)
      .fill(0)
      .map(() => vec4(color));

    super({
      vertices: finalVertices,
      colors,
      normals,
      indices: finalIndices,
      texCoords: finalTexCoords,
      useIndices,
    });
  }
}

export default SphereUV;

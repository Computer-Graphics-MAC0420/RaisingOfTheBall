import Mesh from "../mesh";
import {
  expandVertices,
  generateFlatNormals,
  generateSmoothNormals,
  cartesianToPolar,
} from "../utils";

function crieEsfera(ndivisoes = 2) {
  // começamos com os vértices de um balão
  const vertices = [];
  const indices = [];
  const newVertex = (vertex) => {
    vertices.push(vertex);
    return vertices.length - 1;
  };
  const getVertex = (index) => {
    if (index < 0) {
      return vertices[vertices.length + index];
    }
    return vertices[index];
  };

  const insertTriangle = (a, b, c) => {
    indices.push(a, b, c);
  };

  const divideTriangles = (a, b, c, ndivs) => {
    // Cada nível quebra um triângulo em 4 subtriângulos
    // a, b, c em ordem mão direita
    //    c
    // a  b

    // caso base
    if (ndivs > 0) {
      const va = getVertex(a);
      const vb = getVertex(b);
      const vc = getVertex(c);

      const vab = normalize(mix(va, vb, 0.5));
      const vbc = normalize(mix(vb, vc, 0.5));
      const vca = normalize(mix(vc, va, 0.5));

      const ab = newVertex(vab);
      const bc = newVertex(vbc);
      const ca = newVertex(vca);

      divideTriangles(a, ab, ca, ndivs - 1);
      divideTriangles(b, bc, ab, ndivs - 1);
      divideTriangles(c, ca, bc, ndivs - 1);
      divideTriangles(ab, bc, ca, ndivs - 1);
    } else {
      insertTriangle(a, b, c);
    }
  };

  const vp = [
    vec3(1.0, 0.0, 0.0),
    vec3(0.0, 1.0, 0.0),
    vec3(0.0, 0.0, 1.0),
  ].map((v) => newVertex(v));
  const vn = [
    vec3(-1.0, 0.0, 0.0),
    vec3(0.0, -1.0, 0.0),
    vec3(0.0, 0.0, -1.0),
  ].map((v) => newVertex(v));

  const triangles = [
    [vp[0], vp[1], vp[2]],
    [vp[0], vn[2], vp[1]],
    [vp[0], vp[2], vn[1]],
    [vp[0], vn[1], vn[2]],
    [vn[0], vp[2], vp[1]],
    [vn[0], vp[1], vn[2]],
    [vn[0], vn[1], vp[2]],
    [vn[0], vn[2], vn[1]],
  ];

  for (let i = 0; i < triangles.length; i++) {
    const [a, b, c] = triangles[i];
    divideTriangles(a, b, c, ndivisoes);
  }

  return [vertices, indices];
}

class Sphere extends Mesh {
  constructor({
    density = 2,
    color = vec4(0.8, 0.8, 0.8, 1),
    size = 1,
    smooth = true,
  } = {}) {
    let [vertices, indices] = crieEsfera(density);
    vertices = vertices.map((v) => scale(size, v));
    let normals = [];
    let useIndices = true;

    if (smooth) {
      normals = generateSmoothNormals(vertices, indices);
    } else {
      normals = generateFlatNormals(vertices, indices);
      vertices = expandVertices(vertices, indices);
      useIndices = false;
      indices = undefined;
    }

    const colors = Array(vertices.length)
      .fill(0)
      .map(() => vec4(color));

    const texCoords = vertices.map((vert) => {
      // Normalizando o vetor (que já deve estar normalizado, mas para garantir)
      const norm = normalize(vert);

      // Usando a função cartesianToPolar para obter coordenadas esféricas
      const [r, theta, phi] = cartesianToPolar(norm);

      // Calculando longitude (U) - mapeando phi de [-π, π] para [0, 1]
      let u = (phi + Math.PI) / (2 * Math.PI);

      // Calculando latitude (V) - mapeando theta de [0, π] para [1, 0]
      // para que o polo norte (theta=0) fique no topo
      let v = 1.0 - theta / Math.PI;

      // Ajuste final para correção da orientação da textura
      return vec2(2 - u, v);
    });

    super({ vertices, colors, normals, indices, texCoords, useIndices });
  }
}

export default Sphere;

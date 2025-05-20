export function getModelMatrix(translation, rotation, scale) {
  const rotX = rotateX(rotation[0]);
  const rotY = rotateY(rotation[1]);
  const rotZ = rotateZ(rotation[2]);

  const scaleM = mat4(
    scale[0],
    0,
    0,
    0,
    0,
    scale[1],
    0,
    0,
    0,
    0,
    scale[2],
    0,
    0,
    0,
    0,
    1
  );

  const trans = translate(...translation);

  const model = mult(trans, mult(rotZ, mult(rotY, mult(rotX, scaleM))));
  return model;
}

export function square(a, b, c, d) {
  return [a, b, c, a, c, d];
}

export function getNormal(a, b, c) {
  const ab = subtract(a, b);
  const ac = subtract(c, a);
  return normalize(cross(ab, ac));
}

export function generateSmoothNormals(vertices, indices) {
  const normals = new Array(vertices.length).fill(vec3(0, 0, 0));

  for (let i = 0; i < indices.length; i += 3) {
    const a = vertices[indices[i]];
    const b = vertices[indices[i + 1]];
    const c = vertices[indices[i + 2]];

    const normal = getNormal(a, b, c);

    normals[indices[i]] = add(normals[indices[i]], normal);
    normals[indices[i + 1]] = add(normals[indices[i + 1]], normal);
    normals[indices[i + 2]] = add(normals[indices[i + 2]], normal);
  }

  return normals.map((n) => normalize(n));
}

export function generateFlatNormals(vertices, indices) {
  if (indices.length % 3 !== 0) {
    throw new Error("Indices length must be a multiple of 3");
  }

  const normals = new Array(indices.length).fill(null);

  for (let i = 0; i < indices.length; i += 3) {
    const a = vertices[indices[i]];
    const b = vertices[indices[i + 1]];
    const c = vertices[indices[i + 2]];

    const normal = getNormal(a, b, c);

    normals[i] = normal;
    normals[i + 1] = normal;
    normals[i + 2] = normal;
  }

  return normals;
}

export function expandVertices(vertices, indices) {
  const expanded = new Array(indices.length);

  for (let i = 0; i < indices.length; i++) {
    expanded[i] = vertices[indices[i]];
  }

  return expanded;
}

/**
 * Converte coordenadas 3D cartesianas para coordenadas polares/esféricas
 * @param {Array} v - Vetor 3D em coordenadas cartesianas [x, y, z]
 * @returns {Array} - Coordenadas esféricas [r, theta, phi]
 *                   r: distância radial (raio)
 *                   theta: ângulo polar (em radianos) a partir do eixo z positivo
 *                   phi: ângulo azimutal (em radianos) no plano x-y
 */
export function cartesianToPolar(v) {
  const x = v[0];
  const y = v[1];
  const z = v[2];

  // Calcular o raio (distância da origem)
  const r = Math.sqrt(x * x + y * y + z * z);

  // Evitar divisão por zero
  if (r === 0) return [0, 0, 0];

  // Calcular o ângulo polar (theta) a partir do eixo z positivo
  const theta = Math.acos(z / r);

  // Calcular o ângulo azimutal (phi) no plano x-y
  const phi = Math.atan2(y, x);

  return [r, theta, phi];
}

/**
 * Converte coordenadas polares/esféricas para coordenadas 3D cartesianas
 * @param {number} r - Distância radial (raio)
 * @param {number} theta - Ângulo polar (em radianos) a partir do eixo z
 * @param {number} phi - Ângulo azimutal (em radianos) no plano x-y
 * @returns {Array} - Vetor 3D em coordenadas cartesianas [x, y, z]
 */
export function polarToCartesian(r, theta, phi) {
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);

  // Conversão de coordenadas polares para cartesianas
  const x = r * sinTheta * cosPhi;
  const y = r * sinTheta * sinPhi;
  const z = r * cosTheta;

  return vec3(x, y, z);
}

/**
 * Triangula um polígono usando o método de "triangulação em leque"
 * @param {number[]} vertexIndices - Índices dos vértices do polígono
 * @returns {number[]} - Índices dos triângulos resultantes da triangulação
 */
export function triangulatePolygon(vertexIndices) {
  const triangles = [];

  // Para um polígono convexo, podemos usar triangulação em leque
  // onde o primeiro vértice é usado como pivot para todos os triângulos
  for (let i = 1; i < vertexIndices.length - 1; i++) {
    // Primeiro vértice do polígono (pivot)
    triangles.push(vertexIndices[0]);

    // Segundo vértice do triângulo atual
    triangles.push(vertexIndices[i]);

    // Terceiro vértice do triângulo atual
    triangles.push(vertexIndices[i + 1]);
  }

  return triangles;
}

export function fromObjectFile(content) {
  const lines = content.split("\n");
  const vertices = [];
  const normals = [];
  const indices = [];
  const vertexNormals = [];

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts[0] === "v") {
      vertices.push(vec3(...parts.slice(1).map(Number)));
    } else if (parts[0] === "vn") {
      normals.push(vec3(...parts.slice(1).map(Number)));
    } else if (parts[0] === "f") {
      // Coletamos os índices de vértices da face
      const faceVertexIndices = [];
      const faceNormalIndices = [];

      for (let i = 1; i < parts.length; i++) {
        const vertexData = parts[i].split("/").map(Number);
        faceVertexIndices.push(vertexData[0] - 1); // OBJ indices são baseados em 1, não 0

        if (vertexData[2]) {
          faceNormalIndices.push(vertexData[2] - 1);
        }
      }

      // Triangulamos o polígono e adicionamos os índices
      const triangleIndices = triangulatePolygon(faceVertexIndices);

      // Adicionamos os índices dos triângulos
      for (let i = 0; i < triangleIndices.length; i += 3) {
        const v0 = triangleIndices[i];
        const v1 = triangleIndices[i + 1];
        const v2 = triangleIndices[i + 2];

        indices.push(v0, v1, v2);

        // Se tivermos normais, associamos as mesmas aos vértices
        if (faceNormalIndices.length > 0) {
          const n0 = faceNormalIndices[faceVertexIndices.indexOf(v0)];
          const n1 = faceNormalIndices[faceVertexIndices.indexOf(v1)];
          const n2 = faceNormalIndices[faceVertexIndices.indexOf(v2)];

          vertexNormals[v0] = normals[n0];
          vertexNormals[v1] = normals[n1];
          vertexNormals[v2] = normals[n2];
        }
      }
    }
  }

  // Se temos normais por vértice, retorne-as, caso contrário retorne as normais originais
  return {
    vertices,
    normals: vertexNormals.length > 0 ? vertexNormals : normals,
    indices,
  };
}

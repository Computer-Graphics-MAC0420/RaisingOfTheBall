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
  const ab = subtract(b, a);
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

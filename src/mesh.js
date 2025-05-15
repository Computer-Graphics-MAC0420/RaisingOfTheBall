import { getModelMatrix } from "./utils.js";

class Mesh {
  #vertices;
  #normals;
  #colors;
  #indices;
  #useIndices = true;

  #translation = [0, 0, 0];
  #scale = [1, 1, 1];
  #rotation = [0, 0, 0];

  constructor({ vertices, normals, colors, indices, useIndices = true }) {
    this.#vertices = vertices || [];
    this.#colors = colors || [];
    this.#indices = indices || [];
    this.#normals = normals || this.calculateNormals();
    this.#useIndices = useIndices;
  }

  get vertices() {
    return this.#vertices;
  }

  get colors() {
    return this.#colors;
  }

  get indices() {
    return this.#indices;
  }

  get normals() {
    return this.#normals;
  }

  get numV() {
    return this.#indices.length;
  }

  get useIndices() {
    return this.#useIndices;
  }

  setTranslation(t) {
    if (Array.isArray(t)) {
      this.#translation = t;
    } else {
      const { x, y, z } = t;
      if (x) {
        this.#translation[0] = x;
      }
      if (y) {
        this.#translation[1] = y;
      }
      if (z) {
        this.#translation[2] = z;
      }
    }
  }

  getTranslation() {
    return this.#translation;
  }

  setScale(scale) {
    if (Array.isArray(scale)) {
      this.#scale = scale;
    } else {
      const { x, y, z } = scale;
      if (x) {
        this.#scale[0] = x;
      }
      if (y) {
        this.#scale[1] = y;
      }
      if (z) {
        this.#scale[2] = z;
      }
    }
  }
  getScale() {
    return this.#scale;
  }

  getRotation() {
    return this.#rotation;
  }

  setRotation(rot) {
    if (Array.isArray(rot)) {
      this.#rotation = rot;
    } else {
      const { x, y, z } = rot;
      if (x) {
        this.#rotation[0] = x;
      }
      if (y) {
        this.#rotation[1] = y;
      }
      if (z) {
        this.#rotation[2] = z;
      }
    }
  }

  // Método para calcular normais por vértice se não forem fornecidas
  calculateNormals() {
    if (!this.vertices.length || !this.indices.length) return [];

    const normals = Array(this.vertices.length).fill(vec3(0, 0, 0));

    // Para cada face (triângulo)
    for (let i = 0; i < this.indices.length; i += 3) {
      const idx1 = this.indices[i];
      const idx2 = this.indices[i + 1];
      const idx3 = this.indices[i + 2];

      const v1 = this.vertices[idx1];
      const v2 = this.vertices[idx2];
      const v3 = this.vertices[idx3];

      // Calcular vetores da face
      const e1 = subtract(v2, v1);
      const e2 = subtract(v3, v1);

      // Produto vetorial para obter a normal da face
      const normal = normalize(cross(e1, e2));

      // Adicionar a normal a cada vértice da face
      normals[idx1] = add(normals[idx1], normal);
      normals[idx2] = add(normals[idx2], normal);
      normals[idx3] = add(normals[idx3], normal);
    }

    // Normalizar todas as normais
    return normals.map((n) => normalize(n));
  }

  getModelMatrix() {
    return getModelMatrix(this.#translation, this.#rotation, this.#scale);
  }
}

export default Mesh;

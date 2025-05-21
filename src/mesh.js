import Transform from "./transform";

/**
 * Classe que representa uma malha 3D (vertices, cores, normais, etc.)
 */
class Mesh {
  #vertices;
  #normals;
  #colors;
  #indices;
  #texCoords;
  #useIndices = true;

  /**
   * Cria uma nova instância de Mesh
   * @param {Object} options - Opções de configuração
   * @param {Array} [options.vertices=[]] - Array de vértices
   * @param {Array} [options.normals=[]] - Array de normais
   * @param {Array} [options.colors=[]] - Array de cores
   * @param {Array} [options.indices=[]] - Array de índices
   * @param {Array} [options.texCoords=[]] - Array de coordenadas de textura
   * @param {boolean} [options.useIndices=true] - Se deve usar índices para renderizar
   * @param {Object} [options.transform] - Transformação inicial (position, rotation, scale)
   */
  constructor({
    vertices,
    normals,
    colors,
    indices,
    texCoords,
    useIndices = true,
    transform = {},
  } = {}) {
    this.#vertices = vertices || [];
    this.#colors = colors || [];
    this.#indices = indices || [];
    this.#normals = normals || this.calculateNormals();
    this.#texCoords = texCoords || [];
    this.#useIndices = useIndices;
  }

  /**
   * @returns {Array} Array de vértices
   */
  get vertices() {
    return this.#vertices;
  }

  /**
   * @returns {Array} Array de cores
   */
  get colors() {
    return this.#colors;
  }

  /**
   * @returns {Array} Array de índices
   */
  get indices() {
    return this.#indices;
  }

  /**
   * @returns {Array} Array de normais
   */
  get normals() {
    return this.#normals;
  }

  /**
   * @returns {Array} Array de coordenadas de textura
   */
  get texCoords() {
    return this.#texCoords;
  }

  /**
   * @returns {number} Número de vértices para renderização
   */
  get numV() {
    return this.#indices.length;
  }

  /**
   * @returns {boolean} Se deve usar índices para renderizar
   */
  get useIndices() {
    return this.#useIndices;
  }

  /**
   * Método para calcular normais por vértice se não forem fornecidas
   * @returns {Array} Array de normais calculadas
   */
  calculateNormals() {
    if (!this.#vertices.length || !this.#indices.length) return [];

    const normals = Array(this.#vertices.length).fill(vec3(0, 0, 0));

    // Para cada face (triângulo)
    for (let i = 0; i < this.#indices.length; i += 3) {
      const idx1 = this.#indices[i];
      const idx2 = this.#indices[i + 1];
      const idx3 = this.#indices[i + 2];

      const v1 = this.#vertices[idx1];
      const v2 = this.#vertices[idx2];
      const v3 = this.#vertices[idx3];

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
}

export default Mesh;

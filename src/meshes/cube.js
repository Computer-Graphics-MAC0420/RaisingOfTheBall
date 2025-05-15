import Mesh from "../mesh";
import { square, generateFlatNormals, expandVertices } from "../utils";

class Cube extends Mesh {
  constructor({ size = 1, color = vec4(0.8, 0.8, 0.8, 1) }) {
    const vertices = [
      vec3(-0.5, -0.5, 0.5),
      vec3(-0.5, 0.5, 0.5),
      vec3(0.5, 0.5, 0.5),
      vec3(0.5, -0.5, 0.5),
      vec3(-0.5, -0.5, -0.5),
      vec3(-0.5, 0.5, -0.5),
      vec3(0.5, 0.5, -0.5),
      vec3(0.5, -0.5, -0.5),
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

    super({ vertices: expandedVertices, colors, normals, useIndices: false });
  }
}

export default Cube;

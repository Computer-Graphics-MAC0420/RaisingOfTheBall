import Mesh from "../mesh.js";

class Plain extends Mesh {
  constructor({ width = 1, height = 1, color = vec4(0.8, 0.8, 0.8, 1) }) {
    const vertices = [
      vec3(-width / 2, -height / 2, 0),
      vec3(width / 2, -height / 2, 0),
      vec3(width / 2, height / 2, 0),
      vec3(-width / 2, height / 2, 0),
    ];

    const normals = [
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, 1),
    ];

    const colors = [vec4(color), vec4(color), vec4(color), vec4(color)];

    const indices = [2, 1, 0, 3, 2, 0];

    super({ vertices, colors, indices, normals });
  }
}

export default Plain;

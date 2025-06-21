import Mesh from "../../mesh.js";

class Plane extends Mesh {
  constructor({ width = 1, height = 1, color = vec4(0.8, 0.8, 0.8, 1) }) {
    const vertices = [
      vec3(-width / 2, 0, -height / 2),
      vec3(width / 2, 0, -height / 2),
      vec3(width / 2, 0, height / 2),
      vec3(-width / 2, 0, height / 2),
    ];

    const normals = [
      vec3(0, 1, 0),
      vec3(0, 1, 0),
      vec3(0, 1, 0),
      vec3(0, 1, 0),
    ];

    const colors = [color, color, color, color];

    const indices = [0, 1, 2, 0, 2, 3];

    super({ vertices, colors, indices, normals });
  }
}

export default Plane;

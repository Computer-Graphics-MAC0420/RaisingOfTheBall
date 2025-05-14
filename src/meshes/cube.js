import Mesh from "../mesh";

class Cube extends Mesh {
  constructor({ size = 1, color = [0.8, 0.8, 0.8, 1] }) {
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

    const colors = Array(8).fill(vec4(color));

    const normals = [
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, 1),
      vec3(0, 0, -1),
      vec3(0, 0, -1),
      vec3(0, 0, -1),
      vec3(0, 0, -1),
    ];

    const indices = [
      1, 0, 3, 3, 2, 1, 2, 3, 7, 7, 6, 2, 3, 0, 4, 4, 7, 3, 6, 5, 1, 1, 2, 6, 4,
      5, 6, 6, 7, 4, 5, 4, 0, 0, 1, 5,
    ];

    super({ vertices, colors, indices, normals });
  }
}

export default Cube;

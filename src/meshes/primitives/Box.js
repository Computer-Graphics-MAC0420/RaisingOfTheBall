import Mesh from "../../mesh.js";

class Box extends Mesh {
  constructor({ size = 1, color = vec4(0.8, 0.8, 0.8, 1) }) {
    const edges = [
      vec3(-0.5, -0.5, 0.5),
      vec3(-0.5, 0.5, 0.5),
      vec3(0.5, 0.5, 0.5),
      vec3(0.5, -0.5, 0.5),
      vec3(-0.5, -0.5, -0.5),
      vec3(-0.5, 0.5, -0.5),
      vec3(0.5, 0.5, -0.5),
      vec3(0.5, -0.5, -0.5),
    ].map((v) => scale(size, v));

    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];

    const quad = (a, b, c, d) => {
      const t1 = subtract(c, a);
      const t2 = subtract(d, b);
      const normal = normalize(cross(t1, t2));
      const index = vertices.length;

      vertices.push(a, b, c, d);
      normals.push(normal, normal, normal, normal);
      colors.push(vec4(color), vec4(color), vec4(color), vec4(color));
      indices.push(index, index + 1, index + 2, index + 2, index + 3, index);
    };

    quad(edges[3], edges[2], edges[1], edges[0]);
    quad(edges[4], edges[5], edges[6], edges[7]);
    quad(edges[0], edges[4], edges[7], edges[3]);
    quad(edges[1], edges[2], edges[6], edges[5]);
    quad(edges[2], edges[3], edges[7], edges[6]);
    quad(edges[0], edges[1], edges[5], edges[4]);

    super({ vertices, colors, indices, normals });
  }
}

export default Box;

import Mesh from "../../mesh.js";

function crieEsfera(ndivisoes = 2) {
  // começamos com os vértices de um balão
  const pos = [];
  const nor = [];

  let vp = [vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), vec3(0.0, 0.0, 1.0)];

  let vn = [vec3(-1.0, 0.0, 0.0), vec3(0.0, -1.0, 0.0), vec3(0.0, 0.0, -1.0)];

  let triangulo = [
    [vp[0], vp[1], vp[2]],
    [vp[0], vn[2], vp[1]],

    [vp[0], vp[2], vn[1]],
    [vp[0], vn[1], vn[2]],

    [vn[0], vp[2], vp[1]],
    [vn[0], vp[1], vn[2]],

    [vn[0], vn[1], vp[2]],
    [vn[0], vn[2], vn[1]],
  ];

  for (let i = 0; i < triangulo.length; i++) {
    let a, b, c;
    [a, b, c] = triangulo[i];
    dividaTriangulo(a, b, c, ndivisoes, pos, nor);
  }

  return [pos, nor];
}

function dividaTriangulo(a, b, c, ndivs, pos, nor) {
  // Cada nível quebra um triângulo em 4 subtriângulos
  // a, b, c em ordem mão direita
  //    c
  // a  b

  // caso base
  if (ndivs > 0) {
    let ab = mix(a, b, 0.5);
    let bc = mix(b, c, 0.5);
    let ca = mix(c, a, 0.5);

    ab = normalize(ab);
    bc = normalize(bc);
    ca = normalize(ca);

    dividaTriangulo(a, ab, ca, ndivs - 1, pos, nor);
    dividaTriangulo(b, bc, ab, ndivs - 1, pos, nor);
    dividaTriangulo(c, ca, bc, ndivs - 1, pos, nor);
    dividaTriangulo(ab, bc, ca, ndivs - 1, pos, nor);
  } else {
    insiraTriangulo(a, b, c, pos, nor);
  }
}

function insiraTriangulo(a, b, c, pos, nor) {
  pos.push(vec3(a));
  pos.push(vec3(b));
  pos.push(vec3(c));

  const n = getNormal(a, b, c);
  nor.push(vec3(n));
  nor.push(vec3(n));
  nor.push(vec3(n));
}

function getNormal(a, b, c) {
  const ab = subtract(b, a);
  const ac = subtract(c, a);
  return normalize(cross(ab, ac));
}

class Sphere extends Mesh {
  constructor({ density = 2, color = vec4(0.8, 0.8, 0.8, 1), size = 1 } = {}) {
    const [verts, normals] = crieEsfera(density);

    const vertices = verts.map((v) => scale(size, vec3(v)));

    const colors = Array(vertices.length)
      .fill(0)
      .map(() => vec4(color));

    super({ vertices, colors, normals, useIndices: false });
    
    // Store the radius for collision detection
    this.radius = size;
  }
  
  // Getter for radius
  get size() {
    return this.radius;
  }
}

export default Sphere;

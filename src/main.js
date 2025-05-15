import Engine from "./engine";
import Object3D from "./object3d";
import "./style.css";

import { Cube } from "./meshes";

const obj1 = new Object3D({
  position: vec3(-0.7, 0, 0),
  rotationSpeed: vec3(0.1, 0, 0),
  mesh: new Cube({
    size: 1.5,
  }),
});

const obj2 = new Object3D({
  position: vec3(0.7, 0, 0),
  rotationSpeed: vec3(-0.1, 0, 0),
  shader: "red",
  mesh: new Cube({
    size: 0.5,
  }),
});

const engine = new Engine();

engine.init().then(() => {
  console.log("Engine initialized");

  engine.addObject(obj1);
  engine.addObject(obj2);

  engine.start();
});

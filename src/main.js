import Engine from "./engine";
import Object3D from "./object3d";
import "./style.css";

import { Cube } from "./meshes";

const obj1 = new Object3D({
  position: vec3(-0.7, 0, 0),
  velocity: vec3(-0.0001, 0, 0),
  mesh: new Cube({
    size: 1.5,
    color: [0.8, 0, 0.8, 1],
  }),
});

const obj2 = new Object3D({
  position: vec3(0.7, 0, 0),
  velocity: vec3(0.0001, 0, 0),
  mesh: new Cube({
    size: 0.5,
    color: [0.8, 0.8, 0, 1],
  }),
});

const engine = new Engine();

engine.init().then(() => {
  console.log("Engine initialized");

  engine.addObject(obj1);
  engine.addObject(obj2);

  engine.start();
});

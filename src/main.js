import Engine from "./engine";
import Object3D from "./object3d";
import "./style.css";

import { Cube, Plain, Sphere } from "./meshes";
import { isKeyPressed } from "./keyboard";

const CAMERA_SPEED = 0.001;
const lightPos = vec3(-4, 0, 2);

let hAngle = 0;
let vAngle = 0;

const obj1 = new Object3D({
  position: vec3(-0.7, 0, 0),
  rotationSpeed: vec3(0.1, 0, 0),
  shader: "light",
  mesh: new Cube({
    size: 1.5,
  }),
});

const obj2 = new Object3D({
  position: vec3(0.7, 0, 0),
  rotationSpeed: vec3(-0.1, 0, 0),
  shader: "normal",
  mesh: new Cube({
    size: 0.5,
  }),
});

const sphere = new Object3D({
  position: vec3(-0.7, 1.8, 0),
  rotationSpeed: vec3(0, 0, 0),
  shader: "light",
  mesh: new Sphere({
    density: 2,
  }),
});

const lightGismo = new Object3D({
  position: lightPos,
  rotationSpeed: vec3(0, 0, 0),
  shader: "default",
  mesh: new Sphere({
    density: 0,
    size: 0.1,
  }),
});

const floor = new Object3D({
  position: vec3(0, -1, 0),
  shader: "light",
  mesh: new Plain({
    width: 10,
    height: 10,
    color: vec4(0.5, 0.5, 0.5, 1),
  }),
});

const engine = new Engine();

engine.init().then(() => {
  console.log("Engine initialized");

  engine.camera.position = vec3(-5, 0, 0);
  engine.light.position = lightPos;

  engine.addObject(obj1);
  engine.addObject(obj2);
  engine.addObject(sphere);
  engine.addObject(lightGismo);
  engine.addObject(floor);

  window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      console.log("Camera: ", engine.camera.position, engine.camera.lookingAt);
    }
  });

  engine.onUpdate = (dt) => {
    handleMovement(dt);
  };

  engine.start();
});

function handleMovement(dt) {
  const camera = engine.camera;

  if (isKeyPressed("w")) {
    camera.moveForward(CAMERA_SPEED * dt);
  }
  if (isKeyPressed("s")) {
    camera.moveBackward(CAMERA_SPEED * dt);
  }
  if (isKeyPressed("a")) {
    camera.moveLeft(CAMERA_SPEED * dt);
  }
  if (isKeyPressed("d")) {
    camera.moveRight(CAMERA_SPEED * dt);
  }
  if (isKeyPressed("q")) {
    camera.moveUp(CAMERA_SPEED * dt);
  }
  if (isKeyPressed("e")) {
    camera.moveDown(CAMERA_SPEED * dt);
  }
  if (isKeyPressed("ArrowUp")) {
    vAngle += 0.01;
  }
  if (isKeyPressed("ArrowDown")) {
    vAngle -= 0.01;
  }
  if (isKeyPressed("ArrowLeft")) {
    hAngle -= 0.01;
  }
  if (isKeyPressed("ArrowRight")) {
    hAngle += 0.01;
  }
  camera.lookTo(hAngle, vAngle);
}

import Engine from "./engine.js";
import Object3D from "./object3d.js";
import Ball3D from "./ball.js";

import { Cube, Plain, Sphere, SphereUV } from "./meshes/index.js";
import { isKeyPressed } from "./keyboard.js";
import { fromObjectFile } from "./utils.js";
import Texture from "./texture.js";
import Material from "./material.js";
import Mesh from "./mesh.js";
import { Solid } from "./materials/index.js";
import { rgb } from "./colors.js";

// import duckObj from "./assets/objects/rubber_duck/rubber-duck.obj?raw";
// import skullObj from "./assets/12140_Skull_v3_L2.obj?raw";

const canvas = document.getElementById("canvas");
const engine = new Engine();
const CAMERA_SPEED = 0.005;
const CAMERA_ROTATION_SPEED = 0.04; // Velocidade de rotação da câmera

const LIGHT_SPEED = 0.5; // Velocidade de movimento da luz
const lightPos = vec3(-4, 0, 500);
const lightColor = rgb(255, 255, 255);

const defaultMaterial = new Solid({
  color: rgb(204, 83, 83),
});

const obj1 = new Object3D({
  position: vec3(0, 50, 20),
  rotation: vec3(0, 0, 0),
  scale: vec3(10, 10, 1),
  material: defaultMaterial,
  mesh: new Cube({
    size: 20,
  }),
  collidable: true,
});

const ballTexture = new Texture(engine.gl, "./src/assets/pixar.png", {
  filter: "LINEAR",
  mipmap: true,
});
const ballMaterial = new Material({
  shader: "textured",
  texture: ballTexture,
  specularFactor: 0.2,
});

const legoTexture = new Texture(engine.gl, "./src/assets/lego.png", {
  filter: "LINEAR",
  mipmap: true,
});
const legoMaterial = new Material({
  shader: "textured",
  texture: legoTexture,
  specularFactor: 0.3,
});
const radius = 20; // Raio da esfera
const ball = new Ball3D(radius, {
  position: vec3(-4, 0, 100), // Start higher up to test falling
  rotationSpeed: vec3(0, 0, 0),
  // material: new Solid({
  //   color: rgb(255, 0, 0),
  // }),
  mesh: new SphereUV({
    segments: 32,
    rings: 16,
    smooth: true,
  }),
  material: ballMaterial,
});

// Additional collidable objects for testing bouncing behavior
const obj2 = new Object3D({
  position: vec3(-80, 0, 10),
  rotation: vec3(45, 0, 0),
  scale: vec3(5, 5, 5),
  material: new Solid({
    color: rgb(83, 204, 83),
  }),
  mesh: new Cube({
    size: 20,
  }),
  collidable: true,
});

const obj3 = new Object3D({
  position: vec3(80, 40, 30),
  rotation: vec3(0, 0, 0),
  scale: vec3(8, 3, 2),
  material: new Solid({
    color: rgb(83, 83, 204),
  }),
  mesh: new Cube({
    size: 20,
  }),
  collidable: true,
});

const obj4 = new Object3D({
  position: vec3(0, -60, 40),
  rotation: vec3(0, 0, 0),
  scale: vec3(4, 4, 4),
  material: legoMaterial,
  mesh: new Cube({
    size: 20,
  }),
  collidable: true,
});

const obj5 = new Object3D({
  position: vec3(0, -700, 40),
  rotation: vec3(0, 0, 0),
  scale: vec3(4, 40, 6),
  material: new Solid({
    color: rgb(200, 120, 50),
  }),
  mesh: new Cube({
    size: 20,
  }),
  collidable: true,
});

const windmillBlade1 = new Object3D({
  position: vec3(0, -500, 250), // At the top of the tower
  rotation: vec3(0, 45, 0), // Diagonal blade rotating around Y-axis
  scale: vec3(10, 1, 1), // Long and thin blade (adjusted for proper orientation)
  material: new Solid({
    color: rgb(220, 220, 220), // Light gray for blades
  }),
  mesh: new Cube({
    size: 40,
  }),
  collidable: true,
});

const windmillBlade2 = new Object3D({
  position: vec3(0, -500, 250), // Same position as blade1
  rotation: vec3(0, -45, 0), // Perpendicular to blade1, rotating around Y-axis
  scale: vec3(10, 1, 1), // Long and thin blade (adjusted for proper orientation)
  material: new Solid({
    color: rgb(220, 220, 220), // Light gray for blades
  }),
  mesh: new Cube({
    size: 40,
  }),
  collidable: true,
});

// Moving platform that goes side to side
const movingPlatform = new Object3D({
  position: vec3(10, -200, 150), // Starting position
  rotation: vec3(0, 0, 0),
  scale: vec3(15, 2, 8), // Wide, thin platform
  material: new Solid({
    color: rgb(150, 75, 200), // Purple color
  }),
  mesh: new Cube({
    size: 20,
  }),
  collidable: true,
});

// Platform movement properties
const platformMovement = {
  speed: 0.08, // Movement speed
  range: 250, // How far it moves from center (total range is 2 * range)
  direction: 1, // 1 for right, -1 for left
  centerX: 0, // Center position
};

engine.init(ball).then(() => {
  console.log("Engine initialized");
  engine.addObject(obj1);
  engine.addObject(obj2);
  engine.addObject(obj3);
  engine.addObject(obj4);
  engine.addObject(obj5);
  engine.addObject(windmillBlade1);
  engine.addObject(windmillBlade2);
  engine.addObject(movingPlatform);

  // Configurar a luz com opção para mostrar o gizmo (representação visual)
  engine.light.position = lightPos;
  engine.light.color = lightColor;

  canvas.addEventListener("click", lockPointer);
  document.addEventListener("keydown", disableLockPointer);
  document.addEventListener("pointerlockchange", pointerLockChange);
  document.addEventListener("mozpointerlockchange", pointerLockChange);
  document.addEventListener("mousemove", onPointerMove);

  window.addEventListener("keydown", (event) => {
    // Tecla L para mostrar a posição atual da luz
    if (event.key === "p") {
      console.log("Posição da luz:", engine.light.position);
    }
  });

  // Add debug info about controls
  console.log("Controls:");
  console.log("W/A/S/D - Move ball");
  console.log("Space - Jump");
  console.log("Mouse - Look around (click to enable)");
  console.log("I/J/K/L - Move light");
  console.log("U/O - Move light up/down");
  console.log("P - Print light position");
  console.log("ESC - Release mouse");

  engine.onUpdate = (dt) => {
    handleMovement(dt);
  };

  engine.start();
});

function handleMovement(dt) {
  // engine.ball;

  // Animate windmill blades rotation
  const rotationSpeed = 0.2; // Adjust speed as needed
  windmillBlade1.rotation[1] += rotationSpeed * dt;
  windmillBlade2.rotation[1] += rotationSpeed * dt;

  // Animate moving platform
  movingPlatform.position[0] +=
    platformMovement.direction * platformMovement.speed * dt;

  // Check if platform needs to change direction
  if (
    movingPlatform.position[0] >
    platformMovement.centerX + platformMovement.range
  ) {
    platformMovement.direction = -1; // Move left
  } else if (
    movingPlatform.position[0] <
    platformMovement.centerX - platformMovement.range
  ) {
    platformMovement.direction = 1; // Move right
  }

  // Controles da bola
  if (isKeyPressed("w")) {
    engine.ball.moveForward();
  }
  if (isKeyPressed("s")) {
    engine.ball.moveBackward();
  }
  if (isKeyPressed("a")) {
    engine.ball.moveLeft();
  }
  if (isKeyPressed("d")) {
    engine.ball.moveRight();
  }
  if (isKeyPressed(" ")) {
    engine.ball.Jump();
  }

  // Controles da fonte de luz
  // Teclas I, J, K, L para mover no plano XZ
  // Teclas U, O para mover no eixo Y
  if (isKeyPressed("i")) {
    engine.light.position[1] -= LIGHT_SPEED * dt; // Mover para frente (Z-)
  }
  if (isKeyPressed("k")) {
    engine.light.position[1] += LIGHT_SPEED * dt; // Mover para trás (Z+)
  }
  if (isKeyPressed("j")) {
    engine.light.position[0] -= LIGHT_SPEED * dt; // Mover para esquerda (X-)
  }
  if (isKeyPressed("l")) {
    engine.light.position[0] += LIGHT_SPEED * dt; // Mover para direita (X+)
  }
  if (isKeyPressed("u")) {
    engine.light.position[2] += LIGHT_SPEED * dt; // Mover para cima (Y+)
  }
  if (isKeyPressed("o")) {
    engine.light.position[2] -= LIGHT_SPEED * dt; // Mover para baixo (Y-)
  }
}

window.addEventListener("resize", () => {
  engine.resize(window.innerWidth, window.innerHeight);
});

// Callbacks
var isPointerLocked = false;
function lockPointer() {
  if (!isPointerLocked) {
    canvas.requestPointerLock =
      canvas.requestPointerLock || canvas.mozRequestPointerLock;
    canvas.requestPointerLock();
    canvas.focus();
  }
}
function disableLockPointer(event) {
  if (event.key === "Escape") {
    document.exitPointerLock();
  }
}
function pointerLockChange() {
  isPointerLocked =
    document.pointerLockElement === canvas ||
    document.mozPointerLockElement === canvas;
}
function onPointerMove(event) {
  if (!isPointerLocked) return;
  const camera = engine.camera;
  camera.rotateCamera(
    event.movementX * CAMERA_ROTATION_SPEED,
    event.movementY * CAMERA_ROTATION_SPEED
  );
}

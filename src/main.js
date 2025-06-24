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

const LIGHT_SPEED = 0.005; // Velocidade de movimento da luz
const lightPos = vec3(0, 0, 500);
const lightColor = rgb(255, 255, 255);


const defaultMaterial = new Solid({
  color: rgb(204, 83, 83),
});

const obj1 = new Object3D({
  position: vec3(-0.7, 0, 0),
  rotationSpeed: vec3(0.1, 0.03, 0.01),
  material: defaultMaterial,
  mesh: new Cube({
    size: 15,
  }),
});

const obj2 = new Object3D({
  position: vec3(2, 3, 1.7),
  rotationSpeed: vec3(0, 0.01, 0.1),
  material: defaultMaterial,
  mesh: new Cube({
    size: 15,
  }),
});

const sphere = new Object3D({
  position: vec3(-0.7, 2.5, 0),
  rotationSpeed: vec3(0.01, 0.01, 0),
  material: new Solid({
    color: rgb(30, 117, 218),
  }),
  mesh: new Sphere({
    density: 6,
    smooth: true,
    size: 7
  }),
});

const floor = new Object3D({
  position: vec3(0, -200, 0),
  scale: vec3(100, 100, 100),
  material: new Solid({
    color: rgb(185, 185, 185),
  }),
  mesh: new Plain({
    width: 100,
    height: 100,
    color: vec4(0.5, 0.5, 0.5, 1),
  }),
});

// const duckMesh = new Mesh(fromObjectFile(duckObj));
// const duck = new Object3D({
//   position: vec3(1, 0, +6),
//   rotation: vec3(-90, 0, 0),
//   scale: vec3(0.2, 0.2, 0.2),
//   rotationSpeed: vec3(0, 0.01, 0),
//   material: new Solid({
//     color: rgb(228, 231, 22),
//   }),
//   mesh: duckMesh,
// });

// const skullMesh = new Mesh(fromObjectFile(skullObj));
// const skull = new Object3D({
//   position: vec3(-3, 0, 0),
//   rotation: vec3(-90, 0, 0),
//   scale: vec3(0.02, 0.02, 0.02),
//   rotationSpeed: vec3(0, 0.01, 0),
//   material: new Solid({
  //     color: rgb(229, 235, 183),
  //   }),
  //   mesh: skullMesh,
  // });

const ballTexture = new Texture(engine.gl, "./src/assets/pixar.png", {
  filter: "LINEAR",
  mipmap: true,
});
const ballMaterial = new Material({
  shader: "textured",
  texture: ballTexture,
  specularFactor: 0.2,
});
const ball = new Ball3D(1, {
  position: vec3(-4, 0, 6),
  rotationSpeed: vec3(0, 0, 0),
  // material: new Solid({
  //   color: rgb(255, 0, 0),
  // }),
  mesh: new SphereUV({
    size: 20,
    segments: 32,
    rings: 16,
    smooth: true,
  }),
  material: ballMaterial,
});

engine.init(ball).then(() => {
  console.log("Engine initialized");

  // Load the textures
  const earthTexture = new Texture(engine.gl, "./src/assets/earth-map.jpg", {
    filter: "LINEAR",
    mipmap: true,
  });

  const dirtTexture = new Texture(engine.gl, "./src/assets/dirt.png", {
    filter: "NEAREST",
  });


  // Criar materiais para os objetos
  const dirtMaterial = new Material({
    shader: "textured",
    texture: dirtTexture,
    specularFactor: 0.0,
  });

  const earthMaterial = new Material({
    shader: "textured",
    texture: earthTexture,
    specularFactor: 0.2,
  });


  const texturedCube = new Object3D({
    position: vec3(-3, 3, 1.0),
    mesh: new Cube({
      size: 1.0,
    }),
    material: dirtMaterial,
  });

  const textureLightCube = new Object3D({
    position: vec3(3.2, 0, 0),
    rotationSpeed: vec3(0.05, 0.1, 0.05),
    mesh: new Cube({
      size: 1.0,
      color: vec4(1, 1, 1, 1),
    }),
    material: dirtMaterial,
  });

  const earth = new Object3D({
    position: vec3(-3, 0, -3),
    rotationSpeed: vec3(0, 0.01, 0),
    mesh: new SphereUV({
      segments: 32,
      rings: 16,
      size: 1,
      smooth: true,
    }),
    material: earthMaterial,
  });

  
  engine.addObject(obj1);
  engine.addObject(obj2);
  engine.addObject(sphere);
  engine.addObject(earth);
  engine.addObject(floor);
  // engine.addObject(ball);
  engine.addObject(texturedCube);
  engine.addObject(textureLightCube);
  // engine.addObject(duck);
  // engine.addObject(skull);

  engine.addObject(
    new Object3D({
      position: vec3(0, -2, -8),
      rotation: vec3(90, 0, 0),
      scale: vec3(3, 1, 3),
      material: new Solid({
        color: rgb(185, 185, 185),
      }),
      mesh: new Plain({
        width: 10,
        height: 10,
        color: vec4(0.5, 0.5, 0.5, 1),
      }),
    })
  );

  engine.addObject(
    new Object3D({
      position: vec3(0, -2, +10),
      rotation: vec3(-90, 0, 0),
      scale: vec3(3, 1, 3),
      material: new Solid({
        color: rgb(185, 185, 185),
      }),
      mesh: new Plain({
        width: 10,
        height: 10,
        color: vec4(0.5, 0.5, 0.5, 1),
      }),
    })
  );

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

  engine.onUpdate = (dt) => {
    handleMovement(dt);
  };

  engine.start();
});

function handleMovement(dt) {
  // engine.ball;

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
    console.log(engine.ball.onGround);
    engine.ball.Jump();
    console.log(engine.ball.onGround);
    console.log(engine.ball.velocity.translation);
    console.log(engine.ball.center);
  }

  // Controles da fonte de luz
  // Teclas I, J, K, L para mover no plano XZ
  // Teclas U, O para mover no eixo Y
  if (isKeyPressed("i")) {
    engine.light.position[2] -= LIGHT_SPEED * dt; // Mover para frente (Z-)
  }
  if (isKeyPressed("k")) {
    engine.light.position[2] += LIGHT_SPEED * dt; // Mover para trás (Z+)
  }
  if (isKeyPressed("j")) {
    engine.light.position[0] -= LIGHT_SPEED * dt; // Mover para esquerda (X-)
  }
  if (isKeyPressed("l")) {
    engine.light.position[0] += LIGHT_SPEED * dt; // Mover para direita (X+)
  }
  if (isKeyPressed("u")) {
    engine.light.position[1] += LIGHT_SPEED * dt; // Mover para cima (Y+)
  }
  if (isKeyPressed("o")) {
    engine.light.position[1] -= LIGHT_SPEED * dt; // Mover para baixo (Y-)
  }
}

window.addEventListener("resize", () => {
  engine.resize(window.innerWidth, window.innerHeight);
});

// Callbacks
var isPointerLocked = false;
function lockPointer() {
  if (!isPointerLocked) {
    canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
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
  isPointerLocked = document.pointerLockElement === canvas || document.mozPointerLockElement === canvas;
}
function onPointerMove(event) {
  if (!isPointerLocked) return;
  const camera = engine.camera;
  camera.rotateCamera(event.movementX * CAMERA_ROTATION_SPEED, event.movementY * CAMERA_ROTATION_SPEED);
}
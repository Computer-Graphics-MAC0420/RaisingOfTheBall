import Engine from "./engine";
import Object3D from "./object3d";
import "./style.css";

import { Cube, Plain, Sphere, SphereUV } from "./meshes";
import { isKeyPressed } from "./keyboard";
import Texture from "./texture";
import Material from "./material";
import { rgb } from "./colors";
import { Solid } from "./materials";
import { cartesianToPolar } from "./utils";

const CAMERA_SPEED = 0.001;
const lightPos = vec3(-4, 0, 2);
const lightColor = rgb(255, 255, 255);

let hAngle = 0;
let vAngle = 0;

/**
 * Faz a câmera olhar para um ponto específico no espaço 3D
 * @param {Object} camera - Objeto da câmera
 * @param {Array|Object3D} target - Ponto alvo ou objeto 3D para onde a câmera deve olhar
 */
function lookAtPoint(camera, target) {
  const targetPosition = target.position ? target.position : target;

  const cameraPos = camera.position;
  const direction = subtract(targetPosition, cameraPos);

  const x = direction[0];
  const y = direction[1];
  const z = direction[2];

  hAngle = Math.atan2(z, x);
  const horizontalDistance = Math.sqrt(x * x + z * z);
  vAngle = Math.atan2(y, horizontalDistance);

  camera.lookTo(hAngle, vAngle);
}

const defaultMaterial = new Solid({
  color: rgb(204, 83, 83),
});

const obj1 = new Object3D({
  position: vec3(-0.7, 0, 0),
  rotationSpeed: vec3(0.1, 0, 0),
  material: defaultMaterial,
  mesh: new Cube({
    size: 1.5,
  }),
});

const obj2 = new Object3D({
  position: vec3(0, 0, 1.7),
  rotationSpeed: vec3(-0.1, 0, 0),
  material: defaultMaterial,
  mesh: new Cube({
    size: 0.5,
  }),
});

const sphere = new Object3D({
  position: vec3(-0.7, 1.8, 0),
  rotationSpeed: vec3(0.01, 0.01, 0),
  material: new Solid({
    color: rgb(30, 117, 218),
  }),
  mesh: new Sphere({
    density: 6,
    smooth: true,
  }),
});

const floor = new Object3D({
  position: vec3(0, -1, 0),
  material: new Solid({
    color: rgb(185, 185, 185),
  }),
  mesh: new Plain({
    width: 10,
    height: 10,
    color: vec4(0.5, 0.5, 0.5, 1),
  }),
});

const engine = new Engine();

engine.init().then(() => {
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

  // Criar um cubo texturizado sem iluminação
  const texturedCube = new Object3D({
    position: vec3(-1.7, 0, 1.0),
    // rotationSpeed: vec3(0, 0.1, 0),
    mesh: new Cube({
      size: 1.0,
      color: vec4(1, 1, 1, 1), // Cor branca para não afetar a textura
    }),
    material: dirtMaterial,
  });

  // Criar um cubo texturizado com iluminação
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
  engine.addObject(texturedCube);
  engine.addObject(textureLightCube);

  engine.camera.position = vec3(-5, 3, 3);
  lookAtPoint(engine.camera, obj1);

  engine.light.position = lightPos;
  engine.light.color = lightColor;

  window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      console.log("Camera: ", engine.camera.position, engine.camera.lookingAt);
    }

    // Focar diferentes objetos com teclas numéricas
    if (event.key === "1") {
      console.log("Olhando para o cubo vermelho (obj1)");
      lookAtPoint(engine.camera, obj1);
    }
    if (event.key === "2") {
      console.log("Olhando para o cubo pequeno (obj2)");
      lookAtPoint(engine.camera, obj2);
    }
    if (event.key === "3") {
      console.log("Olhando para a esfera azul");
      lookAtPoint(engine.camera, sphere);
    }
    if (event.key === "4") {
      console.log("Olhando para a Terra");
      lookAtPoint(engine.camera, earth);
    }
    if (event.key === "5") {
      console.log("Olhando para o cubo com textura");
      lookAtPoint(engine.camera, texturedCube);
    }
    if (event.key === "0") {
      console.log("Olhando para a origem");
      lookAtPoint(engine.camera, vec3(0, 0, 0));
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
  if (isKeyPressed(" ")) {
    camera.moveUp(CAMERA_SPEED * dt);
  }
  if (isKeyPressed("Shift")) {
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

window.addEventListener("resize", () => {
  engine.resize(window.innerWidth, window.innerHeight);
});

import Engine from "./engine.js";
import Object3D from "./object3d.js";
// import "./style.css"; // Removed as it's linked in HTML

import { Cube, Plain, Sphere } from "./meshes/index.js";
import Windmill from "./meshes/windmill.js";
import { isKeyPressed } from "./keyboard.js";

const CAMERA_SPEED = 0.001;
const MOUSE_SENSITIVITY = 0.002; // Mouse sensitivity for camera rotation
const lightPos = vec3(-4, 0, 2);

let hAngle = 0;
let vAngle = 0;
let isPointerLocked = false;

// Mouse movement handling
function setupMouseControls(canvas) {
  // Add instructions
  console.log('Mouse controls: Click on canvas to lock mouse, move mouse to look around, ESC to unlock');
  
  // Request pointer lock when clicking on canvas
  canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
  });

  // Handle pointer lock changes
  document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === canvas;
    console.log('Pointer lock:', isPointerLocked ? 'ENABLED' : 'DISABLED');
    
    // Change cursor style based on pointer lock state
    document.body.style.cursor = isPointerLocked ? 'none' : 'default';
  });

  // Handle mouse movement
  document.addEventListener('mousemove', (event) => {
    if (!isPointerLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    // Update camera angles based on mouse movement
    hAngle += movementX * MOUSE_SENSITIVITY;
    vAngle -= movementY * MOUSE_SENSITIVITY; // Invert Y for natural feel

    // Clamp vertical angle to prevent flipping
    vAngle = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, vAngle));
  });

  // Exit pointer lock with Escape key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isPointerLocked) {
      document.exitPointerLock();
    }
  });
}

// Windmill (complete object with base and animated blades)
const windmill = new Windmill({
  size: 1.5,
  position: vec3(-0.7, 0, 0),
  bladeRotationSpeed: 0.1, // degrees per second (increased from 10.0)
});

const obj2 = new Object3D({
  position: vec3(0.7, 0, 0),
  rotationSpeed: vec3(-0.1, 0, 0),
  shader: "normal",
  mesh: new Cube({
    size: 0.5,
  }),
});

const sphereObj = new Object3D({
  position: vec3(-0.7, 1.8, 0), 
  rotationSpeed: vec3(0, 0, 0),
  shader: "light",
  mesh: new Sphere({
    density: 2,
    size: 0.3 
  }),
});

// Sphere near windmill
const windmillSphere = new Object3D({
  position: vec3(-1.5, 0.5, 0), // Close to windmill (-0.7, 0, 0)
  rotationSpeed: vec3(0, 0.02, 0), // Slow rotation around Y-axis
  shader: "light",
  mesh: new Sphere({
    density: 3,
    size: 0.4,
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
  position: vec3(0, -1, 0), // Initial position, will be adjusted
  shader: "light",
  mesh: new Plain({
    width: 10,
    height: 10,
    color: vec4(0.5, 0.5, 0.5, 1),
  }),
});
// Adjust floor position to be below the windmill
const windmillSize = 1.5;
const towerHeightFactor = 2.0;
floor.position = vec3(0, windmill.getPosition()[1] - (windmillSize * towerHeightFactor / 2), 0);

const engine = new Engine();

engine.init().then(() => {
  console.log("Engine initialized");
  console.log("=== CONTROLS ===");
  console.log("Movement: WASD keys, Q/E for up/down");
  console.log("Mouse: Click canvas to enable mouse look, ESC to disable");
  console.log("Keyboard look: Arrow keys (when mouse is unlocked)");
  console.log("Debug: Spacebar to print camera info");

  engine.camera.position = vec3(-5, 0, 0);
  engine.light.position = lightPos;

  // Setup mouse controls
  const canvas = document.getElementById('canvas');
  if (canvas) {
    setupMouseControls(canvas);
  }

  // Add windmill meshes to engine (polymorphic behavior)
  windmill.getMeshes().forEach(mesh => {
    const obj = new Object3D({
      shader: "light",
      mesh: mesh,
    });
    engine.addObject(obj);
  });

  engine.addObject(obj2);
  engine.addObject(sphereObj); 
  engine.addObject(windmillSphere); // Add the new sphere near windmill
  engine.addObject(lightGismo);
  engine.addObject(floor);

  window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      console.log("Camera: ", engine.camera.position, engine.camera.lookingAt);
    }
  });

  engine.onUpdate = (dt) => {
    // Animate windmill (encapsulated behavior)
    windmill.animate(dt * 0.1); // Adjusted conversion factor
    
    // Test collision detection
    if (windmill.isColliding(windmillSphere)) {
      console.log("Collision detected between windmill and sphere!");
      // You could change the sphere color or position here
    }
    
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
  
  // Only use arrow keys for camera rotation if pointer is not locked
  if (!isPointerLocked) {
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
  }
  
  // Apply camera rotation (from both mouse and keyboard)
  camera.lookTo(hAngle, vAngle);
}

window.addEventListener("resize", () => {
  engine.resize(window.innerWidth, window.innerHeight);
});

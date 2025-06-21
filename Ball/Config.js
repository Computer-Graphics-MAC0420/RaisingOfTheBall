// cor de fundo
const COR_CLEAR = [86 / 255, 223 / 255, 207 / 255, 1.0];

// Propriedades da fonte de luz
const LUZ = {
    pos : vec4(50.0, 50.0, 150.0, 1.0), // posição
    amb : vec4(0.47, 0.47, 0.47, 1.0), // ambiente
    dif : vec4(0.68, 0.68, 0.68, 1.0), // difusãos
    esp : vec4(0.39, 0.39, 0.39, 1.0), // especular
};

const CAM = {
    fovy   : 45.0,
    aspect : window.innerWidth / window.innerHeight,
    near   : 1,
    far    : 2000,    
};

const SENSE_CAMERA = 0.1;
const BALL_VELOCITY = 45; // Speed of the ball
const MIN_PHI_ANGLE = 0; // Minimum vertical angle for the camera
const MAX_PHI_ANGLE = 25; // Maximum vertical angle for the camera

// ============================ LISTENERS ===========================
// Animation control
function pauseAnimation(event) {
    if (event.key == "p" || event.key == "P") {
        gConfig.paused = !gConfig.paused;
        if (!gConfig.paused) {
            gLastTime = Date.now();
            drawAnimation();
        }
    }
}
// Pointer Lock
function lockPointer() {
    if (!gConfig.pointerLocked) {
        gCanvas.requestPointerLock = gCanvas.requestPointerLock || gCanvas.mozRequestPointerLock;
        gCanvas.requestPointerLock();
        gCanvas.focus();
    }
}
function disableLockPointer(event) {
    if (event.key == "Escape"){
        document.exitPointerLock();
    }
}
function pointerLockChange() {
    gConfig.pointerLocked = document.pointerLockElement === gCanvas || document.mozPointerLockElement === gCanvas;
}
// Camera movement
function onPointerMove(event) {
    if (!gConfig.pointerLocked) return;
    gCamera.rotateCamera(event.movementX, event.movementY);
    if (gConfig.paused) renderStep(0);
}
// Ball movement
function onKeyDownMove(event) {
    switch(event.key.toLowerCase()) {
        case 'w': {
            // Move ball forward along camera's local Y axis (ignore Z)
            // let forward = gCamera.getForwardDirection();
            // forward = vec3(forward[0], forward[1], 0); // ignore Z
            // forward = normalize(forward);
            // gBall.velocity.translation = mult(BALL_VELOCITY, forward);
            gBall.velocity.translation[1] = BALL_VELOCITY;
            break;
        }
        case 's': {
            // Move ball backward along camera's local Y axis (ignore Z)
            // let forward = gCamera.getForwardDirection();
            // forward = vec3(forward[0], forward[1], 0); // ignore Z
            // forward = normalize(forward);
            // gBall.velocity.translation = mult(-BALL_VELOCITY, forward);
            gBall.velocity.translation[1] = -BALL_VELOCITY;
            break;
        }
        case 'd': {
            // Move ball right along camera's local X axis (ignore Z)
            // let forward = gCamera.getForwardDirection();
            // let right = vec3(forward[1], -forward[0], 0); // perpendicular in XY plane
            // right = normalize(right);
            // gBall.velocity.translation = mult(BALL_VELOCITY, right);
            gBall.velocity.translation[0] = BALL_VELOCITY;
            break;
        }
        case 'a': {
            // Move ball left along camera's local X axis (ignore Z)
            // let forward = gCamera.getForwardDirection();
            // let left = vec3(-forward[1], forward[0], 0); // perpendicular in XY plane
            // left = normalize(left);
            // gBall.velocity.translation = mult(BALL_VELOCITY, left);
            gBall.velocity.translation[0] = -BALL_VELOCITY;
            break;
        }
        case 'q':
            // Move ball up along world Z axis
            // gBall.velocity.translation = vec3(0, 0, BALL_VELOCITY);
            gBall.velocity.translation[2] = BALL_VELOCITY;
            break;
        case 'e':
            // Move ball down along world Z axis
            // gBall.velocity.translation = vec3(0, 0, -BALL_VELOCITY);
            gBall.velocity.translation[2] = -BALL_VELOCITY;
            break;
    }
}
function onKeyUpMove(event) {
    switch(event.key.toLowerCase()) {
        case 'w':
        case 's':
        case 'a':
        case 'd':
        case 'q':
        case 'e':
            gBall.velocity.translation = vec3(0, 0, 0);
            break;
    }
}
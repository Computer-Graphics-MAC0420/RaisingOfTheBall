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

// ========================= CAMERA CONSTANTS =======================
const SENSE_CAMERA = 0.1;
const BALL_VELOCITY = 45; // Speed of the ball
const MIN_PHI_ANGLE = 1; // Minimum vertical angle for the camera
const MAX_PHI_ANGLE = 25; // Maximum vertical angle for the camera


// ======================== PHYSICS CONSTANTS =======================
// These constants control the ball's physical behavior. You can add AIR_RESISTANCE and ANGULAR_MOMENTUM for more realism.
const GRAVITY = -9.8; // Gravity acceleration (increased for faster jump arc)
const FRICTION = 0.98; // Friction coefficient for the ball
const BOUNCE_FACTOR = 0.8 * 0.5; // Bounce factor for the ball
const MAX_SPEED = 100; // Maximum speed of the ball
const JUMP_FORCE = 50; // Force applied when jumping
const MOVE_ON_AIR_FACTOR = 0.3; // Factor to reduce speed when moving in the air
// const AIR_RESISTANCE = 0.99; // Uncomment to use air resistance
// const ANGULAR_MOMENTUM = 0.95; // Uncomment to use angular momentum


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
        case 'w':
            if(gBall.onGround) {
                gBall.velocity.translation[1] = BALL_VELOCITY; // Move up
            } else {
                gBall.velocity.translation[1] = BALL_VELOCITY * MOVE_ON_AIR_FACTOR; // Reduce speed when in air
            }
            break;
        case 's':
            if(gBall.onGround) {
                gBall.velocity.translation[1] = -BALL_VELOCITY; // Move down
            }
            else {
                gBall.velocity.translation[1] = -BALL_VELOCITY * MOVE_ON_AIR_FACTOR; // Reduce speed when in air
            }
            break;
        case 'd':
            if(gBall.onGround) {
                gBall.velocity.translation[0] = BALL_VELOCITY; // Move right
            }
            else {
                gBall.velocity.translation[0] = BALL_VELOCITY * MOVE_ON_AIR_FACTOR; // Reduce speed when in air
            }
            break;
        case 'a':
            if(gBall.onGround) {
                gBall.velocity.translation[0] = -BALL_VELOCITY; // Move left
            }
            else {
                gBall.velocity.translation[0] += -BALL_VELOCITY * MOVE_ON_AIR_FACTOR; // Reduce speed when in air
            }
            break;
        case 'q':
            // THIS SHOULDN'T EXIST
            gBall.velocity.translation[2] = BALL_VELOCITY;
            break;
            case 'e':
            // THIS SHOULDN'T EXIST
            gBall.velocity.translation[2] = -BALL_VELOCITY;
            break;
        case ' ':
            if(gBall.onGround)
                gBall.Jump();
            break;
    }
}
function onKeyUpMove(event) {
    // switch(event.key.toLowerCase()) {
    //     case 'w':
    //         gBall.velocity.translation[1] -= BALL_VELOCITY;
    //         break;
    //     case 's':
    //         gBall.velocity.translation[1] += BALL_VELOCITY;
    //         break;
    //     case 'a':
    //         gBall.velocity.translation[0] += BALL_VELOCITY;
    //         break;
    //     case 'd':
    //         gBall.velocity.translation[0] -= BALL_VELOCITY;
    //         break;
    //     case 'q':
    //         gBall.velocity.translation[2] -= BALL_VELOCITY;
    //         break;
    //     case 'e':
    //         gBall.velocity.translation[2] += BALL_VELOCITY;
    //         break;
    // }
}
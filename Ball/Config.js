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
const BALL_VELOCITY = 15; // Speed of the ball

// ============================ LISTENERS ===========================
function lockPointer() {
    if (!gConfig.pointerLocked) {
        gCanvas.requestPointerLock = gCanvas.requestPointerLock || gCanvas.mozRequestPointerLock;
        gCanvas.requestPointerLock();
        gCanvas.focus(); // Ensure canvas receives keyboard events
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
function onPointerMove(event) {
    if (!gConfig.pointerLocked) return;
    gCamera.theta[1] += event.movementX * SENSE_CAMERA;
    gCamera.theta[0] += event.movementY * SENSE_CAMERA;

    gCamera.theta[0] = Math.max(-89, Math.min(89, gCamera.theta[0]));
    // gCamera.theta[1] = Math.max(-89, Math.min(89, gCamera.theta[1]));
    gCamera.theta[1] = gCamera.theta[1] % 360;
    console.log(`Camera theta: ${gCamera.theta}`);
    if (gConfig.paused) renderStep(0);
}


function pauseAnimation(event) {
    if (event.key == "p" || event.key == "P") {
        gConfig.paused = !gConfig.paused;
        if (!gConfig.paused) {
            gLastTime = Date.now();
            drawAnimation();
        }
    }
}
function onKeyDownMove(event) {
    switch(event.key.toLowerCase()) {
        case 'w':
            gCamera.vTrans[0] = 1; // move forward
            gBall.velocity.translation[0] = BALL_VELOCITY; // move ball forward
            break;
        case 's':
            gCamera.vTrans[0] = -1; // move backward
            gBall.velocity.translation[0] = -BALL_VELOCITY; // move ball backward
            break;
        case 'a':
            gCamera.vTrans[1] = -1; // move left
            gBall.velocity.translation[1] = -BALL_VELOCITY; // move ball left
            break;
        case 'd':
            gCamera.vTrans[1] = 1; // move right
            gBall.velocity.translation[1] = BALL_VELOCITY; // move ball right
            break;
        case 'q':
            gCamera.vTrans[2] = 1; // Move up
            gBall.velocity.translation[2] = BALL_VELOCITY; // Move ball up
            break;
        case 'e':
            gCamera.vTrans[2] = -1; // Move down
            gBall.velocity.translation[2] = -BALL_VELOCITY; // Move ball down
            break;
    }
}
function onKeyUpMove(event) {
    switch(event.key.toLowerCase()) {
        case 'w':
        case 's':
            gCamera.vTrans[0] = 0;
            gBall.velocity.translation[0] = 0; // Stop ball forward/backward movement
            break;
        case 'a':
        case 'd':
            gCamera.vTrans[1] = 0;
            gBall.velocity.translation[1] = 0; // Stop ball left/right movement
            break;
        case 'q':
        case 'e':
            gCamera.vTrans[2] = 0;
            gBall.velocity.translation[2] = 0; // Stop ball up/down movement
            break;
    }
}
class Camera {
    constructor(eye, at, up) {
        // this.position = eye;
        this.ballOffset = vec3(-20, 20, 400);
        this.position = add(gBall.center, this.ballOffset);
        this.at = at;
        this.up = up;

        this.vTrans = vec3(0, 0, 0); // [forward/back, right/left, up/down]
        this.theta = vec3(0, 0, 0); // [pitch, yaw, roll]

        gCtx.view = lookAt(this.position, this.at, this.up);
    }

    update(delta) {
        // console.log(`Camera position: ${this.position}, at: ${this.at}, up: ${this.up}`);
        // Calculate rotation: yaw (Y), then pitch (X)
        let pitchRotation = rotateX(this.theta[0]);
        let yawRotation = rotateY(this.theta[1]);
        let cameraRotation = mult(yawRotation, pitchRotation);

        // Forward direction (Z-)
        let initialFront = vec4(0, 0, -1, 0);
        let toFront = mult(cameraRotation, initialFront);
        toFront = vec3(toFront[0], toFront[1], toFront[2]);
        // Right direction (X+)
        let initialRight = vec4(1, 0, 0, 0);
        let toRight = mult(cameraRotation, initialRight);
        toRight = vec3(toRight[0], toRight[1], toRight[2]);
        // Up direction (Y+)
        let initialUp = vec4(0, 1, 0, 0);
        let toUp = mult(cameraRotation, initialUp);
        toUp = vec3(toUp[0], toUp[1], toUp[2]);

        // Move camera
        // this.position = add(this.position, mult(this.vTrans[0] * delta * 100, toFront));
        // this.position = add(this.position, mult(this.vTrans[1] * delta * 100, toRight));
        // this.position = add(this.position, mult(this.vTrans[2] * delta * 100, toUp));
        this.position = add(gBall.center, this.ballOffset);
        // console.log(`Camera position: ${this.position}`);

        // Update up and at
        this.up = toUp;
        this.at = add(this.position, toFront);

        gCtx.view = lookAt(this.position, this.at, this.up);
        gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));
    }
}
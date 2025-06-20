class Nail {
    // ======================= NAIL INITIALIZATION ======================
    constructor(sphereCenter, initTheta,
                vTrans, vTheta,
                scale, color, alfa) {

        // The nail's body
        this.sphere = new Esfera(
            scale, 0, { amb: color, dif: color, esp: alfa },
            vec3(0.0, 0.0, 0.0), vec3(0.0, 0.0, 0.0), sphereCenter, false, 0
        );
        
        // Translation and Rotation velocities
        this.transVelocity = vTrans;
        this.rotatVelocity = vTheta;

        // Initial and Current angles
        this.previousTheta = vec3(0.0, 0.0, 0.0);
        this.currentTheta = initTheta;

        // Nail's coordinate system
        this.coordinateX = vec3(1.0, 0.0, 0.0);
        this.coordinateY = vec3(0.0, 1.0, 0.0);
        this.coordinateZ = vec3(0.0, 0.0, -1.0);
    }
    initShaderVAO() {
        this.sphere.initShaderVAO();
    }

    // ========================= NAIL INTERFACE =========================
    handleTranslationVelocityChange(event) {
        switch (event.key) {
            case 'j':
            case 'J':
                // Decrease speed
                this.transVelocity -= CAM_SPEED_STEP;
                console.log("Tecla J - vel--:", this.transVelocity);
                break;
            case 'k':
            case 'K':
                // Stop movement
                this.transVelocity = 0;
                console.log("Tecla K - zera vtrans:", this.sphere.theta);
                break;
            case 'l':
            case 'L':
                // Increase speed
                this.transVelocity += CAM_SPEED_STEP; 
                console.log("Tecla L - vel++:", this.transVelocity);
                break;
            default:
                break;
        }
    }
    handleRotationChange(event) {
        let keyPressed = true;
        switch (event.key) {
            case 'w':
            case 'W':
                // Pitch up
                this.currentTheta[0] -= CAM_ROTATION_STEP;
                console.log("Tecla W - rot para cima:", this.currentTheta[0]);
                break;
            case 'x':
            case 'X':
                // Pitch down
                this.currentTheta[0] += CAM_ROTATION_STEP;
                console.log("Tecla X - rot para baixo:", this.currentTheta[0]);
                break;
            case 'a':
            case 'A':
                // Yaw left
                this.currentTheta[1] -= CAM_ROTATION_STEP;
                console.log("Tecla A - rot para esq:", this.currentTheta[1]);
                break;
            case 'd':
            case 'D':
                // Yaw right
                this.currentTheta[1] += CAM_ROTATION_STEP;
                console.log("Tecla D - rot para dir:", this.currentTheta[1]);
                break;
            case 'z':
            case 'Z':
                // Roll counter-clockwise
                this.currentTheta[2] += CAM_ROTATION_STEP;
                console.log("Tecla Z - rot anti-hor:", this.currentTheta[2]);
                break;
            case 'c':
            case 'C':
                // Roll clockwise
                this.currentTheta[2] -= CAM_ROTATION_STEP;
                console.log("Tecla C - rot hor:", this.currentTheta[2]);
                break;
            case 's':
            case 'S':
                // Stop all rotation
                this.rotatVelocity = vec3(0, 0, 0);
                console.log("Tecla S - zera rotação:", this.rotatVelocity);
                break;
            default:
                keyPressed = false;
                break;
        }
        if (keyPressed) renderStep(0);
    }

    // ========================== NAIL UPDATES ==========================
    update(deltaTime) {
        this.updateCoordinates(deltaTime);
        this.updatePosition(deltaTime);
        
        this.eye = add(this.sphere.center, scale(this.sphere.radius[2], this.coordinateZ));
        this.at = add(this.eye, this.coordinateZ);
        this.up = this.coordinateY;

        console.log("Agulha pos:", this.sphere.center);
        this.updateCamera();
        // Just update the sphere's model orientation and render it
        this.sphere.update(deltaTime);
    }
    updateCoordinates(deltaTime) {
        // Update the current rotation angles based on the rotation velocity
        this.currentTheta = add(this.currentTheta, mult(deltaTime, this.rotatVelocity));

        // Calculate the change in rotation angles
        let deltaTheta = subtract(this.currentTheta, this.previousTheta);
        let cameraRotation = mat4();
        cameraRotation = mult(cameraRotation, rotate(deltaTheta[0], this.coordinateX)); // Pitch
        cameraRotation = mult(cameraRotation, rotate(deltaTheta[1], this.coordinateY)); // Yaw
        cameraRotation = mult(cameraRotation, rotate(deltaTheta[2], this.coordinateZ)); // Roll

        // Update the camera's coordinate system based on the rotation
        let aux = mult(cameraRotation, vec4(...this.coordinateX, 0));
        this.coordinateX = vec3(aux[0], aux[1], aux[2]);
        aux = mult(cameraRotation, vec4(...this.coordinateY, 0));
        this.coordinateY = vec3(aux[0], aux[1], aux[2]);
        aux = mult(cameraRotation, vec4(...this.coordinateZ, 0));
        this.coordinateZ = vec3(aux[0], aux[1], aux[2]);

        // Apply the camera rotation to the sphere's orientation
        this.sphere.modelOri = mult(cameraRotation, this.sphere.modelOri);

        // Update the sphere's orientation
        this.previousTheta = vec3(this.currentTheta[0], this.currentTheta[1], this.currentTheta[2]);
    }
    updatePosition(deltaTime) {
        let oldOrientedEye = add(this.sphere.center, scale(this.sphere.radius[2], this.coordinateZ));
        // Calculate the vector from the sphere's center to the camera
        let sphereToCameraVector = normalize(subtract(oldOrientedEye, this.sphere.center));        
        // Update the sphere's position based on the translation velocity
        this.sphere.center = add(this.sphere.center, mult(deltaTime * this.transVelocity, sphereToCameraVector));
    }
    updateCamera() {
        if (DEBUG) {
            // Third-person camera
            gCtx.view = lookAt(gCamera.eye, gCamera.at, gCamera.up);
        } else {
            // First-person camera (Nail perspective)
            gCtx.view = lookAt(this.eye, this.at, this.up);
        }
        gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));
    }
}
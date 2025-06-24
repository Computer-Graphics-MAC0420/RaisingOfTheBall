class Camera {
    constructor() {       
        this.radius = 265; 
        this.thetaAngle = 50; 
        this.phiAngle = 15; 
        
        this.up = vec3(0, 0, 1);

        // Smoothed positions
        this.eye = vec3(0, 0, 0);
        this.at = vec3(0, 0, 0);

        // Target positions
        this.targetEye = vec3(0, 0, 0);
        this.targetAt = vec3(0, 0, 0);

        this.coordinateX = vec3(-1.0, 0.0, 0.0);
        this.coordinateY = vec3(0.0, -1.0, 0.0);
        this.coordinateZ = vec3(0.0, 0.0, 1.0);

        this.lerpAlpha = 0.1; // Smoothing factor (0.0 - 1.0)

        this.update(true); // Force initial update
    }

    getEye() {
        const center = gBall.center;
        const thetaRad = radians(this.thetaAngle);
        const phiRad = radians(this.phiAngle);
        const x = center[0] + this.radius * Math.cos(phiRad) * Math.sin(thetaRad);
        const y = center[1] + this.radius * Math.cos(phiRad) * Math.cos(thetaRad);
        const z = center[2] + this.radius * Math.sin(phiRad);
        return vec3(x, y, z);
    }

    rotateCamera(deltaX, deltaY) {
        this.thetaAngle = (this.thetaAngle + deltaX * SENSE_CAMERA) % 360;
        this.phiAngle = (this.phiAngle + deltaY * SENSE_CAMERA) % 360;
        this.phiAngle = Math.max(MIN_PHI_ANGLE, Math.min(MAX_PHI_ANGLE, this.phiAngle));
        this.updateCoordinates();
    }

    updateCoordinates() {
        let rz = rotateZ(this.thetaAngle);
        let aux = mult(rz, vec4(-1,0,0,0));
        this.coordinateX = vec3(aux[0], aux[1], aux[2]);
        aux = mult(rz, vec4(0,-1,0,0));
        this.coordinateY = vec3(aux[0], aux[1], aux[2]);
    }

    // Linear interpolation between two vec3
    lerpVec3(a, b, t) {
        return vec3(
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t
        );
    }

    update(force = false) {
        // Set target positions
        this.targetEye = this.getEye();
        this.targetAt = gBall.center;

        if (force) {
            // Instantly set to target on first update
            this.eye = this.targetEye;
            this.at = this.targetAt;
        } else {
            // Smoothly interpolate towards target
            this.eye = this.lerpVec3(this.eye, this.targetEye, this.lerpAlpha);
            this.at = this.lerpVec3(this.at, this.targetAt, this.lerpAlpha);
        }

        gCtx.view = lookAt(this.eye, this.at, this.up);
        gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));
    }
}
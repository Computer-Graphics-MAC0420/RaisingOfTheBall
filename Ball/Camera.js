class Camera {
    constructor() {       
        // Distance from the ball center
        this.radius = 265; 
        // Angle to look left/right
        this.thetaAngle = 0; 
        // Angle to look up/down
        this.phiAngle = 15; 
        
        this.up = vec3(0, 0, 1);
        // Current smoothed positions
        this.eye = vec3(0, 0, 0);
        this.at = vec3(0, 0, 0);

        this.coordinateX = vec3(1.0, 0.0, 0.0);
        this.coordinateY = vec3(0.0, 1.0, 0.0);
        this.coordinateZ = vec3(0.0, 0.0, 1.0);

        this.update();
    }
    getEye() {
        const center = gBall.center;
        const thetaRad = this.thetaAngle * Math.PI / 180;
        const phiRad = this.phiAngle * Math.PI / 180;
        const x = center[0] + this.radius * Math.cos(phiRad) * Math.sin(thetaRad);
        const y = center[1] + this.radius * Math.cos(phiRad) * Math.cos(thetaRad);
        const z = center[2] + this.radius * Math.sin(phiRad);
        return vec3(x, y, z);
    }
    rotateCamera(deltaX, deltaY) {
        // Horizontal mouse movement rotates around Z (theta)
        this.thetaAngle = (this.thetaAngle + deltaX * SENSE_CAMERA) % 360;
        // Vertical mouse movement rotates up/down (phi)
        this.phiAngle = (this.phiAngle + deltaY * SENSE_CAMERA) % 360;
        // Clamp phi to avoid flipping
        this.phiAngle = Math.max(MIN_PHI_ANGLE, Math.min(MAX_PHI_ANGLE, this.phiAngle));
        console.log(`Camera angles - Theta: ${this.thetaAngle}, Phi: ${this.phiAngle}`);
    }
    update() {
        this.eye = this.getEye();
        this.at = gBall.center;
        gCtx.view = lookAt(this.eye, this.at, this.up);
        gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));
    }
}
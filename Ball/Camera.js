class Camera {
    constructor() {       
        // Offset from the ball center
        this.ballOffset = vec3(0, 10, 0);
        // Distance from the ball center
        this.radius = 265; 
        // Angle around the ball
        this.thetaAngle = 0; 
        // Angle above the ball
        this.phiAngle = 0; 
        
        this.up = vec3(0, 1, 0);
        // Current smoothed positions
        this.eye = vec3(0, 0, 0);
        this.at = vec3(0, 0, 0);

        // Targets we interpolate to
        this.targetEye = vec3(0, 0, 0);
        this.targetAt = vec3(0, 0, 0);

        this.smoothFactor = 0.1; // smaller = smoother/slower
        this.update(); // Initialize view matrix

    }
    getEye() {
        const thetaRad = this.thetaAngle * Math.PI / 180;
        const phiRad = this.phiAngle * Math.PI / 180;
        const x = this.ballOffset[0] + this.radius * Math.sin(phiRad) * Math.cos(thetaRad);
        const y = this.ballOffset[1] + this.radius * Math.sin(phiRad) * Math.sin(thetaRad);
        const z = this.ballOffset[2] + this.radius * Math.cos(phiRad);
        return vec3(x, y, z);
    }
    rotateCamera(deltaX, deltaY) {
        this.thetaAngle += deltaX * SENSE_CAMERA;
        this.phiAngle -= deltaY * SENSE_CAMERA;

        this.phiAngle = Math.max(MIN_PHI_ANGLE, Math.min(MAX_PHI_ANGLE, this.phiAngle));
    }
    lerpVec3(a, b, t) {
        return vec3(
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t
        );
    }
    update() {
        // Always look at the ball center
        this.targetAt = gBall.center;
        this.targetEye = this.getEye();
        // Interpolate actual values toward target
        this.eye = this.lerpVec3(this.eye, this.targetEye, this.smoothFactor);
        this.at = this.lerpVec3(this.at, this.targetAt, this.smoothFactor);

        gCtx.view = lookAt(this.eye, this.at, this.up);
        gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));
    }

    // Returns the normalized forward direction from the camera to the ball (XZ plane only)
    getForwardDirection() {
        const dir = subtract(gBall.center, this.eye);
        // Project onto XZ plane
        dir[1] = 0;
        const len = Math.sqrt(dir[0]*dir[0] + dir[2]*dir[2]);
        if (len === 0) return vec3(0,0,1); // default forward
        return vec3(dir[0]/len, 0, dir[2]/len);
    }
}
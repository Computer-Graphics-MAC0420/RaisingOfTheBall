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

        this.coordinateX = vec3(-1.0, 0.0, 0.0);
        this.coordinateY = vec3(0.0, -1.0, 0.0);
        this.coordinateZ = vec3(0.0, 0.0, 1.0);

        this.update();
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
        // TODO stop camera rotation when coliding with objects
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
    update() {
        this.eye = this.getEye();
        this.at = gBall.center;
        gCtx.view = lookAt(this.eye, this.at, this.up);
        gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view));
    }
}
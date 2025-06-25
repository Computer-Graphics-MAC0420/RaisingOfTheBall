const SENSE_CAMERA = 1;
const MIN_PHI_ANGLE = -50; // Minimum vertical angle for the camera
const MAX_PHI_ANGLE = 50; // Maximum vertical angle for the camera

class Camera {
  #ball;

  #eye;
  #at;
  #up;

  #targetEye;
  #targetAt;

  #distance;
  #thetaAngle;
  #phiAngle;

  #fovy = 45;
  #aspect = 1;
  #near = 0.1;
  #far = 2000;
  // calcula a matriz de transformação perpectiva (fovy, aspect, near, far)

  get position() {
    return this.#eye;
  }

  set position(value) {
    this.moveTo(value);
  }

  get lookingAt() {
    return this.#at;
  }

  constructor({
    ball = null,
    distance = 200,
    thetaAngle = 0,
    phiAngle = 15,
    lerpAlpha = 0.1,

    position = vec3(0, 0, 0),
    at = vec3(0, 0, 0),
    up = vec3(0, 0, 1),
  } = {}) {
    this.#ball = ball;
    this.#distance = distance;
    this.#thetaAngle = thetaAngle;
    this.#phiAngle = phiAngle;

    // Smoothed positions
    this.#up = up;
    this.#eye = position;
    this.#at = at;

    // Target positions
    this.#targetEye = position;
    this.#targetAt = at;

    // Camera coordinates
    this.coordinateX = vec3(-1.0, 0.0, 0.0);
    this.coordinateY = vec3(0.0, -1.0, 0.0);
    this.coordinateZ = vec3(0.0, 0.0, 1.0);

    // Smoothing factor (0.0 - 1.0)
    this.lerpAlpha = lerpAlpha;
  }

  // moveTo(position) {
  //   const v = subtract(this.#at, this.#eye);
  //   this.#eye = position;
  //   this.#at = add(position, v);
  // }

  // moveForward(dist) {
  //   const v = normalize(subtract(this.#at, this.#eye));

  //   this.moveTo(add(this.#eye, scale(dist, v)));
  // }

  // moveBackward(dist) {
  //   this.moveForward(-dist);
  // }

  // moveRight(dist) {
  //   const v = normalize(cross(subtract(this.#at, this.#eye), this.#up));

  //   this.moveTo(add(this.#eye, scale(dist, v)));
  // }

  // moveLeft(dist) {
  //   this.moveRight(-dist);
  // }

  // moveUp(dist) {
  //   this.moveTo(add(this.#eye, scale(dist, this.#up)));
  // }

  // moveDown(dist) {
  //   this.moveUp(-dist);
  // }
  setResolution(width, height) {
    this.#aspect = width / height;
  }

  getViewMatrix(force = false) {
    this.#targetEye = this.getEye();
    this.#targetAt = this.#ball.center;

    if (force) {
      // If forced, set the camera to the target position directly
      this.#eye = this.#targetEye;
      this.#at = this.#targetAt;
    } else {
      // Smoothly interpolate the camera position and target
      this.#eye = this.lerpVec3(this.#eye, this.#targetEye, this.lerpAlpha);
      this.#at = this.lerpVec3(this.#at, this.#targetAt, this.lerpAlpha);
    }
    return lookAt(this.#eye, this.#at, this.#up);
  }

  getProjectionMatrix() {
    return perspective(this.#fovy, this.#aspect, this.#near, this.#far);
  }

  getEye() {
    const center = this.#ball.center;
    const thetaRad = radians(this.#thetaAngle);
    const phiRad = radians(this.#phiAngle);
    const x =
      center[0] + this.#distance * Math.cos(phiRad) * Math.sin(thetaRad);
    const y =
      center[1] + this.#distance * Math.cos(phiRad) * Math.cos(thetaRad);
    const z = center[2] + this.#distance * Math.sin(phiRad);
    return vec3(x, y, z);
  }

  rotateCamera(deltaX, deltaY) {
    this.#thetaAngle = (this.#thetaAngle + deltaX * SENSE_CAMERA) % 360;
    this.#phiAngle = (this.#phiAngle + deltaY * SENSE_CAMERA) % 360;
    this.#phiAngle = Math.max(
      MIN_PHI_ANGLE,
      Math.min(MAX_PHI_ANGLE, this.#phiAngle)
    );
    this.updateCoordinates();
  }

  // SERVE PA DEBUGAR
  changeAngles(x) {
    this.#thetaAngle = (this.#thetaAngle + x) % 360;
  }

  updateCoordinates() {
    let rz = rotateZ(this.#thetaAngle);
    let aux = mult(rz, vec4(-1, 0, 0, 0));
    this.coordinateX = vec3(aux[0], aux[1], aux[2]);
    aux = mult(rz, vec4(0, -1, 0, 0));
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
}

export default Camera;

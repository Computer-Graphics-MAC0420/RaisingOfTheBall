import Object3D from "./object3d.js";

// Por causa do comportamento dos frames, as velocidades precisam ser redimensionadas
const FATOR_DE_CONVERSAO = 0.000005;

const BALL_VELOCITY = 0.05;
const GRAVITY = -9.81 * FATOR_DE_CONVERSAO; // Gravity acceleration (increased for faster jump arc)
const FRICTION = 0.98; // Friction coefficient for the ball
const BOUNCE_FACTOR = 0.8 * 0.5 * FATOR_DE_CONVERSAO; // Bounce factor for the ball
const MAX_SPEED = 100 * FATOR_DE_CONVERSAO; // Maximum speed of the ball
const JUMP_FORCE = 0.05; // Force applied when jumping
const MOVE_ON_AIR_FACTOR = 0.3 * FATOR_DE_CONVERSAO; // Factor to reduce speed when moving in the air

class Ball3D extends Object3D {
    constructor(size, options = {}) {
        super(options);
        // Propriedades do shape
        this.radius = size;
        this.resolution = 2;
        
        // Propriedades de movimento
        this.center = options.position || vec3(0, 0, 0);
        this.theta = vec3(0, 0, 0);
        this.velocity = {
            rotation: vec3(0, 0, 0), 
            translation: vec3(0, 0, 0)
        };
        this._modelTrans = mat4();
        this._modelRot = mat4();
        this._modelScale = scale(this.radius, this.radius, this.radius);

        this.modelOriginal = mat4();
        this.modelOri = mat4(); // Matriz de orientação da bola
        
        // Propriedades de física
        this.acceleration = vec3(0, 0, 0); // Aceleração atual
        this.force = vec3(0, 0, 0); // Força atual
        this.onGround = false;
        this.jumpResquested = false;
        
        this.gravity = vec3(0, 0, GRAVITY); // Vetor de gravidade (para baixo no eixo Z)
        this.friction = FRICTION;
        this.elasticity = BOUNCE_FACTOR; // Elasticidade para o salto
        this.maxSpeed = MAX_SPEED;
        this.angularVelocity = vec3(0, 0, 0); // Para rotação/rolagem
    }
    get modelTrans() {
        return this._modelTrans;
    }
    get modelRot() {
        return this._modelRot;
    }
    get modelScale() {
        return this._modelScale;
    }
    updatePosition(delta, camera) {
        // GRAVITY
        this.acceleration = add(this.acceleration, this.gravity);
        this.velocity.translation = add(this.velocity.translation, mult(delta, this.acceleration));
        this.acceleration = vec3(0, 0, 0); // Reset acceleration for next frame

        // Apply friction to horizontal movement (X and Y)
        this.velocity.translation[0] *= this.friction;
        this.velocity.translation[1] *= this.friction;
        // Optionally, apply friction to Z if you want air resistance
        // this.velocity.translation[2] *= this.friction;

        let cameraBase = mat3();
        cameraBase[0] = camera.coordinateX;
        cameraBase[1] = camera.coordinateY;
        cameraBase[2] = camera.coordinateZ;
        
        const vel = mult(cameraBase, this.velocity.translation);
        this.center = add(this.center, mult(delta, vel));
        
        // GROUND
        if (this.center[2] - this.radius < 0) {
            this.center[2] = this.radius;
            // // Bounce if falling downwards
            // if (this.velocity.translation[2] < 0) {
            //     this.velocity.translation[2] = -this.velocity.translation[2] * this.elasticity; // small bounce
            //     // Stop very small bounces
            //     if (Math.abs(this.velocity.translation[2]) < 1) {
            //         this.velocity.translation[2] = 0;
            //     }
            // }
            this.onGround = true;
        } else {
            this.onGround = false;
        }
        console.log("Ball position:", this.center);
        
        // TODO: implement collision detection and response

        let model = mat4();
        model = mult(model, translate(this.center[0], this.center[1], this.center[2]));
        this._modelTrans = model;
        return model;
    }
    updateRotation(delta, camera) {
        // Calculate the velocity vector in world coordinates
        let cameraBase = mat3();
        cameraBase[0] = camera.coordinateX;
        cameraBase[1] = camera.coordinateY;
        cameraBase[2] = camera.coordinateZ;
        const vel = mult(cameraBase, this.velocity.translation);

        const speed = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1]); // Only consider horizontal speed for rolling

        const ANGULAR_FRICTION = 0.98; // Slightly increased friction for a more gradual stop
        const ROLL_FACTOR = 0.3; // Reduce this to make the ball roll less

        if (speed > 0.0001) { // A slightly larger threshold to avoid micro-rotations
            // The axis of rotation is perpendicular to the velocity and the ground (z axis)
            let axis = vec3(-vel[1], vel[0], 0); // perpendicular in XY plane
            
            // Normalize axis
            const axisLen = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1]);
            if (axisLen > 0.0001) {
                axis = vec3(axis[0]/axisLen, axis[1]/axisLen, 0);
                
                // The angle to rotate is distance/radius
                const distance = speed * delta;
                
                // Calculate angular velocity (radians per frame), reduced by ROLL_FACTOR
                const angularSpeed = (distance / this.radius) * ROLL_FACTOR;

                // Set the angular velocity directly based on the current speed, don't accumulate
                this.angularVelocity = vec3(
                    axis[0] * angularSpeed,
                    axis[1] * angularSpeed,
                    0 // Assuming rolling on a flat surface
                );
            }
        } else {
            // If the ball is not moving, apply friction to the existing angular velocity
            this.angularVelocity = vec3(
                this.angularVelocity[0] * ANGULAR_FRICTION,
                this.angularVelocity[1] * ANGULAR_FRICTION,
                this.angularVelocity[2] * ANGULAR_FRICTION
            );
        }

        // Stop completely if very slow to prevent indefinite small rotations
        if (Math.sqrt(this.angularVelocity[0]**2 + this.angularVelocity[1]**2 + this.angularVelocity[2]**2) < 0.0001) {
            this.angularVelocity = vec3(0, 0, 0);
        }

        // Apply angular velocity to orientation
        const angVelLen = Math.sqrt(
            this.angularVelocity[0]*this.angularVelocity[0] +
            this.angularVelocity[1]*this.angularVelocity[1] +
            this.angularVelocity[2]*this.angularVelocity[2]
        );

        if (angVelLen > 0) {
            // Convert to degrees for rotate()
            const angle = angVelLen * 180 / Math.PI;
            const axis = vec3(
                this.angularVelocity[0]/angVelLen,
                this.angularVelocity[1]/angVelLen,
                this.angularVelocity[2]/angVelLen
            );
            this.modelOri = mult(rotate(angle, axis), this.modelOri);
        }
        
        this._modelRot = this.modelOri;
        return this.modelOri;
}
    moveForward() {
        if (this.onGround) {
            this.velocity.translation[1] = BALL_VELOCITY; // Move up
        } else {
            this.velocity.translation[1] = BALL_VELOCITY * MOVE_ON_AIR_FACTOR; // Reduce speed when in air
        }
    }
    moveBackward() {
        if (this.onGround) {
            this.velocity.translation[1] = -BALL_VELOCITY; // Move down
        } else {
            this.velocity.translation[1] = -BALL_VELOCITY * MOVE_ON_AIR_FACTOR; // Reduce speed when in air
        }
    }
    moveRight() {
        if (this.onGround) {
            this.velocity.translation[0] = BALL_VELOCITY; // Move right
        } else {
            this.velocity.translation[0] = BALL_VELOCITY * MOVE_ON_AIR_FACTOR; // Reduce speed when in air
        }
    }
    moveLeft() {
        if (this.onGround) {
            this.velocity.translation[0] = -BALL_VELOCITY; // Move left
        } else {
            this.velocity.translation[0] += -BALL_VELOCITY * MOVE_ON_AIR_FACTOR; // Reduce speed when in air
        }
    }
    Jump() {
        // Only jump if on the ground
        this.velocity.translation[2] = JUMP_FORCE;
        this.onGround = false; // Set onGround to false to allow for next jump
    }
}

export default Ball3D;
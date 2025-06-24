class Ball {
    // ====================== BALL INITIALIZATION ======================
    constructor() {
        // Shape properties
        this.radius = 20;
        this.resolution = 2;
        this.vertexPosition = [];
        this.normalVectors = [];

        // Movement properties
        this.center = vec3(70, 0, 20);
        this.theta = vec3(0, 0, 0);
        this.velocity = {
            rotation: vec3(0, 0, 0), 
            translation: vec3(0, 0, 0)
        }
        this.modelOriginal = mat4();
        this.modelOri = mat4(); // Ball's orientation matrix

        // Other properties
        this.materialProperties = {
            amb: vec4(1.0, 0.0, 0.0, 1.0),
            dif: vec4(1.0, 0.0, 0.0, 1.0),
            esp: 250
        };
        this.vao = null;

        // Physics properties
        this.mass = 1.0; // Mass of the ball
        this.acceleration = vec3(0, 0, 0); // Current acceleration
        this.force = vec3(0, 0, 0); // Current force
        this.onGround = false;
        this.jumpResquested = false;

        this.gravity = vec3(0, 0, GRAVITY); // Gravity vector (downward Z)
        this.friction = FRICTION; // Friction coefficient
        this.elasticity = BOUNCE_FACTOR; // Elasticity for bounce
        this.maxSpeed = MAX_SPEED;
        this.angularVelocity = vec3(0, 0, 0); // For rolling/rotation

        this.fillVertexAndNormalVectors();
    }
    fillVertexAndNormalVectors() {
        // Primary Sphere Generation
        let vp = [          // positive vertices
            vec3(1.0, 0.0, 0.0), 
            vec3(0.0, 1.0, 0.0), 
            vec3(0.0, 0.0, 1.0)
        ];
        let vn = [          // negative vertices
            vec3(-1.0, 0.0, 0.0), 
            vec3(0.0, -1.0, 0.0), 
            vec3(0.0, 0.0, -1.0)
        ];
        let triangles = [   // faces
            [vp[0], vp[1], vp[2]],
            [vp[0], vn[2], vp[1]],
            [vp[0], vp[2], vn[1]],
            [vp[0], vn[1], vn[2]],
            [vn[0], vp[2], vp[1]],
            [vn[0], vp[1], vn[2]],
            [vn[0], vn[1], vp[2]],
            [vn[0], vn[2], vn[1]],
        ];

        const pos = [];
        const nor = [];
        for (let i = 0; i < triangles.length; i++) {
            let a, b, c;
            [a, b, c] = triangles[i];
            this.subdivideTriangle(a, b, c, this.resolution, pos, nor);
        }
        this.vertexPosition = pos;
        this.normalVectors = nor;
    }
    subdivideTriangle(a, b, c, ndivs, pos, nor) {
        if (ndivs > 0) {
            let ab = normalize(mix(a, b, 0.5));
            let bc = normalize(mix(b, c, 0.5));
            let ca = normalize(mix(c, a, 0.5));
        
            this.subdivideTriangle(a, ab, ca, ndivs - 1, pos, nor);
            this.subdivideTriangle(b, bc, ab, ndivs - 1, pos, nor);
            this.subdivideTriangle(c, ca, bc, ndivs - 1, pos, nor);
            this.subdivideTriangle(ab, bc, ca, ndivs - 1, pos, nor);
        } else {
            this.insertTriangle(a, b, c, pos, nor);
        }
    }
    insertTriangle(a, b, c, pos, nor) {
        pos.push(vec4(...a, 1));
        pos.push(vec4(...b, 1));
        pos.push(vec4(...c, 1));
        let normal = this.getTriangleNormal(a, b, c);
        nor.push(normal);
        nor.push(normal);
        nor.push(normal);
    }
    getTriangleNormal(a, b, c) {
        let t1 = subtract(b, a);
        let t2 = subtract(c, a);
        let normal = cross(t1, t2);
        return vec3(normal);
    }
    initShaderVAO() {
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Buffer for vertex positions
        const vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertexPosition), gl.STATIC_DRAW);
        gl.vertexAttribPointer(gShader.aPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gShader.aPosition);

        // Buffer for normal vectors
        const nBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.normalVectors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(gShader.aNormal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(gShader.aNormal);

        // Unbind the VAO
        gl.bindVertexArray(null);
    }

    updatePosition(delta) {
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
        cameraBase[0] = gCamera.coordinateX;
        cameraBase[1] = gCamera.coordinateY;
        cameraBase[2] = gCamera.coordinateZ;
        
        const vel = mult(cameraBase, this.velocity.translation);
        this.center = add(this.center, mult(delta, vel));

        // GROUND
        if (this.center[2] - this.radius < 0) {
            this.center[2] = this.radius;
            // Bounce if falling downwards
            if (this.velocity.translation[2] < 0) {
                this.velocity.translation[2] = -this.velocity.translation[2] * this.elasticity; // small bounce
                // Stop very small bounces
                if (Math.abs(this.velocity.translation[2]) < 1) {
                    this.velocity.translation[2] = 0;
                }
            }
            this.onGround = true;
        } else {
            this.onGround = false;
        }
        
        // TODO: implement collision detection and response

        let model = mat4();
        model = mult(model, translate(this.center[0], this.center[1], this.center[2]));
        return model;
    }
    updateRotation(delta) {
        // Calculate the velocity vector in world coordinates
        let cameraBase = mat3();
        cameraBase[0] = gCamera.coordinateX;
        cameraBase[1] = gCamera.coordinateY;
        cameraBase[2] = gCamera.coordinateZ;
        const vel = mult(cameraBase, this.velocity.translation);

        // Compute speed and direction
        const speed = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1] + vel[2]*vel[2]);
        if (speed > 0.0001) {
            // The axis of rotation is perpendicular to the velocity and the ground (z axis)
            let axis = vec3(-vel[1], vel[0], 0); // perpendicular in XY plane
            // Normalize axis
            const axisLen = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2]);
            if (axisLen > 0.0001) {
                axis = vec3(axis[0]/axisLen, axis[1]/axisLen, axis[2]/axisLen);
                // The angle to rotate is distance/radius
                const distance = speed * delta;
                const angle = distance / this.radius * 180 / Math.PI; // degrees
                // Accumulate orientation: rotate by 'angle' around 'axis' in local coordinates
                this.modelOri = mult(rotate(angle, axis), this.modelOri);
            }
        }
        return this.modelOri;
    }
    update(delta) {
        let modelRot = this.updateRotation(delta);
        let modelTrans = this.updatePosition(delta);
        let modelScale = scale(this.radius, this.radius, this.radius);

        let model = mat4();
        model = mult(model, modelTrans);
        model = mult(model, modelRot);
        model = mult(model, modelScale);
        let modelViewInvTrans = transpose(inverse(mult(gCtx.view, model)));

        gl.bindVertexArray(this.vao);
        // Update shader uniforms
        gl.uniformMatrix4fv(gShader.uModel, false, flatten(model));
        gl.uniformMatrix4fv(gShader.uInverseTranspose, false, flatten(modelViewInvTrans));
        gl.uniform4fv(gShader.uMatAmb, this.materialProperties.amb);
        gl.uniform4fv(gShader.uMatDif, this.materialProperties.dif);
        gl.uniform1f(gShader.uAlfaEsp, this.materialProperties.esp);
        // Draw the sphere
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexPosition.length);
        gl.bindVertexArray(null);
    }
    Jump() {
        // Only jump if on the ground
        this.velocity.translation[2] = JUMP_FORCE;
        this.onGround = false; // Set onGround to false to allow for next jump
    }
}
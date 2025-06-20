class Esfera {
    // ====================== SPHERE INITIALIZATION =====================
    constructor(radius, 
                resolution, 
                materialProperties, 
                rotationSpeed,
                translationSpeed,
                centerLocation,
                isBubble, id) {
        // Shape properties
        this.radius = radius;
        this.resolution = resolution;
        this.vertexPosition = [];
        this.normalVectors = [];
        
        // Rotation properties
        this.theta = vec3(0,0,0);
        this.rotationSpeed = rotationSpeed;
        this.modelOri = mat4();
        
        // Translation properties
        this.center = centerLocation;
        this.translationSpeed = translationSpeed;

        // Other information
        this.materialProperties = materialProperties;
        this.isBubble = isBubble;
        this.vao = null;
        this.id = id;
        
        // Fill vertex and normal vectors
        this.fillVertexAndNormalVectors();

        if (id == 0) console.log(`AGULHA:`, this);
        else console.log(`BOLHA ${id}:`, this);
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

    // ========================= SPHERE UPDATES =========================
    isCollidingWithNail() {
        let nailCenter = gNail.sphere.center;
        let nailRadii = gNail.sphere.radius;
        let distance = Math.sqrt(
            Math.pow((this.center[0] - nailCenter[0]) / (this.radius[0] + nailRadii[0]), 2) +
            Math.pow((this.center[1] - nailCenter[1]) / (this.radius[1] + nailRadii[1]), 2) +
            Math.pow((this.center[2] - nailCenter[2]) / (this.radius[2] + nailRadii[2]), 2)
        );
        return distance <= 1;
    }
    updatePosition(deltaTime) {
        this.center = add(this.center, mult(deltaTime, this.translationSpeed));
        // if (this.isBubble && this.center[2] >= BOLHA_MAX_POS) 
        //     this.center[2] = BOLHA_MIN_POS;
        // if (this.isBubble && this.isCollidingWithNail()) {
        //     console.log(`Bolha ${this.id} exploiu na posição:`, this.center);
        //     this.center[0] = randomRange(BOLHA_MIN_POS, BOLHA_MAX_POS);
        //     this.center[1] = randomRange(BOLHA_MIN_POS, BOLHA_MAX_POS);
        //     this.center[2] = randomRange(BOLHA_MIN_POS, BOLHA_MAX_POS);
        //     console.log(`Nova bolha ${this.id} em:`, this.center);
        // }

        let model = mat4();
        model = mult(model, translate(this.center[0], this.center[1], this.center[2]));
        return model;
    }
    updateRotation(deltaTime) {
        this.theta = add(this.theta, mult(deltaTime, this.rotationSpeed));
        let model = mat4();
        model = mult(model, rotateX(this.theta[0]));
        model = mult(model, rotateY(this.theta[1]));
        model = mult(model, rotateZ(this.theta[2]));
        return model;
    }
    update(deltaTime) {
        let modelRot = mat4();
        if (this.isBubble)
            modelRot = this.updateRotation(deltaTime);
        else
            modelRot = this.modelOri;
        let modelTrans = this.updatePosition(deltaTime);
        let modelScale = scale(this.radius[0], this.radius[1], this.radius[2]);

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
}
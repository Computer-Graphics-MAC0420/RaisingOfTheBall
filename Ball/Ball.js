class Ball {
    // ====================== BALL INITIALIZATION ======================
    constructor() {
        // Shape properties
        this.radius = 20;
        this.resolution = 4;
        this.vertexPosition = [];
        this.normalVectors = [];

        // Movement properties
        this.center = vec3(100, 0, 0);
        this.theta = vec3(0, 0, 0);
        this.velocity = {
            rotation: vec3(0, 0, 0), 
            translation: vec3(0, 0, 0)
        }
        this.modelOriginal = mat4();

        // Other properties
        this.materialProperties = {
            amb: vec4(1.0, 0.0, 0.0, 1.0),
            dif: vec4(1.0, 0.0, 0.0, 1.0),
            esp: 250
        };
        this.vao = null;

        // Initial and Current angles
        // this.previousTheta = vec3(0.0, 0.0, 0.0);
        // this.currentTheta = initTheta;

        // Nail's coordinate system
        // this.coordinateX = vec3(1.0, 0.0, 0.0);
        // this.coordinateY = vec3(0.0, 1.0, 0.0);
        // this.coordinateZ = vec3(0.0, 0.0, -1.0);

        // TODO: physics properties

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

    // ========================= BALL UPDATES ========================
    updatePosition(delta) {
        this.center = add(this.center, mult(delta, this.velocity.translation));
        // TODO: implement collision detection and response
        let model = mat4();
        model = mult(model, translate(this.center[0], this.center[1], this.center[2]));
        return model;
    }
    updateRotation(delta) {
        // this.theta = add(this.theta, mult(delta, this.velocity.rotation));
        let model = mat4();
        // model = mult(model, rotateX(this.theta[0]));
        // model = mult(model, rotateY(this.theta[1]));
        // model = mult(model, rotateZ(this.theta[2]));
        return model;
    }
    update(delta) {
        console.log(`Ball position: ${this.center}, radius: ${this.radius}`);
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
}
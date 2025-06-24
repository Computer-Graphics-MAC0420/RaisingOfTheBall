class Ground {
    constructor() {
        this.width = 1000;
        this.depth = 1000;
        this.center = vec3(0, 0, 0);
        this.vertexPosition = [];
        this.normalVectors = [];

        // Other properties
        this.materialProperties = {
            amb: vec4(0.2, 0.5, 0.2, 1.0),
            dif: vec4(0.3, 0.8, 0.3, 1.0),
            esp: 10
        };
        this.vao = null;

        this.initBuffers();
    }

    initBuffers() {
        const gl = window.gl;

        // Define 6 vertices (2 triangles) for the ground quad on the XY plane (Z = 0)
        this.vertexPosition = [
            // First triangle
            vec4(-1 / 2, -1 / 2, 0, 1),
            vec4(1 / 2, -1 / 2, 0, 1),
            vec4(1 / 2, 1 / 2, 0, 1),
            // Second triangle
            vec4(-1 / 2, -1 / 2, 0, 1),
            vec4(1 / 2, 1 / 2, 0, 1),
            vec4(-1 / 2, 1 / 2, 0, 1)
        ];

        this.normalVectors = [
            // Normals for each vertex (all pointing +Z)
            vec3(0, 0, 1),
            vec3(0, 0, 1),
            vec3(0, 0, 1),
            vec3(0, 0, 1),
            vec3(0, 0, 1),
            vec3(0, 0, 1)
        ];
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

    update(deltaTime) {
        let model = mat4();
        model = mult(model, translate(this.center[0], this.center[1], this.center[2]));
        model = mult(model, scale(this.width, this.depth, 1)); // scale X and Y, Z=1
        let modelViewInvTrans = transpose(inverse(model));

        gl.bindVertexArray(this.vao);
        // Update shader uniforms
        gl.uniformMatrix4fv(gShader.uModel, false, flatten(model));
        gl.uniformMatrix4fv(gShader.uInverseTranspose, false, flatten(modelViewInvTrans));
        gl.uniform4fv(gShader.uMatAmb, this.materialProperties.amb);
        gl.uniform4fv(gShader.uMatDif, this.materialProperties.dif);
        gl.uniform1f(gShader.uAlfaEsp, this.materialProperties.esp);
        // Draw the ground
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexPosition.length);
        gl.bindVertexArray(null);
    }
}

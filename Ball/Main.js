"use strict";
window.onload = main;


// ========================= SCENE VARIABLES ========================
var gCtx = {
    view: null,
    perspective: null,
    luzPos: null,
    ambientColor: null,
    diffusionColor: null,
};
var gShader = {
    // shader program
    program: null,

    // vertex shader attributes and uniforms
    aPosition: null,            // vertex position attribute
    aNormal: null,              // vertex normal attribute
    uModel: null,               // model matrix
    uView: null,                // view matrix
    uPerspective: null,         // perspective matrix
    uInverseTranspose: null,    // inverse transpose matrix for normals
    uLuzPos: null,              // light position

    // fragment shader uniforms
    uLuzAmb: null,              // ambient light color
    uLuzDif: null,              // diffuse light color
    uCorEspecular: null,        // specular light color
    uMatAmb: null,              // ambient material color
    uMatDif: null,              // diffuse material color
    uAlfaEsp: null,             // specular alfa
};
var gConfig = {
    paused: false,
    pointerLocked: false,
}


// ======================== GLOBAL VARIABLES ========================
var gl;
var gCanvas;
var gObjects = [];
var gCamera;
var gBall;
var gLastTime;


// ========================== USER CONTROLS =========================
function activateControlsListeners() {
    // Pause animation
    document.addEventListener("keydown", pauseAnimation, false);

    // Pointer Lock API
    gCanvas.addEventListener("click", lockPointer);
    document.addEventListener("keydown", disableLockPointer);
    document.addEventListener("pointerlockchange", pointerLockChange);
    document.addEventListener("mozpointerlockchange", pointerLockChange);
    document.addEventListener("mousemove", onPointerMove);

    // Camera movement (WASD)
    document.addEventListener("keydown", onKeyDownMove);
    document.addEventListener("keyup", onKeyUpMove);
}


// ========================== MAIN FUNCTION =========================
function main() {
    gCanvas = document.getElementById("glcanvas");
    gl = gCanvas.getContext("webgl2");
    if (!gl) alert("Vixe! Não achei WebGL 2.0 aqui :-(");

    gBall = new Ball();
    gCamera = new Camera(
        vec3(0, 0, 500), 
        vec3(0, 0, 0), 
        vec3(0, 1, 0)
    );

    activateControlsListeners();
    // setupInputListeners();

    // Objects initialization
    const centerSphere = new Esfera(
        vec3(10,10,10),
        0,
        {   
            amb: vec4(0.2, 0.2, 0.2, 1.0), 
            dif: vec4(0.8, 0.8, 0.8, 1.0), 
            esp: 250
        },
        vec3(0, 0, 0),
        vec3(0, 0, 0),
        vec3(0.0, 0.0, 0.0),
        true, 1,
    );
    gObjects.push(centerSphere);
    // Blue
    const XSphere = new Esfera(
        vec3(10,10,10),
        0,
        {   
            amb: vec4(0.0, 1.0, 0.0, 1.0), 
            dif: vec4(0.0, 1.0, 0.0, 1.0), 
            esp: 250
        },
        vec3(0, 0, 0),
        vec3(0, 0, 0),
        vec3(20.0, 0.0, 0.0),
        true, 1,
    );
    gObjects.push(XSphere);
    // Green
    const YSphere = new Esfera(
        vec3(10,10,10),
        0,
        {   
            amb: vec4(0.0, 0.0, 1.0, 1.0), 
            dif: vec4(0.0, 0.0, 1.0, 1.0), 
            esp: 250
        },
        vec3(0, 0, 0),
        vec3(0, 0, 0),
        vec3(0.0, 20.0, 0.0),
        true, 1,
    );
    gObjects.push(YSphere);


    // Iniatilize Scene
    gl.viewport(0, 0, gCanvas.width, gCanvas.height);
    gl.clearColor(...COR_CLEAR);
    gl.enable(gl.DEPTH_TEST);
    
    initShaders();
    // renderStep(0);
    gLastTime = Date.now();
    drawAnimation();
}


// ========================= DRAW FUNCTIONS =========================
function renderStep(deltaTime) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gBall.update(deltaTime);
    gCamera.update(deltaTime);
    // Render each object
    for (let i = 0; i < gObjects.length; i++)
        gObjects[i].update(deltaTime);
}
function drawAnimation() {
    if (gConfig.paused) return;

    let now = Date.now();
    let deltaTime = (now - gLastTime) / 1000;
    gLastTime = now;
    renderStep(deltaTime);    

    window.requestAnimationFrame(drawAnimation);
}


// ======================= WEBGL CONFIGURATION ======================
function initShaders() {
    gShader.program = makeProgram(gl, gVertexShaderSrc, gFragmentShaderSrc);
    gl.useProgram(gShader.program);

    // VERTEX SHADER ATTRIBUTES AND UNIFORMS
    // Locations
    gShader.aPosition = gl.getAttribLocation(gShader.program, "aPosition");
    gShader.aNormal = gl.getAttribLocation(gShader.program, "aNormal");
    gShader.uModel = gl.getUniformLocation(gShader.program, "uModel");
    gShader.uView = gl.getUniformLocation(gShader.program, "uView");
    gShader.uPerspective = gl.getUniformLocation(gShader.program, "uPerspective");
    gShader.uInverseTranspose = gl.getUniformLocation(gShader.program, "uInverseTranspose");
    gShader.uLuzPos = gl.getUniformLocation(gShader.program, "uLuzPos");
    // Values
    gCtx.perspective = perspective(CAM.fovy, CAM.aspect, CAM.near, CAM.far);
    gCtx.luzPos = LUZ.pos;
    // Assignments
    gl.uniformMatrix4fv(gShader.uPerspective, false, flatten(gCtx.perspective));
    gl.uniformMatrix4fv(gShader.uView, false, flatten(gCtx.view)); // previoulsy set by gCamera
    gl.uniform4fv(gShader.uLuzPos, gCtx.luzPos);


    // FRAGMENT SHADER UNIFORMS
    // Locations
    gShader.uLuzAmb = gl.getUniformLocation(gShader.program, "uLuzAmb");
    gShader.uMatAmb = gl.getUniformLocation(gShader.program, "uMatAmb");
    gShader.uLuzDif = gl.getUniformLocation(gShader.program, "uLuzDif");
    gShader.uMatDif = gl.getUniformLocation(gShader.program, "uMatDif");
    gShader.uCorEspecular = gl.getUniformLocation(gShader.program, "uCorEspecular");
    gShader.uAlfaEsp = gl.getUniformLocation(gShader.program, "uAlfaEsp");
    // Values
    gCtx.ambientColor = LUZ.amb;
    gCtx.diffusionColor = LUZ.dif;
    gCtx.specularColor = LUZ.esp;
    // Assignments
    gl.uniform4fv(gShader.uLuzAmb, gCtx.ambientColor);
    gl.uniform4fv(gShader.uLuzDif, gCtx.diffusionColor);
    gl.uniform4fv(gShader.uCorEspecular, gCtx.specularColor);


    // Set material properties and attributes for each object
    gBall.initShaderVAO();
    for (let i = 0; i < gObjects.length; i++)
        gObjects[i].initShaderVAO();
}

var gVertexShaderSrc = `#version 300 es

in vec4 aPosition;
in vec3 aNormal;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uPerspective;
uniform mat4 uInverseTranspose;

uniform vec4 uLuzPos;

out vec3 vNormal;
out vec3 vLight;
out vec3 vView;

void main() {
    mat4 modelView = uView * uModel;
    gl_Position = uPerspective * modelView * aPosition;

    // orienta as normais como vistas pela câmera
    vNormal = mat3(uInverseTranspose) * aNormal;
    vec4 pos = modelView * aPosition;

    vLight = (uView * uLuzPos - pos).xyz;
    vView = -(pos.xyz);
}
`;
var gFragmentShaderSrc = `#version 300 es

precision highp float;

in vec3 vNormal;
in vec3 vLight;
in vec3 vView;
out vec4 corSaida;

// cor = produto luz * material
uniform vec4 uLuzAmb;
uniform vec4 uMatAmb;
uniform vec4 uLuzDif;
uniform vec4 uMatDif;
uniform vec4 uCorEspecular;
uniform float uAlfaEsp;

void main() {
    vec3 normalV = normalize(vNormal);
    vec3 lightV = normalize(vLight);
    vec3 viewV = normalize(vView);
    vec3 halfV = normalize(lightV + viewV);
    
    // difusao
    float kd = max(0.0, dot(normalV, lightV) );
    vec4 difusao = kd * uLuzDif * uMatDif;
    vec4 ambiente = uLuzAmb * uMatAmb;

    // especular
    float ks = pow( max(0.0, dot(normalV, halfV)), uAlfaEsp);
    
    vec4 especular = vec4(0, 0, 0, 1); // parte não iluminada
    if (kd > 0.0) { // parte iluminada
        especular = ks * uCorEspecular;
    }
    corSaida = difusao + especular + ambiente;
    corSaida.a = 1.0;
}
`;

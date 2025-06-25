import Object3D from "./object3d.js";
import Ball3D from "./ball.js";
import Shader from "./shader.js";
import AvailableShaders from "./shaders/index.js";
import Camera from "./camera.js";
import Light from "./light.js";
import Texture from "./texture.js";
import { fromObjectFile } from "./utils.js";

class Engine {
  /**
   * @private
   * @type {HTMLCanvasElement} - The canvas element used for rendering
   */
  #canvas;

  /**
   * @private
   * @type {Object.<number, Object3D>} - Dictionary of objects in the scene, indexed by unique IDs
   */
  #objects = {};

  /**
   * @private
   * @type {Object}
   */
  #ball = null;

  /**
   * @private
   * @type {Object.<string, Shader>} - Dictionary of available shaders, indexed by name
   */
  #shaders = {};

  /**
   * @private
   * @type {Shader|null} - Currently active shader
   */
  #activeShader = null;

  /**
   * @private
   * @type {number[]} - Background color in RGBA format [r, g, b, a]
   */
  #background = [0.1, 0.7, 0.8, 1.0];

  /**
   * @private
   * @type {number} - Timestamp of the last frame in milliseconds
   */
  #lastTime = 0;

  /**
   * @private
   * @type {Camera} - Camera used for rendering the scene
   */
  #camera;

  /**
   * @private
   * @type {Light} - Light source used in the scene
   */
  #light;

  /**
   * @private
   * @type {WebGLFramebuffer} - Framebuffer usado para o shadow mapping
   */
  #shadowFramebuffer = null;

  /**
   * @private
   * @type {WebGLTexture} - Textura que armazena o depth map
   */
  #shadowDepthTexture = null;

  /**
   * @private
   * @type {number} - Resolução do shadow map
   */
  #shadowMapResolution = 1024 * 8;

  /**
   * @type {function(number):void|undefined} - Callback function for update events
   * @param {number} dt - Time delta in milliseconds since the last update
   */
  onUpdate;

  #lastTimeFPS;

  get ball() {
    return this.#ball;
  }

  get camera() {
    return this.#camera;
  }

  get light() {
    return this.#light;
  }

  constructor(canvasID = "canvas") {
    this._initComponents(canvasID);
  }

  start() {
    this.#lastTime = Date.now();
    this.#lastTimeFPS = Date.now();
    this.mainLoop();
  }

  mainLoop() {
    const now = Date.now();
    const dt = now - this.#lastTime; // milliseconds
    this.#lastTime = now;

    this.update(dt);
    this.render();

    window.requestAnimationFrame(() => this.mainLoop());
  }

  update(dt) {
    if (this.fpsDisplay) {
      this.fpsDisplay.innerText = `FPS: ${this.fps}`;
    }

    if (this.onUpdate) {
      this.onUpdate(dt);
    }

    this.#ball.updatePosition(dt, this.#camera);
    this.#ball.updateRotation(dt, this.#camera);
    this.checkCollisions();
    for (const obj of Object.values(this.#objects)) {
      obj.update(dt);
    }
  }

  checkCollisions() {
    const ball = this.#ball;
    if (!ball) return;

    // Reset onGround state - it will be set to true if a ground collision is detected
    ball.onGround = false;

    for (const obj of Object.values(this.#objects)) {
      if (obj.collidable) {
        const cube = obj;
        const cubeMesh = cube.mesh;
        if (!cubeMesh || !cubeMesh.size) continue;

        // Check if the object is rotated
        const isRotated =
          cube.rotation[0] !== 0 ||
          cube.rotation[1] !== 0 ||
          cube.rotation[2] !== 0;

        let result;
        if (isRotated) {
          // Use simpler OOBB collision detection for rotated objects
          result = this.checkSphereOOBBCollisionSimple(ball, cube);
        } else {
          // Use simpler AABB collision detection for non-rotated objects
          result = this.checkSphereAABBCollision(ball, cube);
        }

        if (result.colliding) {
          // Debug log
          // console.log("Collision detected with object at position:", cube.position, "Normal:", result.normal, "Penetration:", result.penetration);

          // Correct position
          ball.center = add(
            ball.center,
            mult(result.penetration, result.normal)
          );

          // Apply bouncing behavior for all collisions
          let cameraBase = mat3();
          cameraBase[0] = this.#camera.coordinateX;
          cameraBase[1] = this.#camera.coordinateY;
          cameraBase[2] = this.#camera.coordinateZ;
          const worldVelocity = mult(cameraBase, ball.velocity.translation);

          const dotProduct = dot(worldVelocity, result.normal);

          // Only bounce if moving towards the surface
          if (dotProduct < 0) {
            const reflectionWorld = subtract(
              worldVelocity,
              mult(2 * dotProduct, result.normal)
            );

            const cameraBaseInverse = transpose(cameraBase);
            const reflectionCamera = mult(cameraBaseInverse, reflectionWorld);

            const BOUNCE_FACTOR = 0.6;
            const EPSILON = 0.001; // Small value to stop tiny bounces

            ball.velocity.translation = mult(BOUNCE_FACTOR, reflectionCamera);

            // Stop very small bounces to prevent infinite bouncing
            if (Math.abs(ball.velocity.translation[0]) < EPSILON) {
              ball.velocity.translation[0] = 0;
            }
            if (Math.abs(ball.velocity.translation[1]) < EPSILON) {
              ball.velocity.translation[1] = 0;
            }
            if (Math.abs(ball.velocity.translation[2]) < EPSILON) {
              ball.velocity.translation[2] = 0;
            }
          }

          // Check if collision is on top of the object (normal pointing up)
          if (result.normal[2] > 0.7) {
            ball.onGround = true;
          }
        }
      }
    }
  }

  /**
   * Check collision between a sphere and an Oriented Bounding Box (OOBB)
   * @param {Ball3D} ball - The ball/sphere
   * @param {Object3D} cube - The cube object with rotation
   * @returns {Object} Collision result with colliding, normal, and penetration
   */
  checkSphereOOBBCollision(ball, cube) {
    const cubeBaseSize = cube.mesh.size;
    const cubeScale = cube.scale;
    const cubePosition = cube.position;
    const cubeRotation = cube.rotation;

    // Build transformation matrices manually for better control
    const translationMatrix = translate(
      cubePosition[0],
      cubePosition[1],
      cubePosition[2]
    );
    const rotationMatrix = mult(
      mult(rotateZ(cubeRotation[2]), rotateY(cubeRotation[1])),
      rotateX(cubeRotation[0])
    );
    const scaleMatrix = scale(cubeScale[0], cubeScale[1], cubeScale[2]);

    // Combine transformations: T * R * S
    const modelMatrix = mult(
      mult(translationMatrix, rotationMatrix),
      scaleMatrix
    );

    // Get the inverse transformation matrix
    let inverseMatrix;
    try {
      inverseMatrix = inverse(modelMatrix);
    } catch (error) {
      console.warn("Matrix not invertible, falling back to AABB collision");
      return this.checkSphereAABBCollision(ball, cube);
    }

    // Transform ball center to cube's local coordinate system
    const ballCenterHomogeneous = vec4(
      ball.center[0],
      ball.center[1],
      ball.center[2],
      1.0
    );
    const localBallCenterHomo = mult(inverseMatrix, ballCenterHomogeneous);
    const localBallCenter = vec3(
      localBallCenterHomo[0],
      localBallCenterHomo[1],
      localBallCenterHomo[2]
    );

    // In local space, the cube is a unit cube scaled by the base size
    const halfSize = cubeBaseSize / 2;
    const localHalfSize = vec3(halfSize, halfSize, halfSize);

    // Find closest point on the local AABB to the local ball center
    const closestPointLocal = vec3(
      Math.max(
        -localHalfSize[0],
        Math.min(localBallCenter[0], localHalfSize[0])
      ),
      Math.max(
        -localHalfSize[1],
        Math.min(localBallCenter[1], localHalfSize[1])
      ),
      Math.max(
        -localHalfSize[2],
        Math.min(localBallCenter[2], localHalfSize[2])
      )
    );

    // Calculate distance in local space
    const distanceVecLocal = subtract(localBallCenter, closestPointLocal);
    const distanceLocal = Math.sqrt(dot(distanceVecLocal, distanceVecLocal));

    // Scale the ball radius to local space - we need to account for non-uniform scaling
    // Use the minimum scale factor to be conservative
    const minScale = Math.min(cubeScale[0], cubeScale[1], cubeScale[2]);
    const localBallRadius = ball.radius / minScale;

    if (distanceLocal < localBallRadius) {
      // Collision detected
      const penetration = localBallRadius - distanceLocal;

      // Calculate normal in local space
      let normalLocal;
      if (distanceLocal > 0.001) {
        normalLocal = normalize(distanceVecLocal);
      } else {
        // Ball center is inside the box, find the closest face
        const distToFaces = [
          localHalfSize[0] - Math.abs(localBallCenter[0]), // distance to X faces
          localHalfSize[1] - Math.abs(localBallCenter[1]), // distance to Y faces
          localHalfSize[2] - Math.abs(localBallCenter[2]), // distance to Z faces
        ];

        const minDistIndex = distToFaces.indexOf(Math.min(...distToFaces));
        normalLocal = vec3(0, 0, 0);
        normalLocal[minDistIndex] = localBallCenter[minDistIndex] > 0 ? 1 : -1;
      }

      // Transform normal back to world space using the normal matrix
      // Normal matrix is the inverse transpose of the upper-left 3x3 of the model matrix
      const rotationScaleMatrix = mult(rotationMatrix, scaleMatrix);
      let normalMatrix;
      try {
        normalMatrix = transpose(inverse(rotationScaleMatrix));
      } catch (error) {
        // Fallback: just use rotation matrix for normal transformation
        normalMatrix = transpose(rotationMatrix);
      }

      const normalWorldHomo = mult(
        normalMatrix,
        vec4(normalLocal[0], normalLocal[1], normalLocal[2], 0.0)
      );
      const normalWorld = normalize(
        vec3(normalWorldHomo[0], normalWorldHomo[1], normalWorldHomo[2])
      );

      // Scale penetration back to world space
      const worldPenetration = penetration * minScale;

      return {
        colliding: true,
        normal: normalWorld,
        penetration: worldPenetration,
      };
    }

    return {
      colliding: false,
      normal: vec3(0, 0, 0),
      penetration: 0,
    };
  }

  /**
   * Simple OOBB collision detection using SAT (Separating Axis Theorem) approach
   * More robust than the complex matrix transformation approach
   * @param {Ball3D} ball - The ball/sphere
   * @param {Object3D} cube - The cube object
   * @returns {Object} Collision result
   */
  checkSphereOOBBCollisionSimple(ball, cube) {
    const cubeBaseSize = cube.mesh.size;
    const cubeScale = cube.scale;
    const cubePosition = cube.position;
    const cubeRotation = cube.rotation;

    // Calculate half extents in local space
    const halfExtents = vec3(
      (cubeBaseSize / 2) * cubeScale[0],
      (cubeBaseSize / 2) * cubeScale[1],
      (cubeBaseSize / 2) * cubeScale[2]
    );

    // Calculate cube's local axes (oriented axes)
    const rotX = rotateX(cubeRotation[0]);
    const rotY = rotateY(cubeRotation[1]);
    const rotZ = rotateZ(cubeRotation[2]);
    const rotMatrix = mult(mult(rotZ, rotY), rotX);

    // Extract the three oriented axes from rotation matrix
    const axisX = vec3(rotMatrix[0][0], rotMatrix[1][0], rotMatrix[2][0]);
    const axisY = vec3(rotMatrix[0][1], rotMatrix[1][1], rotMatrix[2][1]);
    const axisZ = vec3(rotMatrix[0][2], rotMatrix[1][2], rotMatrix[2][2]);

    // Vector from cube center to ball center
    const ballToCube = subtract(ball.center, cubePosition);

    // Find closest point on the OBB to the sphere center
    let closestPoint = vec3(0, 0, 0);

    // Project the ball-to-cube vector onto each axis and clamp to the box extents
    const projX = dot(ballToCube, axisX);
    const projY = dot(ballToCube, axisY);
    const projZ = dot(ballToCube, axisZ);

    const clampedX = Math.max(-halfExtents[0], Math.min(projX, halfExtents[0]));
    const clampedY = Math.max(-halfExtents[1], Math.min(projY, halfExtents[1]));
    const clampedZ = Math.max(-halfExtents[2], Math.min(projZ, halfExtents[2]));

    // Construct the closest point in world space
    closestPoint = add(
      cubePosition,
      add(
        add(mult(clampedX, axisX), mult(clampedY, axisY)),
        mult(clampedZ, axisZ)
      )
    );

    // Check for collision
    const distanceVec = subtract(ball.center, closestPoint);
    const distanceSq = dot(distanceVec, distanceVec);
    const ballRadius = ball.radius;

    if (distanceSq < ballRadius * ballRadius) {
      const distance = Math.sqrt(distanceSq);
      const penetration = ballRadius - distance;

      let normal;
      if (distance > 0.001) {
        normal = normalize(distanceVec);
      } else {
        // Ball center is inside the box, find the axis with minimum penetration
        const penetrations = [
          halfExtents[0] - Math.abs(projX),
          halfExtents[1] - Math.abs(projY),
          halfExtents[2] - Math.abs(projZ),
        ];

        const minPenIndex = penetrations.indexOf(Math.min(...penetrations));
        const axes = [axisX, axisY, axisZ];
        const projections = [projX, projY, projZ];

        normal = mult(projections[minPenIndex] > 0 ? 1 : -1, axes[minPenIndex]);
      }

      return {
        colliding: true,
        normal: normal,
        penetration: penetration,
      };
    }

    return {
      colliding: false,
      normal: vec3(0, 0, 0),
      penetration: 0,
    };
  }

  /**
   * Fallback AABB collision detection for cases where OOBB fails
   * @param {Ball3D} ball - The ball/sphere
   * @param {Object3D} cube - The cube object
   * @returns {Object} Collision result
   */
  checkSphereAABBCollision(ball, cube) {
    const cubeBaseSize = cube.mesh.size;
    const cubeScale = cube.scale;
    const cubePosition = cube.position;

    const halfSize = vec3(
      (cubeBaseSize / 2) * cubeScale[0],
      (cubeBaseSize / 2) * cubeScale[1],
      (cubeBaseSize / 2) * cubeScale[2]
    );

    const cubeMin = subtract(cubePosition, halfSize);
    const cubeMax = add(cubePosition, halfSize);

    const ballCenter = ball.center;
    const ballRadius = ball.radius;

    const closestPoint = vec3(
      Math.max(cubeMin[0], Math.min(ballCenter[0], cubeMax[0])),
      Math.max(cubeMin[1], Math.min(ballCenter[1], cubeMax[1])),
      Math.max(cubeMin[2], Math.min(ballCenter[2], cubeMax[2]))
    );

    const distanceVec = subtract(ballCenter, closestPoint);
    const distanceSq = dot(distanceVec, distanceVec);

    if (distanceSq < ballRadius * ballRadius) {
      const distance = Math.sqrt(distanceSq);
      const penetration = ballRadius - distance;
      const normal = distance > 0.001 ? normalize(distanceVec) : vec3(0, 0, 1);

      return {
        colliding: true,
        normal: normal,
        penetration: penetration,
      };
    }

    return {
      colliding: false,
      normal: vec3(0, 0, 0),
      penetration: 0,
    };
  }

  render() {
    const now = Date.now();
    const dt = (now - this.#lastTimeFPS) / 1000; // seconds
    this.#lastTimeFPS = now;
    this.fps = Math.round(1 / dt);

    // Passo 1: Renderiza a cena do ponto de vista da luz (cria o shadow map)
    this._renderShadowMap();

    // Passo 2: Renderiza a cena do ponto de vista da câmera, usando o shadow map
    this._renderScene();
  }

  /**
   * Renderiza o shadow map do ponto de vista da luz
   * @private
   */
  _renderShadowMap() {
    const gl = this.gl;

    // Ativa o framebuffer do shadow map
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#shadowFramebuffer);

    // Define a viewport para a resolução do shadow map
    gl.viewport(0, 0, this.#shadowMapResolution, this.#shadowMapResolution);

    // Limpa o depth buffer
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // Ativa o shader de sombra
    this.setActiveShader("shadow");

    // Calcula a matriz de transformação do espaço da luz
    const lightProjection = this.#light.getProjectionMatrix();
    const lightView = this.#light.getViewMatrix();

    // Define as matrizes para o shader de sombra
    this.#activeShader.setUniformMatrix4fv("uView", false, flatten(lightView));
    this.#activeShader.setUniformMatrix4fv(
      "uPerspective",
      false,
      flatten(lightProjection)
    );

    // Renderiza todos os objetos para o shadow map (sem o próprio gizmo da luz)
    this._renderObjectToShadowMap(this.#ball, true);
    for (const obj of Object.values(this.#objects)) {
      this._renderObjectToShadowMap(obj);
    }

    // Restaura o framebuffer padrão
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Restaura a viewport para o tamanho da tela
    gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
  }

  /**
   * Renderiza um objeto para o shadow map
   * @private
   * @param {Object3D} obj - Objeto a ser renderizado
   */
  _renderObjectToShadowMap(obj, fromMatrix = false) {
    if (!obj.mesh) return;

    let model = mat4();
    if (fromMatrix) {
      const trans = obj.modelTrans;
      const rot = obj.modelRot;
      const scale = obj.modelScale;
      model = obj.getModelMatrixGivenMatrix(trans, rot, scale);
    } else {
      model = obj.getModelMatrix();
    }
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    // Renderiza apenas usando os vértices (não precisamos de cores, normais, etc.)
    if (obj.mesh.vertices) {
      this.#activeShader.bindVertices(obj.mesh.vertices);

      if (obj.mesh.useIndices) {
        this.#activeShader.bindIndices(obj.mesh.indices);
        this.gl.drawElements(
          this.gl.TRIANGLES,
          obj.mesh.numV,
          this.gl.UNSIGNED_SHORT,
          0
        );
      } else {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertices.length);
      }
    }
  }

  /**
   * Renderiza a cena final usando o shadow map
   * @private
   */
  _renderScene() {
    const gl = this.gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Calcula a matriz de transformação shadow
    const lightProjection = this.#light.getProjectionMatrix();
    const lightView = this.#light.getViewMatrix();
    const lightMatrix = mult(lightProjection, lightView);

    // Renderiza o gizmo da luz, se necessário
    if (this.#light.material) {
      this.setActiveShader(this.#light.shader);
      this.renderObjectWithShader(this.#light);
    }

    const objByShader = {};

    // Adiciona a bola aos objetos a serem renderizados
    if (this.#ball && this.#ball.material) {
      const ballShaderName = this.#ball.material.shader;
      if (!objByShader[ballShaderName]) {
        objByShader[ballShaderName] = [];
      }
      objByShader[ballShaderName].push({ obj: this.#ball, fromMatrix: true });
    }

    // Adiciona os outros objetos
    for (const obj of Object.values(this.#objects)) {
      if (obj.material) {
        const shaderName = obj.material.shader;
        if (!objByShader[shaderName]) {
          objByShader[shaderName] = [];
        }
        objByShader[shaderName].push({ obj: obj, fromMatrix: false });
      }
    }

    // Renderiza todos os objetos com sombra
    for (const [shaderName, objects] of Object.entries(objByShader)) {
      this.setActiveShader(shaderName);

      for (const objData of objects) {
        // Configura o shadow map para cada objeto individualmente
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE1); // Use TEXTURE1 para o shadow map
        gl.bindTexture(gl.TEXTURE_2D, this.#shadowDepthTexture);

        if (this.#activeShader.hasUniform("uShadowMap")) {
          this.#activeShader.setUniform1i("uShadowMap", 1); // TEXTURE1
        }

        if (this.#activeShader.hasUniform("uLightMatrix")) {
          this.#activeShader.setUniformMatrix4fv(
            "uLightMatrix",
            false,
            flatten(lightMatrix)
          );
        }

        this.renderObject(objData.obj, objData.fromMatrix);
      }
    }
  }

  renderObjectWithShader(obj, fromMatrix = false) {
    const gl = this.gl;
    if (!(obj instanceof Object3D)) {
      throw new Error("obj must be an instance of Object3D");
    }

    // Use o shader do material ou o shader padrão do objeto
    this.setActiveShader(obj.shader);

    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    // Vincula a luz ao shader usando o novo método bindLight
    this.#activeShader.bindLight(this.#light);

    this.bindCamera();

    if (obj.mesh) {
      this.bindMesh(obj.mesh);
    }

    // Se o objeto tiver um material, aplique-o
    if (obj.material) {
      // Aplique os uniforms adicionais do material
      obj.material.apply(this.gl, this.#activeShader);
    }

    let model = mat4();
    if (fromMatrix) {
      const trans = obj.modelTrans;
      const rot = obj.modelRot;
      const scale = obj.modelScale;
      model = obj.getModelMatrixGivenMatrix(trans, rot, scale);
    } else {
      model = obj.getModelMatrix();
    }
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    if (obj.mesh.useIndices) {
      // Renderiza usando índices
      this.gl.drawElements(
        this.gl.TRIANGLES,
        obj.mesh.numV,
        this.gl.UNSIGNED_SHORT,
        0
      );
    } else {
      // Renderiza sem usar índices
      this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertices.length);
    }
  }

  _initComponents(canvasID) {
    this.#canvas = document.getElementById(canvasID);
    this.fpsDisplay = document.getElementById("fps");

    if (!this.#canvas) {
      throw new Error("Canvas not found");
    }

    console.log("Canvas: ", this.#canvas.width, this.#canvas.height);

    const gl = this.#canvas.getContext("webgl2");
    if (!gl) {
      alert("Vixe! Não achei WebGL 2.0 aqui :-(");
      throw new Error("WebGL 2.0 not supported");
    }

    this.gl = gl;
  }

  resize(width, height) {
    this.#canvas.width = window.innerWidth;
    this.#canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.#canvas.width, this.#canvas.height);
    this.camera.setResolution(width, height);
  }

  async init(ball) {
    const gl = this.gl;

    this.#ball = ball;
    this.#camera = new Camera({ ball: ball });
    this.#light = new Light({
      showGizmo: true, //! Remove this if you don't want to show the light gizmo
    });

    this.resize(window.innerWidth, window.innerHeight);
    gl.clearColor(...this.#background);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);

    // Inicializando o framebuffer para shadow mapping
    this._initShadowFramebuffer();

    await this._initShaders();
  }

  /**
   * Inicializa o framebuffer para o shadow mapping
   * @private
   */
  _initShadowFramebuffer() {
    const gl = this.gl;
    const resolution = this.#shadowMapResolution;

    // Cria o framebuffer
    this.#shadowFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#shadowFramebuffer);

    // Cria a textura para armazenar os dados de profundidade
    this.#shadowDepthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.#shadowDepthTexture);

    // Configura a textura para armazenar o depth map
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT16, // formato de profundidade
      resolution,
      resolution,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_SHORT,
      null
    );

    // Configurações da textura
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Anexa a textura ao framebuffer como depth attachment
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.#shadowDepthTexture,
      0
    );

    // Já que só precisamos do depth buffer, desabilitamos as cores
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);

    // Verifica se o framebuffer está completo
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error("Framebuffer não está completo:", status);
    }

    // Desvincula o framebuffer para continuar com a renderização normal
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  async _initShaders() {
    for (const [name, shaderConfig] of Object.entries(AvailableShaders)) {
      this.#shaders[name] = new Shader(
        this.gl,
        await shaderConfig.vertexSrc,
        await shaderConfig.fragmentSrc
      );

      const shader = this.#shaders[name];

      // Define os atributos com base na configuração
      if (shaderConfig.attributes) {
        for (const [attrName, attrConfig] of Object.entries(
          shaderConfig.attributes
        )) {
          shader.defineAttribute(attrName, attrConfig.size);
        }
      }

      // Define os uniforms com base na configuração
      if (shaderConfig.uniforms) {
        for (const uniformName of shaderConfig.uniforms) {
          shader.defineUniform(uniformName);
        }
      }
    }

    // Define como shader ativo
    this.setActiveShader("default");
  }

  bindVertices(vertices) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindVertices(vertices);
  }

  bindNormals(normals) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindNormals(normals);
  }

  bindColors(colors) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindColors(colors);
  }

  bindIndices(indices) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindIndices(indices);
  }

  bindMesh(mesh) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.#activeShader.bindMesh(mesh);
  }

  bindCamera() {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }
    const view = this.#camera.getViewMatrix();
    const projection = this.#camera.getProjectionMatrix();

    this.#activeShader.setUniformMatrix4fv("uView", false, flatten(view));
    this.#activeShader.setUniformMatrix4fv(
      "uPerspective",
      false,
      flatten(projection)
    );
  }

  renderMesh(mesh) {
    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    this.bindMesh(mesh);

    const model = mesh.getModelMatrix();
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    if (mesh.useIndices) {
      // Renderiza usando índices
      this.gl.drawElements(
        this.gl.TRIANGLES,
        mesh.numV,
        this.gl.UNSIGNED_SHORT,
        0
      );
    } else {
      // Renderiza sem usar índices
      this.gl.drawArrays(this.gl.TRIANGLES, 0, mesh.vertices.length);
    }
  }

  renderObject(obj, fromMatrix = false) {
    const gl = this.gl;
    if (!(obj instanceof Object3D)) {
      throw new Error("obj must be an instance of Object3D");
    }

    // NÃO chama setActiveShader aqui, pois já foi chamado no loop principal
    // this.setActiveShader(obj.shader);

    if (!this.#activeShader) {
      throw new Error("No active shader");
    }

    // Vincula a luz ao shader usando o novo método bindLight
    this.#activeShader.bindLight(this.#light);

    this.bindCamera();

    if (obj.mesh) {
      this.bindMesh(obj.mesh);
    }

    // Se o objeto tiver um material, aplique-o
    if (obj.material) {
      // Aplique os uniforms adicionais do material
      obj.material.apply(this.gl, this.#activeShader);
    }

    let model = mat4();
    if (fromMatrix) {
      const trans = obj.modelTrans;
      const rot = obj.modelRot;
      const scale = obj.modelScale;
      model = obj.getModelMatrixGivenMatrix(trans, rot, scale);
    } else {
      model = obj.getModelMatrix();
    }
    this.#activeShader.setUniformMatrix4fv("uModel", false, flatten(model));

    if (obj.mesh.useIndices) {
      // Renderiza usando índices
      this.gl.drawElements(
        this.gl.TRIANGLES,
        obj.mesh.numV,
        this.gl.UNSIGNED_SHORT,
        0
      );
    } else {
      // Renderiza sem usar índices
      this.gl.drawArrays(this.gl.TRIANGLES, 0, obj.mesh.vertices.length);
    }
  }

  getUniqueID() {
    const MAX = 1000000;
    const MIN = 1;
    const id = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
    if (this.#objects[id]) {
      return this.getUniqueID();
    }

    return id;
  }

  getObject(id) {
    return this.#objects[id];
  }

  addObject(obj) {
    if (!(obj instanceof Object3D)) {
      throw new Error("obj must be an instance of Object3D");
    }
    const id = this.getUniqueID();
    this.#objects[id] = obj;

    console.log("Adding object with id: ", id);
  }

  removeObject(id) {
    delete this.#objects[id];
  }

  /**
   * Define o shader ativo
   * @param {string} shaderName - Nome do shader a ser ativado
   */
  setActiveShader(shaderName) {
    const shader = this.#shaders[shaderName];
    if (!shader) {
      throw new Error(`Shader ${shaderName} não encontrado`);
    }

    this.#activeShader = shader;
    shader.use();
  }

  /**
   * Adiciona um novo shader
   * @param {string} name - Nome do shader
   * @param {Shader} shader - Instância do shader
   */
  addShader(name, shader) {
    if (!(shader instanceof Shader)) {
      throw new Error("shader deve ser uma instância de Shader");
    }

    this.#shaders[name] = shader;
  }

  /**
   * Obtém um shader pelo nome
   * @param {string} name - Nome do shader
   * @returns {Shader} - Instância do shader ou undefined se não existir
   */
  getShader(name) {
    return this.#shaders[name];
  }
}

export default Engine;

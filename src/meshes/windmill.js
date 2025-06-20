import Mesh from "../mesh.js";

// Helper function to generate vertices, normals, colors, and indices for a cuboid
// Similar to the Cube class's internal logic but parameterized for dimensions.
function generateCuboid(xMin, xMax, yMin, yMax, zMin, zMax, colorVec) {
    const p = [ // 8 corners of the cuboid
        vec3(xMin, yMin, zMax), // 0: Front-Bottom-Left
        vec3(xMax, yMin, zMax), // 1: Front-Bottom-Right
        vec3(xMax, yMax, zMax), // 2: Front-Top-Right
        vec3(xMin, yMax, zMax), // 3: Front-Top-Left
        vec3(xMin, yMin, zMin), // 4: Back-Bottom-Left
        vec3(xMax, yMin, zMin), // 5: Back-Bottom-Right
        vec3(xMax, yMax, zMin), // 6: Back-Top-Right
        vec3(xMin, yMax, zMin)  // 7: Back-Top-Left
    ];

    const cuboidVertices = [];
    const cuboidNormals = [];
    const cuboidColors = [];
    const cuboidIndices = [];

    const addQuad = (p_a, p_b, p_c, p_d, normalVec) => { // Pass actual points
        const baseIndex = cuboidVertices.length;
        cuboidVertices.push(p_a, p_b, p_c, p_d);
        cuboidNormals.push(normalVec, normalVec, normalVec, normalVec);
        cuboidColors.push(colorVec, colorVec, colorVec, colorVec);
        // Standard quad indices (two triangles)
        cuboidIndices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        cuboidIndices.push(baseIndex, baseIndex + 2, baseIndex + 3);
    };
    
    // Faces (ensure CCW order when looking from outside for correct normals)
    addQuad(p[0], p[1], p[2], p[3], vec3(0, 0, 1));   // Front (+Z)
    addQuad(p[5], p[4], p[7], p[6], vec3(0, 0, -1));  // Back (-Z)
    addQuad(p[3], p[2], p[6], p[7], vec3(0, 1, 0));   // Top (+Y)
    addQuad(p[4], p[5], p[1], p[0], vec3(0, -1, 0));  // Bottom (-Y)
    addQuad(p[1], p[5], p[6], p[2], vec3(1, 0, 0));   // Right (+X)
    addQuad(p[0], p[4], p[7], p[3], vec3(-1, 0, 0));  // Left (-X) (Corrected from p[4],p[0],p[3],p[7])


    return { vertices: cuboidVertices, normals: cuboidNormals, colors: cuboidColors, indices: cuboidIndices };
}


class WindmillBaseMesh extends Mesh {
  constructor({
    size = 1.0,
    towerHeightFactor = 2.0,
    towerWidthFactor = 0.3,
    towerDepthFactor = 0.3,
    hubSizeFactor = 0.15,
    towerColor = vec4(0.6, 0.4, 0.2, 1.0),
    hubColor = vec4(0.4, 0.3, 0.2, 1.0)
  }) {
    const totalVertices = [];
    const totalNormals = [];
    const totalColors = [];
    const totalIndices = [];
    let currentIndexOffset = 0;

    const towerHeight = size * towerHeightFactor;
    const towerWidth = size * towerWidthFactor;
    const towerDepth = size * towerDepthFactor;
    const hubSize = size * hubSizeFactor;

    // --- Tower --- (centered at origin of this mesh)
    const towerHalfH = towerHeight / 2;
    const towerHalfW = towerWidth / 2;
    const towerHalfD = towerDepth / 2;
    const towerData = generateCuboid(
      -towerHalfW, towerHalfW,
      -towerHalfH, towerHalfH, // Tower base at -towerHalfH, top at towerHalfH
      -towerHalfD, towerHalfD,
      towerColor
    );
    totalVertices.push(...towerData.vertices);
    totalNormals.push(...towerData.normals);
    totalColors.push(...towerData.colors);
    towerData.indices.forEach(i => totalIndices.push(i + currentIndexOffset));
    currentIndexOffset += towerData.vertices.length;

    // --- Hub ---
    // Positioned at the front-top of the tower, relative to this mesh's origin
    const hubX = 0; 
    const hubY = towerHalfH; 
    const hubZ = towerHalfD + hubSize / 2; 

    const hubHalfSize = hubSize / 2;
    const hubLocalData = generateCuboid( 
        -hubHalfSize, hubHalfSize,
        -hubHalfSize, hubHalfSize,
        -hubHalfSize, hubHalfSize,
        hubColor
    );
    
    const hubTranslationMatrix = translate(hubX, hubY, hubZ);
    const transformedHubVertices = hubLocalData.vertices.map(v => {
        const v4 = vec4(v[0], v[1], v[2], 1.0);
        const tv4 = mult(hubTranslationMatrix, v4);
        return vec3(tv4[0], tv4[1], tv4[2]);
    });

    totalVertices.push(...transformedHubVertices);
    totalNormals.push(...hubLocalData.normals); 
    totalColors.push(...hubLocalData.colors);
    hubLocalData.indices.forEach(i => totalIndices.push(i + currentIndexOffset));
    currentIndexOffset += hubLocalData.vertices.length;
    
    super({
      vertices: totalVertices,
      normals: totalNormals,
      colors: totalColors,
      indices: totalIndices,
    });

    // Store the attachment point for blades (center of the hub, relative to this WindmillBaseMesh origin)
    // Moved after super() call
    this.bladesAttachmentPoint = vec3(hubX, hubY, hubZ);
  }
}

class WindmillBladesMesh extends Mesh {
  constructor({
    size = 1.0, 
    bladeLengthFactor = 1.5,
    bladeWidthFactor = 0.2,
    bladeThicknessFactor = 0.05,
    numBlades = 4,
    bladeColor = vec4(0.8, 0.7, 0.6, 1.0)
  }) {
    const totalVertices = [];
    const totalNormals = [];
    const totalColors = [];
    const totalIndices = [];
    let currentIndexOffset = 0;

    const bladeLength = size * bladeLengthFactor;
    const bladeWidth = size * bladeWidthFactor;
    const bladeThickness = size * bladeThicknessFactor;
    
    const bladeRotationAxisOffset = bladeLength / 2; 

    for (let i = 0; i < numBlades; i++) {
      const angleDegrees = (i / numBlades) * 360;

      const bladeHalfL = bladeLength / 2;
      const bladeHalfW = bladeWidth / 2;
      const bladeHalfT = bladeThickness / 2;

      const singleBladeLocalData = generateCuboid(
        -bladeHalfW, bladeHalfW,      
        -bladeHalfL, bladeHalfL,      
        -bladeHalfT, bladeHalfT,      
        bladeColor
      );

      const initialTranslationMatrix = translate(0, bladeRotationAxisOffset, 0); 
      const rotationMatrix = rotateZ(angleDegrees); 
      
      const transformMatrix = mult(rotationMatrix, initialTranslationMatrix);
      const normalTransformMatrix = rotationMatrix; 

      const transformedBladeVertices = singleBladeLocalData.vertices.map(v => {
        const v4 = vec4(v[0], v[1], v[2], 1.0);
        const tv4 = mult(transformMatrix, v4);
        return vec3(tv4[0], tv4[1], tv4[2]);
      });

      const transformedBladeNormals = singleBladeLocalData.normals.map(n => {
        const n4 = vec4(n[0], n[1], n[2], 0.0);
        const tn4 = mult(normalTransformMatrix, n4);
        return normalize(vec3(tn4[0], tn4[1], tn4[2]));
      });

      totalVertices.push(...transformedBladeVertices);
      totalNormals.push(...transformedBladeNormals);
      totalColors.push(...singleBladeLocalData.colors);
      singleBladeLocalData.indices.forEach(j => totalIndices.push(j + currentIndexOffset));
      currentIndexOffset += singleBladeLocalData.vertices.length;
    }

    super({
      vertices: totalVertices,
      normals: totalNormals,
      colors: totalColors,
      indices: totalIndices,
    });
  }
}

class Windmill {
  constructor({
    size = 1.0,
    towerHeightFactor = 2.0,
    towerWidthFactor = 0.3,
    towerDepthFactor = 0.3,
    hubSizeFactor = 0.15,
    bladeLengthFactor = 1.5,
    bladeWidthFactor = 0.2,
    bladeThicknessFactor = 0.05,
    numBlades = 4,
    towerColor = vec4(0.6, 0.4, 0.2, 1.0),
    hubColor = vec4(0.4, 0.3, 0.2, 1.0),
    bladeColor = vec4(0.8, 0.7, 0.6, 1.0),
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = [1, 1, 1]
  }) {
    // Create the windmill base (tower + hub)
    this.base = new WindmillBaseMesh({
      size,
      towerHeightFactor,
      towerWidthFactor,
      towerDepthFactor,
      hubSizeFactor,
      towerColor,
      hubColor
    });

    // Create the windmill blades
    this.blades = new WindmillBladesMesh({
      size,
      bladeLengthFactor,
      bladeWidthFactor,
      bladeThicknessFactor,
      numBlades,
      bladeColor
    });

    // Set initial transforms
    this.setPosition(position);
    this.setRotation(rotation);
    this.setScale(scale);

    // Blade rotation for animation
    this.bladeRotation = 0;
    this.bladeRotationSpeed = 1.0; // degrees per update
  }

  // Position methods
  setPosition(position) {
    this.base.setTranslation(position);
    
    // Position blades at the hub attachment point
    const basePos = this.base.getTranslation();
    const hubOffset = this.base.bladesAttachmentPoint;
    const bladesPosition = [
      basePos[0] + hubOffset[0],
      basePos[1] + hubOffset[1], 
      basePos[2] + hubOffset[2]
    ];
    this.blades.setTranslation(bladesPosition);
  }

  getPosition() {
    return this.base.getTranslation();
  }

  // Rotation methods
  setRotation(rotation) {
    this.base.setRotation(rotation);
    // Blades maintain their own rotation plus the blade spin
    this.updateBladeRotation();
  }

  getRotation() {
    return this.base.getRotation();
  }

  // Scale methods
  setScale(scale) {
    this.base.setScale(scale);
    this.blades.setScale(scale);
  }

  getScale() {
    return this.base.getScale();
  }

  // Blade animation methods
  setBladeRotationSpeed(speed) {
    this.bladeRotationSpeed = speed;
  }

  getBladeRotationSpeed() {
    return this.bladeRotationSpeed;
  }

  // Update blade rotation for animation
  updateBladeRotation() {
    const baseRotation = this.base.getRotation();
    const bladesRotation = [
      baseRotation[0],
      baseRotation[1], 
      baseRotation[2] + this.bladeRotation
    ];
    this.blades.setRotation(bladesRotation);
  }

  // Animate the windmill blades
  animate(deltaTime = 1.0) {
    this.bladeRotation += this.bladeRotationSpeed * deltaTime;
    this.bladeRotation %= 360; // Keep rotation in 0-360 range
    this.updateBladeRotation();
  }

  // Get both meshes for rendering
  getMeshes() {
    return [this.base, this.blades];
  }

  // Get individual components
  getBase() {
    return this.base;
  }

  getBlades() {
    return this.blades;
  }
}

export { WindmillBaseMesh, WindmillBladesMesh, Windmill };

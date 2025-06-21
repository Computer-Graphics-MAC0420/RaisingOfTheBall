import Mesh from "../../mesh.js";
import Box from "../primitives/Box.js";
import { getModelMatrix } from "../../utils.js";

class Seesaw extends Mesh {
  constructor({ 
    plankLength = 4,
    plankWidth = 0.3,
    plankHeight = 0.1,
    baseWidth = 0.4,
    baseHeight = 1.2,
    baseDepth = 0.4,
    plankColor = vec4(0.7, 0.5, 0.3, 1),    // Wood brown
    baseColor = vec4(0.4, 0.3, 0.2, 1),     // Darker brown
    maxTiltAngle = 25,                       // Maximum tilt in degrees
    tiltPeriod = 5.0                         // Time for full tilt cycle
  }) {
    // Create seesaw geometry
    const seesawData = Seesaw.createSeesawGeometry({
      plankLength, plankWidth, plankHeight,
      baseWidth, baseHeight, baseDepth,
      plankColor, baseColor
    });

    // Call parent constructor with seesaw geometry
    super({ 
      vertices: seesawData.vertices, 
      colors: seesawData.colors, 
      indices: seesawData.indices, 
      normals: seesawData.normals 
    });

    // Store seesaw-specific properties
    this.plankLength = plankLength;
    this.plankWidth = plankWidth;
    this.plankHeight = plankHeight;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    this.baseDepth = baseDepth;
    this.plankColor = plankColor;
    this.baseColor = baseColor;
    
    // Seesaw physics properties
    this.maxTiltAngle = maxTiltAngle;
    this.tiltPeriod = tiltPeriod;
    this.currentTiltAngle = 0;
    this.time = 0;
    
    // Store original plank vertices for rotation
    this.originalPlankVertices = seesawData.plankVertices;
    this.plankStartIndex = seesawData.plankStartIndex;
  }

  // Update seesaw physics
  update(dt) {
    this.time += dt;
    
    // Simple harmonic motion for tilting
    this.currentTiltAngle = this.maxTiltAngle * Math.sin((2 * Math.PI * this.time) / this.tiltPeriod);
    
    // Update plank vertices with rotation
    this.updatePlankRotation();
  }

  // Rotate plank vertices around the pivot point
  updatePlankRotation() {
    const angleRad = this.currentTiltAngle * Math.PI / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    
    // Pivot point is at the center of the plank, top of the base
    const pivotY = this.baseHeight / 2;
    
    // Update plank vertices
    for (let i = 0; i < this.originalPlankVertices.length; i++) {
      const originalVertex = this.originalPlankVertices[i];
      
      // Translate to pivot point, rotate, then translate back
      const relativeY = originalVertex[1] - pivotY;
      const relativeZ = originalVertex[2];
      
      // Rotate around X-axis (tilt)
      const newY = relativeY * cosA - relativeZ * sinA;
      const newZ = relativeY * sinA + relativeZ * cosA;
      
      // Update the vertex in the mesh
      this.vertices[this.plankStartIndex + i] = vec3(
        originalVertex[0],
        newY + pivotY,
        newZ
      );
    }
  }

  // Override getModelMatrix to ensure proper transformation
  getModelMatrix() {
    return super.getModelMatrix();
  }

  // Static method to create seesaw geometry
  static createSeesawGeometry({ 
    plankLength, plankWidth, plankHeight,
    baseWidth, baseHeight, baseDepth,
    plankColor, baseColor 
  }) {
    // Combined geometry arrays
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];

    // Helper function to add geometry to arrays
    const addGeometryToArrays = (geometry, targetArrays, offsetX = 0, offsetY = 0, offsetZ = 0) => {
      const startIndex = targetArrays.vertices.length;
      
      // Add vertices with offset
      geometry.vertices.forEach(vertex => {
        targetArrays.vertices.push(vec3(
          vertex[0] + offsetX,
          vertex[1] + offsetY, 
          vertex[2] + offsetZ
        ));
      });
      
      // Add normals, colors, and indices
      targetArrays.normals.push(...geometry.normals);
      targetArrays.colors.push(...geometry.colors);
      geometry.indices.forEach(index => {
        targetArrays.indices.push(index + startIndex);
      });
      
      return startIndex;
    };

    // Create base (vertical support) using Box primitive
    const base = new Box({
      size: 1,
      color: baseColor
    });
    
    // Scale the base: thin width, tall height, moderate depth
    const baseVertices = base.vertices.map(v => vec3(
      v[0] * baseWidth,     // Width
      v[1] * baseHeight,    // Height
      v[2] * baseDepth      // Depth
    ));
    
    base.vertices.splice(0, base.vertices.length, ...baseVertices);

    // Create plank (horizontal board) using Box primitive
    const plank = new Box({
      size: 1,
      color: plankColor
    });
    
    // Scale the plank: long length, moderate width, thin height
    const plankVertices = plank.vertices.map(v => vec3(
      v[0] * plankLength,   // Length
      v[1] * plankHeight,   // Height (thin)
      v[2] * plankWidth     // Width
    ));
    
    // Position plank on top of the base
    const positionedPlankVertices = plankVertices.map(v => vec3(
      v[0],                           // X stays the same (centered)
      v[1] + baseHeight / 2,          // Y: on top of base
      v[2]                            // Z stays the same (centered)
    ));
    
    plank.vertices.splice(0, plank.vertices.length, ...positionedPlankVertices);

    // Combine geometries
    const geometryArrays = { 
      vertices: vertices, 
      normals: normals, 
      colors: colors, 
      indices: indices 
    };

    // Add base geometry
    addGeometryToArrays(base, geometryArrays, 0, 0, 0);
    
    // Add plank geometry and store its start index
    const plankStartIndex = addGeometryToArrays(plank, geometryArrays, 0, 0, 0);

    return {
      vertices: vertices,
      normals: normals,
      colors: colors,
      indices: indices,
      plankVertices: positionedPlankVertices,  // Store original plank vertices
      plankStartIndex: plankStartIndex         // Store where plank vertices start
    };
  }
}

export default Seesaw;

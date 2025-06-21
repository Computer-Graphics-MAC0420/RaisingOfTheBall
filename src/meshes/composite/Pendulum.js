import Mesh from "../../mesh.js";
import Box from "../primitives/Box.js";
import Sphere from "../primitives/Sphere.js";
import { getModelMatrix } from "../../utils.js";

class Pendulum extends Mesh {
  constructor({ 
    armLength = 2,
    armWidth = 0.1,
    sphereRadius = 0.3,
    armColor = vec4(0.6, 0.4, 0.2, 1),
    sphereColor = vec4(0.8, 0.3, 0.3, 1),
    maxAngle = 45,     // Maximum swing angle in degrees
    period = 3.0       // Time for full swing cycle in seconds
  }) {
    // Create pendulum geometry
    const pendulumData = Pendulum.createPendulumGeometry({
      armLength, armWidth, sphereRadius, armColor, sphereColor
    });

    // Call parent constructor with pendulum geometry
    super({ 
      vertices: pendulumData.vertices, 
      colors: pendulumData.colors, 
      indices: pendulumData.indices, 
      normals: pendulumData.normals 
    });

    // Store pendulum-specific properties
    this.armLength = armLength;
    this.armWidth = armWidth;
    this.sphereRadius = sphereRadius;
    this.armColor = armColor;
    this.sphereColor = sphereColor;
    
    // Pendulum physics properties
    this.maxAngle = maxAngle;           // Maximum swing angle
    this.period = period;               // Period of oscillation
    this.currentAngle = 0;              // Current pendulum angle
    this.time = 0;                      // Internal time tracker
  }

  // Static method to create pendulum geometry
  static createPendulumGeometry({ armLength, armWidth, sphereRadius, armColor, sphereColor }) {
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
    };

    // Create pendulum arm using Box primitive
    const arm = new Box({
      size: 1,
      color: armColor
    });
    
    // Scale the arm: thin and long, positioned so it hangs down from origin
    const armVertices = arm.vertices.map(v => vec3(
      v[0] * armWidth,      // Thin width
      v[1] * armLength,     // Long length
      v[2] * armWidth       // Thin depth
    ));
    
    // Position arm so it hangs down from the pivot point (origin)
    const positionedArmVertices = armVertices.map(v => vec3(
      v[0],                    // X stays the same
      v[1] - armLength / 2,    // Move down so top is at origin
      v[2]                     // Z stays the same
    ));
    
    arm.vertices.splice(0, arm.vertices.length, ...positionedArmVertices);

    // Create sphere at the tip using Sphere primitive
    const sphere = new Sphere({
      radius: sphereRadius,
      color: sphereColor
    });

    // Position sphere at the bottom of the arm
    const sphereOffset = {
      x: 0,
      y: -armLength,  // At the bottom of the arm
      z: 0
    };

    // Combine geometries
    const geometryArrays = { 
      vertices: vertices, 
      normals: normals, 
      colors: colors, 
      indices: indices 
    };

    // Add arm geometry (already positioned)
    addGeometryToArrays(arm, geometryArrays, 0, 0, 0);
    
    // Add sphere geometry at the tip
    addGeometryToArrays(sphere, geometryArrays, 
      sphereOffset.x, sphereOffset.y, sphereOffset.z);

    return {
      vertices: vertices,
      normals: normals,
      colors: colors,
      indices: indices
    };
  }

  // Update pendulum physics
  update(dt) {
    this.time += dt;
    
    // Simple harmonic motion: angle = maxAngle * sin(2π * time / period)
    this.currentAngle = this.maxAngle * Math.sin((2 * Math.PI * this.time) / this.period);
  }

  // Override getModelMatrix to apply pendulum motion
  getModelMatrix() {
    const parentMatrix = super.getModelMatrix();
    
    // Create rotation matrix for pendulum swing (around Z-axis)
    const swingRotMatrix = getModelMatrix(
      vec3(0, 0, 0),                    // No translation
      vec3(0, 0, this.currentAngle),    // Z-axis rotation for swing
      vec3(1, 1, 1)                     // No scaling
    );
    
    // Combine: parent transform * swing rotation
    return mult(parentMatrix, swingRotMatrix);
  }
}

export default Pendulum;

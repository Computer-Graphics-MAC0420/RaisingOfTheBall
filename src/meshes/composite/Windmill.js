import Mesh from "../../mesh.js";
import Box from "../primitives/Box.js";

class Windmill extends Mesh {
  constructor({ 
    size = 1,
    bladeWidth = 0.2, 
    bladeLength = 2, 
    color = vec4(0.8, 0.6, 0.4, 1)
  }) {
    // Create blade geometry only
    const bladesData = Windmill.createBladeGeometry({
      size, bladeWidth, bladeLength, color
    });

    // Call parent constructor with blade geometry
    super({ 
      vertices: bladesData.vertices, 
      colors: bladesData.colors, 
      indices: bladesData.indices, 
      normals: bladesData.normals 
    });

    // Store windmill-specific properties
    this.size = size;
    this.bladeWidth = bladeWidth;
    this.bladeLength = bladeLength;
    this.color = color;
  }

  // Static method to create blade geometry
  static createBladeGeometry({ size, bladeWidth, bladeLength, color }) {
    // Blades geometry  
    const bladeVertices = [];
    const bladeNormals = [];
    const bladeColors = [];
    const bladeIndices = [];

    // Helper function to add a box's geometry to arrays
    const addBoxToArrays = (box, targetArrays, offsetX = 0, offsetY = 0, offsetZ = 0) => {
      const startIndex = targetArrays.vertices.length;
      
      // Add vertices with offset
      box.vertices.forEach(vertex => {
        targetArrays.vertices.push(vec3(
          vertex[0] + offsetX,
          vertex[1] + offsetY, 
          vertex[2] + offsetZ
        ));
      });
      
      // Add normals, colors, and indices
      targetArrays.normals.push(...box.normals);
      targetArrays.colors.push(...box.colors);
      box.indices.forEach(index => {
        targetArrays.indices.push(index + startIndex);
      });
    };

    // Create horizontal blade using Box primitive (centered)
    const horizontalBlade = new Box({
      size: 1,
      color: color
    });
    
    // Scale and center the horizontal blade
    const hBladeVertices = horizontalBlade.vertices.map(v => vec3(
      v[0] * bladeLength * size,  // Length along X-axis
      v[1] * bladeWidth * size,   // Width along Y-axis  
      v[2] * bladeWidth * size    // Depth along Z-axis
    ));
    horizontalBlade.vertices.splice(0, horizontalBlade.vertices.length, ...hBladeVertices);

    // Create vertical blade using Box primitive (centered)
    const verticalBlade = new Box({
      size: 1,
      color: color
    });
    
    // Scale and center the vertical blade
    const vBladeVertices = verticalBlade.vertices.map(v => vec3(
      v[0] * bladeWidth * size,   // Width along X-axis
      v[1] * bladeLength * size,  // Length along Y-axis
      v[2] * bladeWidth * size    // Depth along Z-axis
    ));
    verticalBlade.vertices.splice(0, verticalBlade.vertices.length, ...vBladeVertices);

    // Add blades to blade arrays (both already centered at origin)
    const bladeArrays = { 
      vertices: bladeVertices, 
      normals: bladeNormals, 
      colors: bladeColors, 
      indices: bladeIndices 
    };
    addBoxToArrays(horizontalBlade, bladeArrays, 0, 0, 0);
    addBoxToArrays(verticalBlade, bladeArrays, 0, 0, 0);

    return {
      vertices: bladeVertices,
      normals: bladeNormals,
      colors: bladeColors,
      indices: bladeIndices
    };
  }
}

export default Windmill;

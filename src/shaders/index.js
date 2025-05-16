import defaultVertexShaderSrc from "./vertex.glsl?raw";
import defaultFragmentShaderSrc from "./fragment.glsl?raw";
import normalFragmentShaderSrc from "./fragment.normal.glsl?raw";
import lightFragmentShaderSrc from "./fragment.light.glsl?raw";
import textureVertexShaderSrc from "./vertex.texture.glsl?raw";
import textureFragmentShaderSrc from "./fragment.texture.glsl?raw";
import textureLightVertexShaderSrc from "./vertex.texture.light.glsl?raw";
import textureLightFragmentShaderSrc from "./fragment.texture.light.glsl?raw";

export const DEFAULT_SHADER = "default";

export default {
  default: {
    vertexSrc: defaultVertexShaderSrc,
    fragmentSrc: defaultFragmentShaderSrc,
    attributes: {
      aPosition: { size: 3 },
      aNormal: { size: 3 },
      aColor: { size: 4 },
    },
    uniforms: ["uView", "uModel", "uPerspective", "uLightPos"],
  },
  normal: {
    vertexSrc: defaultVertexShaderSrc,
    fragmentSrc: normalFragmentShaderSrc,
    attributes: {
      aPosition: { size: 3 },
      aNormal: { size: 3 },
      aColor: { size: 4 },
    },
    uniforms: ["uView", "uModel", "uPerspective", "uLightPos"],
  },
  light: {
    vertexSrc: defaultVertexShaderSrc,
    fragmentSrc: lightFragmentShaderSrc,
    attributes: {
      aPosition: { size: 3 },
      aNormal: { size: 3 },
      aColor: { size: 4 },
    },
    uniforms: ["uView", "uModel", "uPerspective", "uLightPos"],
  },
  texture: {
    vertexSrc: textureVertexShaderSrc,
    fragmentSrc: textureFragmentShaderSrc,
    attributes: {
      aPosition: { size: 3 },
      aTexCoord: { size: 2 },
    },
    uniforms: ["uView", "uModel", "uPerspective", "uTexture"],
  },
  textureLight: {
    vertexSrc: textureLightVertexShaderSrc,
    fragmentSrc: textureLightFragmentShaderSrc,
    attributes: {
      aPosition: { size: 3 },
      aNormal: { size: 3 },
      aTexCoord: { size: 2 },
    },
    uniforms: ["uView", "uModel", "uPerspective", "uLightPos", "uTexture"],
  },
};

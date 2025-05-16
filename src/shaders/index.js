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
  },
  normal: {
    vertexSrc: defaultVertexShaderSrc,
    fragmentSrc: normalFragmentShaderSrc,
  },
  light: {
    vertexSrc: defaultVertexShaderSrc,
    fragmentSrc: lightFragmentShaderSrc,
  },
  texture: {
    vertexSrc: textureVertexShaderSrc,
    fragmentSrc: textureFragmentShaderSrc,
  },
  textureLight: {
    vertexSrc: textureLightVertexShaderSrc,
    fragmentSrc: textureLightFragmentShaderSrc,
  },
};

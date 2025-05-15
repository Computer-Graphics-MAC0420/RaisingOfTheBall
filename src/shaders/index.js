import defaultVertexShaderSrc from "./vertex.glsl?raw";
import defaultFragmentShaderSrc from "./fragment.glsl?raw";
import normalFragmentShaderSrc from "./fragment.normal.glsl?raw";

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
};

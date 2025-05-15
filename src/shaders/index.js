import defaultVertexShaderSrc from "./vertex.glsl?raw";
import defaultFragmentShaderSrc from "./fragment.glsl?raw";
import redFragmentShaderSrc from "./fragment.red.glsl?raw";

export const DEFAULT_SHADER = "default";

export default {
  default: {
    vertexSrc: defaultVertexShaderSrc,
    fragmentSrc: defaultFragmentShaderSrc,
  },
  red: {
    vertexSrc: defaultVertexShaderSrc,
    fragmentSrc: redFragmentShaderSrc,
  },
};

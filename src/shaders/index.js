import Shader from "../shader";
import defaultVertexShaderSrc from "./shaders/vertex.glsl?raw";
import defaultFragmentShaderSrc from "./shaders/fragment.glsl?raw";
import redFragmentShaderSrc from "./shaders/fragment.red.glsl?raw";

export default {
  default: {
    vertexSrc: defaultFragmentShaderSrc,
    fragmentSrc: defaultVertexShaderSrc,
  },
  red: {
    vertexSrc: defaultFragmentShaderSrc,
    fragmentSrc: redFragmentShaderSrc,
  },
};

// import defaultVertexShaderSrc from "./vertex.glsl?raw";
// import defaultFragmentShaderSrc from "./fragment.glsl?raw";
// import normalFragmentShaderSrc from "./fragment.normal.glsl?raw";
// import lightFragmentShaderSrc from "./fragment.light.glsl?raw";

export const DEFAULT_SHADER = "default";

const loadFile = async (filename) => fetch(filename).then((response) => response.text());

async function loadShaders() {
  const defaultVertexShaderSrc = await loadFile("./src/shaders/vertex.glsl");
  const defaultFragmentShaderSrc = await loadFile("./src/shaders/fragment.glsl");
  const normalFragmentShaderSrc = await loadFile("./src/shaders/fragment.normal.glsl");
  const lightFragmentShaderSrc = await loadFile("./src/shaders/fragment.light.glsl");

  return {
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
  };
}

export default loadShaders;

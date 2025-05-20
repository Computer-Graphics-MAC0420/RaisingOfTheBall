import defaultVertexShaderSrc from "./default.vs?raw";
import fixedFragmentShaderSrc from "./fixed-color.fs?raw";
import normalFragmentShaderSrc from "./normal.fs?raw";
import texturedVertexShaderSrc from "./textured.vs?raw";
import texturedFragmentShaderSrc from "./textured.fs?raw";
import solidFragmentShaderSrc from "./solid.fs?raw";
import shadowVertexShaderSrc from "./shadow.vs?raw";
import shadowFragmentShaderSrc from "./shadow.fs?raw";

export const DEFAULT_SHADER = "default";

const solid = {
  vertexSrc: defaultVertexShaderSrc,
  fragmentSrc: solidFragmentShaderSrc,
  attributes: {
    aPosition: { size: 3 },
    aNormal: { size: 3 },
    aColor: { size: 4 },
  },
  uniforms: [
    "uView",
    "uModel",
    "uPerspective",
    "uLightPos",
    "uLightColor",
    "uSolidColor",
    "uShininess",
    "uAmbientFactor",
    "uDiffuseFactor",
    "uSpecularFactor",
    "uLightMatrix",
    "uShadowMap",
  ],
};

const fixed = {
  vertexSrc: defaultVertexShaderSrc,
  fragmentSrc: fixedFragmentShaderSrc,
  attributes: {
    aPosition: { size: 3 },
    aNormal: { size: 3 },
  },
  uniforms: ["uView", "uModel", "uPerspective", "uColor"],
};

const normal = {
  vertexSrc: defaultVertexShaderSrc,
  fragmentSrc: normalFragmentShaderSrc,
  attributes: {
    aPosition: { size: 3 },
    aNormal: { size: 3 },
    aColor: { size: 4 },
  },
  uniforms: ["uView", "uModel", "uPerspective", "uLightPos"],
};

const textured = {
  vertexSrc: texturedVertexShaderSrc,
  fragmentSrc: texturedFragmentShaderSrc,
  attributes: {
    aPosition: { size: 3 },
    aNormal: { size: 3 },
    aTexCoord: { size: 2 },
  },
  uniforms: [
    "uView",
    "uModel",
    "uPerspective",
    "uLightPos",
    "uTexture",
    "uLightColor",
    "uShininess",
    "uAmbientFactor",
    "uDiffuseFactor",
    "uSpecularFactor",
    "uLightMatrix",
    "uShadowMap",
  ],
};

const shadow = {
  vertexSrc: shadowVertexShaderSrc,
  fragmentSrc: shadowFragmentShaderSrc,
  attributes: {
    aPosition: { size: 3 },
  },
  uniforms: ["uView", "uModel", "uPerspective", "uLightMatrix"],
};

export default {
  default: solid,
  solid,
  fixed,
  normal,
  textured,
  shadow,
};

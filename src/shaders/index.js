export const DEFAULT_SHADER = "default";

async function loadShader(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load shader from ${url}: ${response.statusText}`
    );
  }
  return response.text();
}

const solid = {
  vertexSrc: loadShader("/src/shaders/default.vs"),
  fragmentSrc: loadShader("/src/shaders/solid.fs"),
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
  vertexSrc: loadShader("/src/shaders/default.vs"),
  fragmentSrc: loadShader("/src/shaders/fixed-color.fs"),
  attributes: {
    aPosition: { size: 3 },
    aNormal: { size: 3 },
  },
  uniforms: ["uView", "uModel", "uPerspective", "uColor"],
};

const normal = {
  vertexSrc: loadShader("/src/shaders/default.vs"),
  fragmentSrc: loadShader("/src/shaders/normal.fs"),
  attributes: {
    aPosition: { size: 3 },
    aNormal: { size: 3 },
    aColor: { size: 4 },
  },
  uniforms: ["uView", "uModel", "uPerspective", "uLightPos"],
};

const textured = {
  vertexSrc: loadShader("/src/shaders/textured.vs"),
  fragmentSrc: loadShader("/src/shaders/textured.fs"),
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
  vertexSrc: loadShader("/src/shaders/shadow.vs"),
  fragmentSrc: loadShader("/src/shaders/shadow.fs"),
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

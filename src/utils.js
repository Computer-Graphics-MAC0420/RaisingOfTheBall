export function getModelMatrix(translation, rotation, scale) {
  const rotX = rotateX(rotation[0]);
  const rotY = rotateY(rotation[1]);
  const rotZ = rotateZ(rotation[2]);

  const scaleM = mat4(
    scale[0],
    0,
    0,
    0,
    0,
    scale[1],
    0,
    0,
    0,
    0,
    scale[2],
    0,
    0,
    0,
    0,
    1
  );

  const trans = translate(...translation);

  const model = mult(trans, mult(rotZ, mult(rotY, mult(rotX, scaleM))));
  return model;
}

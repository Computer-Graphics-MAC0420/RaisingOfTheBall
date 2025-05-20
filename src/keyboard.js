const keyState = {};

window.addEventListener("keydown", (event) => {
  keyState[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (event) => {
  keyState[event.key.toLowerCase()] = false;
});

export function isKeyPressed(key) {
  return keyState[key.toLowerCase()] === true;
}

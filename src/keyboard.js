const keyState = {};

window.addEventListener("keydown", (event) => {
  keyState[event.key] = true;
});

window.addEventListener("keyup", (event) => {
  keyState[event.key] = false;
});

export function isKeyPressed(key) {
  return keyState[key] === true;
}

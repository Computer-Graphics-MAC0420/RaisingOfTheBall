import Engine from "./engine";
import "./style.css";

const engine = new Engine();
engine.init().then(() => {
  console.log("Engine initialized");
  engine.start();
});

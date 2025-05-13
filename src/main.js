import { Engine } from "./engine";
import "./style.css";

const engine = new Engine();
engine.init().then(() => {
  alert("Engine initialized");
  // Add any additional setup or rendering logic here
});

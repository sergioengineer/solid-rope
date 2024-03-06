import { Engine2D } from "../Engine";
import { EngineThreadMethods } from "./EngineThreadMethods";

const engine: Engine2D | undefined = new Engine2D();
onmessage = (message: MessageEvent<string>) => {
  const [method, ...params] = message.data;
};

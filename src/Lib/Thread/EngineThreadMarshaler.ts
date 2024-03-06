import { EngineThreadMethods } from "./EngineThreadMethods";

export class EngineThreadMarshaler {
  private worker: Worker;
  constructor() {
    const worker = new window.Worker(
      new URL("./EngineThread", import.meta.url),
      {
        type: "module",
      }
    );

    this.worker = worker;
  }

  execute = <T extends keyof EngineThreadMethods>(
    method: T,
    ...params: Parameters<EngineThreadMethods[T]>
  ) => {
    this.worker.postMessage([method, ...params]);
  };
}

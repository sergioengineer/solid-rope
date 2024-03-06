import { For, type Component, createSignal, onMount } from "solid-js";

import styles from "./App.module.css";
import { BodyNode } from "./Components/BodyNode/BodyNode";
import { RigidBody2D } from "./Lib/RigidBody2D";
import { Pikachu } from "./Components/BodyNode/Pikachu";
import { Engine2D } from "./Lib/Engine";
import { SpringJoint } from "./Lib/Joints/SpringJoint";
import { CircleCollider2D } from "./Lib/Colliders/CircleCollider2D";
import {
  BarController,
  CategoryScale,
  Chart,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  BarElement,
  Tooltip,
  Legend,
  Colors,
} from "chart.js";
import { EngineThreadMarshaler } from "./Lib/Thread/EngineThreadMarshaler";

const App: Component = () => {
  let panel: HTMLDivElement | undefined;
  let el: any;
  let chart: any;
  const [points, setPoints] = createSignal<RigidBody2D[]>([]);

  const wk = new EngineThreadMarshaler();

  const engine = new Engine2D();
  const spring = new SpringJoint({
    body1: new RigidBody2D({
      position: {
        x: 0,
        y: 0,
      },
    }),
    body2: new RigidBody2D({
      position: { x: 0, y: 200 },
    }),
  });

  engine.wind_force = 0;
  engine.addBodies(...points());
  engine.start();

  window.addEventListener("resize", () => {
    engine.min_x = -window.innerWidth / 2;
    engine.max_x = window.innerWidth / 2;
    engine.min_y = window.innerHeight / 2;
  });
  engine.min_x = -window.innerWidth / 2;
  engine.max_x = window.innerWidth / 2;
  engine.min_y = window.innerHeight / 2;

  onMount(() => {
    Chart.register(
      LineController,
      CategoryScale,
      PointElement,
      LineElement,
      LinearScale,
      BarController,
      BarElement,
      Title,
      Tooltip,
      Legend,
      Colors
    );

    const ctx = el as HTMLCanvasElement;
    if (!ctx) {
      console.log(ctx);
      return;
    }
    chart = new Chart(ctx.getContext("2d")!, {
      data: {
        labels: [],
        datasets: [
          {
            type: "line",
            label: "N. OBJs",
            data: [],
            borderWidth: 1,
            backgroundColor: "#0FF",
            yAxisID: "n_objs",
          },
          {
            type: "bar",
            label: "FPS",
            data: [],
            borderWidth: 1,
            backgroundColor: "#27272a",
            yAxisID: "fps",
          },
        ],
      },
      options: {
        scales: {
          n_objs: {
            position: "left",
            beginAtZero: true,
          },
          fps: {
            position: "right",
          },
        },
      },
    });
  });

  window.setInterval(() => {
    if (!chart) return;

    const max_elements = 40;
    const data = [...chart.data.datasets[1].data, engine.fps];
    const dataSliced = data.slice(
      data.length - max_elements >= 0 ? data.length - max_elements : 0,
      data.length
    );
    chart.data.datasets[1].data = dataSliced;
    chart.data.labels = Array.from({ length: max_elements }, () => "");

    const dataObj = [...chart.data.datasets[0].data, engine.getBodies().length];
    const dataObjSliced = dataObj.slice(
      dataObj.length - max_elements >= 0 ? dataObj.length - max_elements : 0,
      dataObj.length
    );
    chart.data.datasets[0].data = dataObjSliced;
    chart.update();
  }, 250);

  const mouse_position = { x: 0, y: 0 };
  window.addEventListener("mousemove", (ev) => {
    mouse_position.x = ev.x - window.innerWidth / 2;
    mouse_position.y = ev.y - window.innerHeight / 2;
  });

  window.addEventListener("keydown", (ev) => {
    if (ev.code.toLowerCase() === "enter") {
      engine.isRunning() ? engine.stop() : engine.start();
      return;
    }
    if (ev.key.toLowerCase() === "a") {
      const pts = points();

      for (let i = 0; i < 1; i++) {
        const radius = 8 + Math.random() * 16;
        const body = new RigidBody2D({
          position: { x: mouse_position.x, y: mouse_position.y },
          collider: new CircleCollider2D({
            radius: radius,
          }),
          mass: radius,
        });
        pts.push(body);
        engine.addBody(body);
      }
      setPoints([...pts]);
    }

    if (ev.code.toLowerCase() === "space") {
      const pts = points();

      pts.forEach((x, i) => {
        x.addForce({
          y: Math.random() * 9550,
          x: Math.random() * 150 * (i % 2 ? -1 : 1),
        });
      });
    }
  });

  return (
    <div class={styles.panel} ref={panel}>
      <div class={styles.analytics} id="myChart">
        <div>
          <canvas ref={el}></canvas>
        </div>
      </div>
      <div class={styles.allowed_area}></div>
      <For each={points()}>{(point) => <BodyNode body={point} />}</For>
      {/* <Pikachu body={spring.body1} /> */}
      {/* <Pikachu body={spring.body2} /> */}
    </div>
  );
};

export default App;

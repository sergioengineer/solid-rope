import { createEffect, createSignal, onMount } from "solid-js";
import styles from "./BodyNode.module.css";
import { RigidBody2D } from "../../Lib/RigidBody2D";

interface Props {
  body: RigidBody2D;
}

export const Pikachu = (props: Props) => {
  const [text, setText] = createSignal(
    props.body.y_acceleration.toFixed(2) + " m/s"
  );

  const [color, setColor] = createSignal("#00FF00");

  const [coord, setCoord] = createSignal({
    x: props.body.position.x,
    y: props.body.position.y,
  });

  let el: HTMLDivElement | undefined;

  onMount(() => {
    props.body.subscribe((event, args) => {
      if (event !== "position_changed") return;

      if (args.body?.collider?.collision_happened) setColor("#FF00FF");
      else setColor("#00FF00");

      setCoord({
        x: args.body.position.x,
        y: args.body.position.y,
      });
    });
  });

  createEffect(() => {
    if (el) {
      el.style.setProperty(
        "--diameter",
        (props.body.collider?.radius ?? 1) * 2 + "px"
      );
    }
  });

  return (
    <div
      ref={el}
      class={styles.node}
      style={{
        left: `calc(50% + ${coord().x}px)`,
        top: `calc(50% + ${coord().y}px)`,
        background: `${color()}`,
      }}
    >
      <img
        src="https://assets.pokemon.com/assets/cms2/img/pokedex/detail/025.png"
        height={80}
      ></img>
    </div>
  );
};

function getRandomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16);
}

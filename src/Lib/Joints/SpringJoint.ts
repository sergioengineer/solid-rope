import { RigidBody2D } from "../RigidBody2D";
import {
  Force,
  getDifference,
  getDistance,
  PropertiesOnly,
  Unit,
} from "../general";

export class SpringJoint {
  body1 = new RigidBody2D();
  body2 = new RigidBody2D();
  spring_constant: number = Unit.newtons_per_meter(80);
  length: number = Unit.meters(50);
  equilibrium_length: number = Unit.meters(50);
  max_length: number = Unit.meters(80);

  updatePhys(dt: number) {
    const nodes_distance_in_meters = getDistance(
      this.body1.position,
      this.body2.position
    );
    this.length = nodes_distance_in_meters;

    const compression = this.equilibrium_length - this.length;
    const tension = compression * -1 * this.spring_constant;
    const pos = getDifference(this.body1.position, this.body2.position);
    const angle = Math.atan2(pos.y, pos.x);
    const one_node_is_static =
      this.body1.type === "static" || this.body2.type === "static";

    const x_component =
      Math.cos(angle) * tension * (one_node_is_static ? 1 : 1 / 2);
    const y_component =
      Math.sin(angle) * tension * (one_node_is_static ? 1 : 1 / 2);

    this.body1.addForce({
      x:
        this.body1.position.x < this.body2.position.y
          ? -x_component
          : x_component,
      y:
        this.body1.position.y < this.body2.position.y
          ? -y_component
          : y_component,
    });

    this.body2.addForce({
      x:
        this.body2.position.x < this.body1.position.y
          ? -x_component
          : x_component,
      y:
        this.body2.position.y < this.body1.position.y
          ? -y_component
          : y_component,
    });

    this.body1.updatePhys(dt);
    this.body2.updatePhys(dt);
  }

  addForce(force: Force) {}

  constructor(initializer?: {
    [key in keyof PropertiesOnly<SpringJoint>]: PropertiesOnly<SpringJoint>[key];
  }) {
    if (!initializer) return;

    for (const key in initializer) {
      (this as any)[key] = (initializer as any)[key];
    }
  }
}

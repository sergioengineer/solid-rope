import { registerGraph } from "solid-js/types/reactive/signal";
import { RigidBody2D } from "../RigidBody2D";
import {
  Unit,
  getDifference,
  getDistance,
  getRadiansAngle,
  mapPositionsToOrign,
} from "../general";

export class CircleCollider2D {
  public body: RigidBody2D = new RigidBody2D();
  public radius: number = Unit.unit(4);
  public collision_happened: boolean = false;

  getCollision(collider: CircleCollider2D) {
    const difference = getDifference(
      this.body.position,
      collider.body.position
    );

    const square_distance =
      difference.x * difference.x + difference.y * difference.y;

    const radius_sum = this.radius + collider.radius;
    const collision = {
      has_collided: square_distance < radius_sum * radius_sum,
      square_distance,
      other_collider: collider,
      this_collider: this,
    };

    this.collision_happened = collision.has_collided;
    collider.collision_happened = this.collision_happened;

    return collision;
  }

  resolveCollision(collision: ReturnType<CircleCollider2D["getCollision"]>) {
    const response_coefficient = 1;
    const difference = getDifference(
      this.body.position,
      collision.other_collider.body.position
    );

    const distance = Math.sqrt(collision.square_distance);

    difference.x = difference.x / distance;
    difference.y = difference.y / distance;
    const radius_sum = this.radius + collision.other_collider.radius;
    const delta = 0.5 * response_coefficient * (distance - radius_sum);

    const mass_ratio1 =
      this.body.mass / (this.body.mass + collision.other_collider.body.mass);
    const mass_ratio2 =
      collision.other_collider.body.mass /
      (this.body.mass + collision.other_collider.body.mass);

    this.body.position.x -= difference.x * (mass_ratio2 * delta);
    this.body.position.y -= difference.y * (mass_ratio2 * delta);

    collision.other_collider.body.position.x +=
      difference.x * (mass_ratio1 * delta);
    collision.other_collider.body.position.y +=
      difference.y * (mass_ratio1 * delta);
  }

  constructor(
    initializer: { body?: RigidBody2D; radius?: number } | undefined
  ) {
    if (!initializer) return;
    this.radius = initializer.radius ?? this.radius;
  }
}

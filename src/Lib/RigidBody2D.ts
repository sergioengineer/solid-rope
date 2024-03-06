import { CircleCollider2D } from "./Colliders/CircleCollider2D"
import {
  ChadPhysicsHaver,
  Force,
  PhysicsType,
  Position,
  PropertiesOnly,
  Unit,
  getResultingForce,
} from "./general"

export type RigidBody2DEvent = "position_changed"
export type RigidBody2DSubscriber = (
  event: RigidBody2DEvent,
  args: { body: RigidBody2DPublic }
) => unknown

type RigidBody2DPublic = Omit<RigidBody2D, "updatePhys">
type RigidBody2DConstructorProperties = PropertiesOnly<RigidBody2D>

export class RigidBody2D implements ChadPhysicsHaver {
  public readonly id = crypto.randomUUID()
  private forces: Force[] = []
  private readonly observers: RigidBody2DSubscriber[] = []

  public collider?: CircleCollider2D
  public position: Position = {
    x: 0,
    y: 0,
  }
  public mass: number = Unit.grams(50)
  public y_acceleration: number = Unit.meters_per_second(0)
  public x_acceleration: number = Unit.meters_per_second(0)
  public units_per_meter = 1
  public type: PhysicsType = "dynamic"

  public last_position: Position = {
    x: 0,
    y: 0,
  }

  constructor(initializer?: {
    [key in keyof RigidBody2DConstructorProperties]: RigidBody2DConstructorProperties[key]
  }) {
    if (!initializer) return
    if (initializer.collider) {
      this.collider = initializer.collider
      this.collider.body = this
    }

    for (const key in initializer) {
      if (key === "initializeCollider") continue
      ;(this as any)[key] = (initializer as any)[key]
    }

    if (initializer.position) {
      this.last_position = { ...initializer.position }
    }
  }

  public subscribe(subscriber: RigidBody2DSubscriber) {
    this.observers.push(subscriber)
  }

  public getForces() {
    return this.forces
  }

  public addForce(force: Force) {
    this.forces.push(force)
  }

  public updatePhys(delta_time: number) {
    if (this.type === "static") {
      this.forces = []
      return
    }

    const y_travel_distance = this.position.y - this.last_position.y
    const x_travel_distance = this.position.x - this.last_position.x

    const resulting_force = getResultingForce(this.forces)
    this.forces = []
    this.y_acceleration = (resulting_force.y / this.mass) * 240
    this.x_acceleration = (resulting_force.x / this.mass) * 240

    this.last_position = {
      ...this.position,
    }
    const squared_delta_time = delta_time * delta_time

    this.position = {
      y:
        this.position.y +
        y_travel_distance +
        this.y_acceleration * squared_delta_time,
      x:
        this.position.x +
        x_travel_distance +
        this.x_acceleration * squared_delta_time,
    }

    this.x_acceleration = 0
    this.y_acceleration = 0

    this.notify("position_changed")
  }

  public unitsToMeter(units: number) {
    return Unit.meters(units / this.units_per_meter)
  }

  public metersToUnit(meters: number) {
    return Unit.meters(meters * 100)
  }

  public getMetersPosition() {
    return {
      x: this.unitsToMeter(this.position.x),
      y: this.unitsToMeter(this.position.y),
    }
  }

  public getUnitsPosition() {
    return {
      ...this.position,
    }
  }

  private notify(event: RigidBody2DEvent) {
    this.observers.forEach((subscriber) =>
      subscriber(event, {
        body: this,
      })
    )
  }
}

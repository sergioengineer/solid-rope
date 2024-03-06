import { CircleCollider2D } from "./Colliders/CircleCollider2D"
import { RigidBody2D } from "./RigidBody2D"
import { ChadPhysicsHaver, getDistance, getRadiansAngle } from "./general"

export class Engine2D {
  private last_execution_time = performance.now()
  private is_running = false
  public wind_force: number = -2
  public gravitational_accelaration = 9.8
  public fps: number = 9
  private bodies: ChadPhysicsHaver[] = []
  private colliders: CircleCollider2D[] = []
  public min_x: number = Number.NEGATIVE_INFINITY
  public max_x: number = Number.POSITIVE_INFINITY
  public min_y: number = Number.POSITIVE_INFINITY

  constructor() {
    window.requestAnimationFrame(this.render)
  }

  microRender(delta_time: number) {
    this.bodies?.forEach((x) => {
      if (x instanceof RigidBody2D)
        x.addForce({
          x: this.wind_force,
          y: x.mass * this.gravitational_accelaration,
        })
    })

    this.bodies.forEach((x) => {
      let collision_happened = false
      let steps = 0
      do {
        collision_happened = false
        for (const otherBody of this.bodies) {
          if (otherBody === x) continue
          if (!(x instanceof RigidBody2D)) continue
          if (!(otherBody instanceof RigidBody2D)) continue
          if (!x.collider) continue
          if (!otherBody.collider) continue

          const collision = x.collider.getCollision(otherBody.collider)

          if (collision.has_collided) {
            x.collider.resolveCollision(collision)
            collision_happened = true
          }
        }
      } while (collision_happened && ++steps < 0)
    })

    this.bodies?.forEach((x) => {
      if (x instanceof RigidBody2D) this.constrain(x, "circle")
    })

    this.bodies.forEach((x) => {
      x.updatePhys(delta_time)
    })
  }

  render = (now: number) => {
    if (!this.is_running) return

    const elapsed_miliseconds = now - this.last_execution_time
    const dt = elapsed_miliseconds * 0.001
    this.last_execution_time = now

    this.fps = 1 / dt

    const steps = 1
    const step = dt / steps
    for (let i = 0; i < steps; i++) this.microRender(step)

    window.requestAnimationFrame(this.render)
  }

  constrain(obj: RigidBody2D, type: "circle" | "square") {
    const radius = obj.collider?.radius ?? 8

    if (type === "square") {
      if (obj.position.y > this.min_y - radius)
        obj.position.y = this.min_y - radius
      if (obj.position.x <= this.min_x + radius)
        obj.position.x = this.min_x + radius
      if (obj.position.x >= this.max_x - radius)
        obj.position.x = this.max_x - radius

      return
    }

    const distance = Math.sqrt(
      obj.position.x * obj.position.x + obj.position.y * obj.position.y
    )
    const angle = Math.atan2(obj.position.y, obj.position.x)

    if (distance > 280 - radius) {
      const difference = distance - (280 - radius)
      const x_displacement = Math.cos(angle) * difference
      const y_displacement = Math.sin(angle) * difference

      obj.position = {
        x: obj.position.x - x_displacement,
        y: obj.position.y - y_displacement,
      }
    }
  }

  addBody(body: ChadPhysicsHaver) {
    this.bodies.push(body)
    if (body instanceof RigidBody2D && body.collider)
      this.colliders.push(body.collider)
  }

  addBodies(...bodies: ChadPhysicsHaver[]) {
    bodies.forEach((x) => this.addBody(x))
  }

  start() {
    this.last_execution_time = performance.now()
    this.is_running = true
  }

  stop() {
    this.is_running = false
  }

  getBodies() {
    return this.bodies
  }

  isRunning() {
    return this.is_running
  }
}

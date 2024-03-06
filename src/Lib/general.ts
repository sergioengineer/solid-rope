export interface Position {
  x: number
  y: number
}

export type Force = {
  x: number
  y: number
}

export type PropertiesOnly<T> = T extends Record<string, any>
  ? {
      [key in keyof T as T[key] extends Function ? never : key]?: T[key]
    }
  : never

export interface ChadPhysicsHaver {
  updatePhys: (delta_time: number) => unknown
  addForce: (force: Force) => unknown
}

export type PhysicsType = "static" | "dynamic"

export type VirginPhysicsNOTHaver = {
  Update: (delta_time: number) => unknown
}

export const getResultingForce = (forces: Force[]) => {
  return forces.reduce(
    (prev, curr) => {
      prev.x += curr.x
      prev.y += curr.y
      return prev
    },
    { x: 0, y: 0 }
  )
}

export const mapPositionsToOrign = (pos: Position, pos2: Position) => {
  const position =
    pos.x > pos2.x
      ? {
          x: pos.x - pos2.x,
          y: pos.y - pos2.y,
        }
      : {
          x: pos2.x - pos.x,
          y: pos2.y - pos.y,
        }

  return position
}

export const Unit = Object.freeze({
  meters: Number,
  meters_per_second: Number,
  newtons: Number,
  newtons_per_second: Number,
  newtons_per_meter: Number,
  kilograms: Number,
  grams: Number,
  unit: Number,
})

export const getDistance = (pos: Position, pos2: Position) => {
  const position = mapPositionsToOrign(pos, pos2)

  return Math.sqrt(position.x * position.x + position.y * position.y)
}

export const getDifference = (pos: Position, pos2: Position) => {
  return {
    x: pos.x - pos2.x,
    y: pos.y - pos2.y,
  }
}

export const getRadiansAngle = (pos: Position, pos2: Position) => {
  const position_mapped = mapPositionsToOrign(pos, pos2)
  return Math.atan2(position_mapped.y, position_mapped.x)
}

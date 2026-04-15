import { isObjectType, prop } from "remeda"

export const hasOwn = <T extends object>(
  obj: T,
  key: PropertyKey,
): key is keyof T => Object.prototype.hasOwnProperty.call(obj, key)

export function propPath(obj: object, path: string): object | undefined {
  const keys = path.split(".")
  if (keys.length === 0) return obj

  const result = keys.reduce<unknown>(
    (acc, key) =>
      isObjectType(acc) ? prop(acc as Record<string, unknown>, key) : undefined,
    obj,
  )

  return isObjectType(result) ? result : undefined
}

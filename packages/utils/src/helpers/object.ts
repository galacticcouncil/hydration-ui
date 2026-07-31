import { isObjectType, isPlainObject, prop, values } from "remeda"

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

export function findNested<T>(
  obj: Record<string, unknown>,
  key: string,
): T | undefined {
  if (key in obj) {
    return obj[key] as T
  }

  for (const value of values(obj)) {
    if (isPlainObject(value)) {
      const result = findNested<T>(value as Record<string, unknown>, key)
      if (result !== undefined) return result
    }
  }

  return undefined
}

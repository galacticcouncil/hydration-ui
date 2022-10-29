import { UseFormReturn } from "react-hook-form"

export const noop = () => {}
export const undefinedNoop = () => undefined

export type Maybe<T> = T | null | undefined
export type FormValues<T> = T extends UseFormReturn<infer Values>
  ? Values
  : never

export function isRecord<Key extends string, Value>(
  x: unknown,
): x is Record<Key, Value> {
  return typeof x === "object" && x != null && !Array.isArray(x)
}

export function keys<O extends object>(o: O) {
  return Object.keys(o) as (keyof O)[]
}

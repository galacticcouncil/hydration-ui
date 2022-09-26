import type { UseFormReturn } from "react-hook-form"

export type Maybe<T> = T | null | undefined

export type FormValues<T> = T extends UseFormReturn<infer Values>
  ? Values
  : never

export function isRecord<Key extends string, Value>(
  x: unknown,
): x is Record<Key, Value> {
  return typeof x === "object" && x != null && !Array.isArray(x)
}

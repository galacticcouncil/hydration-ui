export const isBigInt = (value: unknown): value is bigint =>
  value instanceof BigInt || typeof value === "bigint"

export type KeyOfType<T, V> = keyof {
  [P in keyof T as T[P] extends V ? P : never]: P
} &
  keyof T

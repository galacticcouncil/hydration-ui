import type { UseFormReturn } from "react-hook-form"

export type Maybe<T> = T | null | undefined

export type FormValues<T> = T extends UseFormReturn<infer Values>
  ? Values
  : never

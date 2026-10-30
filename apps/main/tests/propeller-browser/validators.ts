import { z, refine } from "zod/v4"
import Big from "big.js"
export const required = z.string().min(1)
export const positive = z.string().refine((v) => !!v && Big(v).gt(0))
export const validateFieldMaxBalance = (max) =>
  refine((value) => Big(value).lte(max))

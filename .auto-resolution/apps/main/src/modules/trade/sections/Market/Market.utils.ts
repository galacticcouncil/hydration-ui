import { z } from "zod"

import { required } from "@/utils/validators"

export const useMarketValidation = () => {
  return z.object({
    sell: required,
    buy: required,
  })
}

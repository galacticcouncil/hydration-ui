import { z } from "zod/v4"
import { createJSONStorage } from "zustand/middleware"

export const createZustandStorage = <TSchema extends z.ZodSchema>(
  version: number,
  stateSchema: TSchema,
  defaultState: z.infer<TSchema>,
) => {
  const versionedStateSchema = z.object({
    version: z.number(),
    state: stateSchema,
  })

  return createJSONStorage(() => ({
    getItem: async (name) => {
      const data = window.localStorage.getItem(name)

      if (data) {
        try {
          const parsedData = JSON.parse(data)
          const validatedData = versionedStateSchema.safeParse(parsedData)

          if (validatedData.success && validatedData.data.version === version) {
            return JSON.stringify(validatedData.data)
          }
        } catch (err) {
          console.error(err)
        }
      }

      return JSON.stringify({
        state: defaultState,
        version,
      })
    },
    setItem(name, value) {
      window.localStorage.setItem(name, value)
    },
    removeItem(name) {
      window.localStorage.removeItem(name)
    },
  }))
}

import { z } from "zod/v4"
import {
  createJSONStorage,
  type PersistOptions,
  type PersistStorage,
} from "zustand/middleware"

type ZustandStorageConfig<TSchema extends z.ZodSchema> = {
  name: string
  version: number
  schema: TSchema
  defaultState: z.infer<TSchema>
  migrate?: (
    persistedState: unknown,
    version: number,
  ) => z.infer<TSchema> | Promise<z.infer<TSchema>>
}

export const createZustandStorage = <TSchema extends z.ZodSchema>(
  config: ZustandStorageConfig<TSchema>,
): Pick<
  PersistOptions<z.infer<TSchema>>,
  "name" | "version" | "storage" | "migrate"
> => {
  const { name, version, schema, defaultState, migrate } = config

  const versionedStateSchema = z.object({
    version: z.literal(version),
    state: schema,
  })

  const storage = createJSONStorage(() => ({
    getItem: async (key) => {
      const data = window.localStorage.getItem(key)

      if (data) {
        try {
          const parsedData = JSON.parse(data)
          const validatedData = versionedStateSchema.safeParse(parsedData)

          if (validatedData.success) {
            return JSON.stringify(validatedData.data)
          }

          return data
        } catch (err) {
          console.error(err)
        }
      }

      return JSON.stringify({
        state: defaultState,
        version: 0,
      })
    },
    setItem(key, value) {
      window.localStorage.setItem(key, value)
    },
    removeItem(key) {
      window.localStorage.removeItem(key)
    },
  }))

  return {
    name,
    version,
    storage: storage as PersistStorage<z.infer<TSchema>>,
    migrate,
  }
}

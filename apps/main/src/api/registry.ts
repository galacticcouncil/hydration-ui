import { ApiPromise } from "@polkadot/api"
import { queryOptions } from "@tanstack/react-query"
import z from "zod"

import { TProviderContext } from "@/providers/rpcProvider"

const errorStateSchema = z.object({
  kind: z.string(),
  error: z.string(),
  index: z.number(),
})

export const registryErrorQuery = (
  { apiRegistry, isApiLoaded }: TProviderContext,
  errorState: unknown,
) => {
  const parsedErrorState = errorStateSchema.safeParse(errorState)

  return queryOptions({
    queryKey: [
      "registry",
      "error",
      parsedErrorState.data?.kind,
      parsedErrorState.data?.index,
      parsedErrorState.data?.error,
    ],
    enabled: isApiLoaded && parsedErrorState.success,
    queryFn: async () => {
      if (!parsedErrorState.success) {
        return null
      }

      const moduleError = apiRegistry.createType("DispatchError", {
        [parsedErrorState.data.kind]: {
          index: parsedErrorState.data.index,
          error: parsedErrorState.data.error,
        },
      })

      if (!moduleError.isModule) {
        throw new Error("Not a module error")
      }

      return apiRegistry.findMetaError(moduleError.asModule)
    },
    staleTime: Infinity,
  })
}
export type ApiRegistryError = ReturnType<
  ApiPromise["registry"]["findMetaError"]
>

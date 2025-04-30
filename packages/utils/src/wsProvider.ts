import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { ApiPromise, WsProvider } from "@polkadot/api"

export async function reconnectProvider(provider: WsProvider) {
  if (provider?.isConnected) return
  await provider.connect()
  await new Promise((resolve) => {
    if (provider.isConnected) {
      resolve(provider)
    } else {
      provider.on("connected", () => {
        resolve(provider)
      })
    }
  })
}

export async function changeProvider(prevUrl: string, nextUrl: string) {
  if (prevUrl === nextUrl) return
  const apiPool = SubstrateApis.getInstance()
  const prevApi = await apiPool.api(prevUrl)

  if (prevApi && prevApi.isConnected) {
    await prevApi.disconnect()
  }

  const nextApi = await apiPool.api(nextUrl)

  if (nextApi && !nextApi.isConnected) {
    await reconnectProvider(getProviderInstance(nextApi))
  }
}

export function getProviderInstance(api: ApiPromise) {
  //@ts-expect-error protected property
  const options = api?._options
  return options?.provider as WsProvider
}

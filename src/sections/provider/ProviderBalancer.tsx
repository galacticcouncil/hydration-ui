import { PROVIDER_URLS, useProviderRpcUrlStore } from "api/provider"
import { AppLoader } from "components/AppLoader/AppLoader"
import { useShallow } from "hooks/useShallow"
import { PropsWithChildren, useEffect } from "react"
import { pingRpc } from "utils/rpc"
import { pick } from "utils/rx"

async function pingAllAndSort() {
  const timings = await Promise.all(
    PROVIDER_URLS.map(async (url) => {
      const time = await pingRpc(url)
      return { url, time }
    }),
  )

  const sortedRpcList = timings.sort((a, b) => a.time - b.time)

  const fastestRpc = sortedRpcList[0]
  console.log("RPC timings", timings)
  console.log(
    "Connecting to the fastest RPC:",
    fastestRpc.url,
    `${fastestRpc.time} ms`,
  )

  useProviderRpcUrlStore
    .getState()
    .setRpcUrlList(sortedRpcList.map((rpc) => rpc.url))
}

export const ProviderBalancer: React.FC<PropsWithChildren> = ({ children }) => {
  const { rpcUrlList } = useProviderRpcUrlStore(
    useShallow((state) => pick(state, ["rpcUrlList"])),
  )

  const shouldPing = rpcUrlList.length === 0

  useEffect(() => {
    if (shouldPing) {
      pingAllAndSort()
    }
  }, [shouldPing])
  return shouldPing ? <AppLoader /> : children
}

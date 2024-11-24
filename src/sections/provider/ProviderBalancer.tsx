import { PROVIDER_URLS, useProviderRpcUrlStore } from "api/provider"
import { AppLoader } from "components/AppLoader/AppLoader"
import { useShallow } from "hooks/useShallow"
import { PropsWithChildren, useEffect } from "react"
import { identity } from "utils/helpers"
import { pingRpc } from "utils/rpc"
import { pick, uniqBy } from "utils/rx"

async function pingAllAndSort() {
  const fastestRpc = await Promise.race(
    PROVIDER_URLS.map(async (url) => {
      const time = await pingRpc(url)
      return { url, time }
    }),
  )

  const sortedRpcList = uniqBy(identity, [fastestRpc.url, ...PROVIDER_URLS])
  useProviderRpcUrlStore.getState().setRpcUrlList(sortedRpcList)
}

export const ProviderBalancer: React.FC<PropsWithChildren> = ({ children }) => {
  const { rpcUrlList } = useProviderRpcUrlStore(
    useShallow((state) => pick(state, ["rpcUrlList"])),
  )

  const shouldPing = rpcUrlList.length === 0
  console.log("Should ping:", shouldPing)

  useEffect(() => {
    if (shouldPing) {
      pingAllAndSort()
    }
  }, [shouldPing])
  return shouldPing ? <AppLoader /> : children
}

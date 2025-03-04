import { useQueryClient } from "@tanstack/react-query"
import { useActiveRpcUrlList } from "api/provider"
import { useRemount } from "hooks/useRemount"
import { Fragment, PropsWithChildren, lazy, useEffect, useState } from "react"
import { usePrevious } from "react-use"

const ProviderSelectButton = lazy(async () => ({
  default: (
    await import(
      "sections/provider/components/ProviderSelectButton/ProviderSelectButton"
    )
  ).ProviderSelectButton,
}))

// Don't reset these queries
const QUERY_KEY_RESET_WHITELIST = ["rpcPing", "rpcPingAvg", "rpcInfo"]

export const ProviderReloader: React.FC<PropsWithChildren> = ({ children }) => {
  const rpcUrlList = useActiveRpcUrlList()
  const rpcVersion = useRemount(rpcUrlList)
  const prevRpcVersion = usePrevious(rpcVersion)
  const queryClient = useQueryClient()

  const [version, setVersion] = useState(0)

  useEffect(() => {
    const prev = prevRpcVersion ?? 0
    const curr = rpcVersion ?? 0

    const shouldReset = curr > prev

    if (shouldReset) {
      queryClient
        .resetQueries({
          predicate: (query) =>
            !QUERY_KEY_RESET_WHITELIST.includes(query.queryKey[0] as string),
        })
        .then(() => {
          setVersion((prev) => prev + 1)
          queryClient.invalidateQueries(["provider"])
          queryClient.refetchQueries(["provider"])
        })
    }
  }, [prevRpcVersion, queryClient, rpcVersion])

  return (
    <>
      <Fragment key={`provider-${version}`}>{children}</Fragment>
      <ProviderSelectButton />
    </>
  )
}

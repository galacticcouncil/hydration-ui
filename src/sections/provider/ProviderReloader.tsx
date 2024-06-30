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
      queryClient.clear()
      queryClient.resetQueries().then(() => {
        setVersion((prev) => prev + 1)
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

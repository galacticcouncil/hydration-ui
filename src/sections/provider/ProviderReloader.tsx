import { useQueryClient } from "@tanstack/react-query"
import { useProviderRpcUrlStore } from "api/provider"
import { useRemount } from "hooks/useRemount"
import { Fragment, useEffect, useState } from "react"
import { usePrevious } from "react-use"
import { ProviderSelectButton } from "sections/provider/components/ProviderSelectButton/ProviderSelectButton"

export const ProviderReloader: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { autoMode, rpcUrl, autoModeRpcUrl } = useProviderRpcUrlStore()
  const selectedRpc = autoMode ? autoModeRpcUrl : rpcUrl
  const rpcVersion = useRemount([selectedRpc ?? ""])
  const prevRpcVersion = usePrevious(rpcVersion)
  const queryClient = useQueryClient()

  const [version, setVersion] = useState(0)

  useEffect(() => {
    const prev = prevRpcVersion ?? 0
    const curr = rpcVersion ?? 0
    const isInitialAutoModeVersion = autoMode ? prev === 0 : false

    const shouldReset = !isInitialAutoModeVersion && curr > prev

    if (shouldReset) {
      queryClient.clear()
      queryClient.resetQueries().then(() => {
        setVersion((prev) => prev + 1)
      })
    }
  }, [autoMode, prevRpcVersion, queryClient, rpcVersion, selectedRpc])

  return (
    <Fragment key={`root-${version}`}>
      {children}
      <ProviderSelectButton />
    </Fragment>
  )
}

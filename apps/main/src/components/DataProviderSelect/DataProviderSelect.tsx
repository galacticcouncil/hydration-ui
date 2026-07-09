import {
  Button,
  Skeleton,
  Spinner,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { bestNumberQuery } from "@/api/chain"
import { useActiveProviderProps, useSquidUrl } from "@/api/provider"
import { RpcStatus } from "@/components/DataProviderSelect/components/rpc/RpcStatus"
import { StatusTooltipContent } from "@/components/DataProviderSelect/components/StatusTooltipContent"
import { DataProviderSelectModal } from "@/components/DataProviderSelect/DataProviderSelectModal"
import { useRpcProvider } from "@/providers/rpcProvider"

export const DataProviderSelect = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const provider = useRpcProvider()
  const { isMobile } = useBreakpoints()

  const { data } = useQuery(bestNumberQuery(provider))
  const providerProps = useActiveProviderProps()
  const squidUrl = useSquidUrl()

  return (
    <>
      <Tooltip
        text={
          !isMobile &&
          providerProps && <StatusTooltipContent {...providerProps} />
        }
        asChild
      >
        <Button
          variant="tertiary"
          size="small"
          outline
          blur
          onClick={() => setModalOpen(true)}
        >
          {data ? (
            <RpcStatus
              url={providerProps?.url ?? ""}
              name={providerProps?.name ?? ""}
              blockNumber={data.parachainBlockNumber}
              squidUrl={squidUrl}
              timestamp={data.timestamp}
            />
          ) : (
            <>
              <Skeleton width={60} />
              <Spinner />
            </>
          )}
        </Button>
      </Tooltip>
      <DataProviderSelectModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}

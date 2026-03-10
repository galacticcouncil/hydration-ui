import {
  Button,
  Skeleton,
  Spinner,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"

import { bestNumberQuery } from "@/api/chain"
import { useActiveProviderProps, useSquidUrl } from "@/api/provider"
import { RpcStatus } from "@/components/DataProviderSelect/components/rpc/RpcStatus"
import { StatusTooltipContent } from "@/components/DataProviderSelect/components/StatusTooltipContent"
import { SContainer } from "@/components/DataProviderSelect/DataProviderSelect.styled"
import { DataProviderSelectModal } from "@/components/DataProviderSelect/DataProviderSelectModal"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly bottomPinned?: boolean
}

export const DataProviderSelect: FC<Props> = ({ bottomPinned }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const provider = useRpcProvider()
  const { isMobile } = useBreakpoints()

  const { data } = useQuery(bestNumberQuery(provider))
  const providerProps = useActiveProviderProps()
  const squidUrl = useSquidUrl()

  return (
    <SContainer bottomPinned={bottomPinned}>
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
    </SContainer>
  )
}

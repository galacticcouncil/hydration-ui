import { Button, Skeleton, Spinner } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"

import { bestNumberQuery } from "@/api/chain"
import { useActiveProviderProps, useSquidUrl } from "@/api/provider"
import { RpcSelectModal } from "@/components/ProviderRpcSelect/components/RpcSelectModal"
import { RpcStatus } from "@/components/ProviderRpcSelect/components/RpcStatus"
import { SContainer } from "@/components/ProviderRpcSelect/ProviderRpcSelect.styled"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly bottomPinned?: boolean
}

export const ProviderRpcSelect: FC<Props> = ({ bottomPinned }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const provider = useRpcProvider()

  const { data } = useQuery(bestNumberQuery(provider))
  const providerProps = useActiveProviderProps()
  const squidUrl = useSquidUrl()

  return (
    <SContainer bottomPinned={bottomPinned}>
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
      <RpcSelectModal open={modalOpen} onOpenChange={setModalOpen} />
    </SContainer>
  )
}

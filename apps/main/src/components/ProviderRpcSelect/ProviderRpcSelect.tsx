import { Button, Skeleton, Spinner } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { bestNumberQuery } from "@/api/chain"
import { useActiveProviderProps } from "@/api/provider"
import { RpcSelectModal } from "@/components/ProviderRpcSelect/components/RpcSelectModal"
import { RpcStatus } from "@/components/ProviderRpcSelect/components/RpcStatus"
import { SContainer } from "@/components/ProviderRpcSelect/ProviderRpcSelect.styled"
import { useRpcProvider } from "@/providers/rpcProvider"

export const ProviderRpcSelect = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const provider = useRpcProvider()

  const { data } = useQuery(bestNumberQuery(provider))
  const providerProps = useActiveProviderProps()

  return (
    <SContainer>
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

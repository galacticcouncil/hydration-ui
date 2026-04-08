import { Flex, Modal } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { useState } from "react"

import { MultichainAssetList } from "@/modules/wallet/multichain/components/MultichainAssetList"
import { MultichainChainTabs } from "@/modules/wallet/multichain/components/MultichainChainTabs"
import { WalletEmptyState } from "@/modules/wallet/WalletEmptyState"
import { XcmQueryParams } from "@/modules/xcm/transfer/utils/query"
import { XcmTransferApp } from "@/modules/xcm/transfer/XcmTransferApp"

export const WalletMultichainPage = () => {
  const { account } = useAccount()
  const { chain } = useSearch({ from: "/wallet/multichain" })
  const [xcmParams, setXcmParams] = useState<XcmQueryParams | null>(null)

  if (!account) {
    return <WalletEmptyState />
  }

  return (
    <>
      <Flex direction="column" gap="xl">
        <MultichainChainTabs />
        <MultichainAssetList
          chainKey={chain}
          account={account}
          onTransfer={setXcmParams}
        />
      </Flex>
      <Modal
        variant="popup"
        open={xcmParams !== null}
        onOpenChange={() => setXcmParams(null)}
      >
        {xcmParams && <XcmTransferApp initialSearch={xcmParams} />}
      </Modal>
    </>
  )
}

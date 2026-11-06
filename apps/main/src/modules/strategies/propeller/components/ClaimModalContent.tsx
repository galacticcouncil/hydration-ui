import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { type FC } from "react"
import { type Hex } from "viem"

import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { claimPreviewQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useRpcProvider } from "@/providers/rpcProvider"

import { ClaimModalForm } from "./ClaimModalForm"
import { ClaimModalSkeleton } from "./ClaimModalSkeleton"

type ClaimModalContentProps = {
  row: PropellerWithdrawalRow
  onClose: () => void
}

/** The skeleton until the claim is prepared, then the payout choice. */
export const ClaimModalContent: FC<ClaimModalContentProps> = ({
  row,
  onClose,
}) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const evmAddress = safeConvertSS58toH160(account?.address ?? "") as Hex
  const { data: prepared } = useQuery(
    claimPreviewQuery(rpc, row.vault, row.requestId, evmAddress),
  )

  if (!prepared) return <ClaimModalSkeleton row={row} />

  return (
    <ClaimModalForm
      row={row}
      collateral={prepared.collateral}
      surplusHollar={prepared.surplusHollar}
      onClose={onClose}
    />
  )
}

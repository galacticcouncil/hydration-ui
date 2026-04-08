import { FC } from "react"

import { CancelTradeOrderModalContent } from "@/modules/trade/otc/cancel-order/CancelTradeOrderModalContent"
import { useRemoveIntents } from "@/modules/trade/swap/sections/Limit/useRemoveIntents"

type Props = {
  readonly intentId: bigint
  readonly fromAmount: string | null
  readonly symbol: string
  readonly onClose: () => void
}

export const RemoveIntentModalContent: FC<Props> = ({
  intentId,
  fromAmount,
  symbol,
  onClose,
}) => {
  const removeIntents = useRemoveIntents()

  return (
    <CancelTradeOrderModalContent
      sold={null}
      total={fromAmount}
      symbol={symbol}
      onBack={onClose}
      onSubmit={() => {
        removeIntents.mutate([intentId])
        onClose()
      }}
    />
  )
}

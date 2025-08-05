import { Stack, Toggle } from "@galacticcouncil/ui/components"
import { useState } from "react"

import { TipForm } from "@/modules/transactions/review/ReviewTransactionTip/components/TipForm"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionTip = () => {
  const [isTipEnabled, setIsTipEnabled] = useState(false)

  const { tipAssetId, setTip } = useTransaction()

  const onToggle = (checked: boolean) => {
    setIsTipEnabled(checked)
    if (!checked) {
      setTip("0") // Reset tip when toggled off
    }
  }

  return (
    <Stack gap={4} align="end">
      <Toggle checked={isTipEnabled} onCheckedChange={onToggle} />
      {isTipEnabled && <TipForm assetId={tipAssetId} onAmountChange={setTip} />}
    </Stack>
  )
}

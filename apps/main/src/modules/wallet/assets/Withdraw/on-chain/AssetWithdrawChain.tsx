import { AssetInputLabel } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { Trans } from "react-i18next"

import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"

export const AssetWithdrawChain: FC = () => {
  const { watch } = useFormContext<AssetWithdrawFormValues>()
  const chain = watch("chain")

  return (
    <AssetInputLabel sx={{ display: "flex", alignItems: "center", gap: 4 }}>
      <Trans i18nKey="fromChain" values={{ chain }}>
        {/* TODO chain icon */}
        <svg width={14} height={14} />
        <span sx={{ color: getToken("textButtons.small.rest") }} />
      </Trans>
    </AssetInputLabel>
  )
}

import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { type FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useVaultDisplayAsset } from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"

type ClaimModalPositionProps = {
  row: PropellerWithdrawalRow
}

/** The withdrawal being claimed, styled like the remove-liquidity header. */
export const ClaimModalPosition: FC<ClaimModalPositionProps> = ({ row }) => {
  const { t } = useTranslation("common")
  const displayAsset = useVaultDisplayAsset()(row.vault)

  return (
    <Flex align="center" gap="base">
      <AssetLogo id={displayAsset.id} size="large" />
      <Text fs="h5" fw={500} color={getToken("text.high")} font="primary">
        {
          // what this claim pays, like the row's Claim button: after a
          // partial claim the original request overstates it
          t("currency", {
            value: row.collateralSettled ?? row.estEth,
            symbol: displayAsset.symbol,
          })
        }
      </Text>
    </Flex>
  )
}

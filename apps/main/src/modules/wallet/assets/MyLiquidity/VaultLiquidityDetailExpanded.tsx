import { Amount, Button, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Minus } from "lucide-react"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SLiquidityDetailExpandedContainer } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded.styled"
import { SLiquidityPosition } from "@/modules/wallet/assets/MyLiquidity/LiquidityPosition.styled"
import { VaultLiquidityByPool } from "@/modules/wallet/assets/MyLiquidity/MyVaultLiquidity.data"

type Props = {
  readonly detail: VaultLiquidityByPool
  readonly onRemoveLiquidity: () => void
}

export const VaultLiquidityDetailExpanded: FC<Props> = ({
  detail,
  onRemoveLiquidity,
}) => {
  const { t } = useTranslation(["wallet", "common", "liquidity"])
  const { shareSymbol, currentValueHuman, currentTotalDisplay } = detail

  return (
    <SLiquidityDetailExpandedContainer>
      <SLiquidityPosition sx={{ backgroundColor: "inherit" }}>
        <Text fs="p4" fw={500} color={getToken("text.tint.secondary")}>
          {t("liquidity:liquidity.positions.label.vault")}
        </Text>

        <Amount
          value={t("common:currency", {
            value: currentValueHuman,
            symbol: shareSymbol,
          })}
          displayValue={t("common:currency", { value: currentTotalDisplay })}
        />

        <div />

        <Button
          variant="tertiary"
          outline
          sx={{ width: "min-content", justifySelf: "flex-end" }}
          onClick={onRemoveLiquidity}
        >
          <Minus />
          {t("liquidity:removeLiquidity")}
        </Button>
      </SLiquidityPosition>
    </SLiquidityDetailExpandedContainer>
  )
}

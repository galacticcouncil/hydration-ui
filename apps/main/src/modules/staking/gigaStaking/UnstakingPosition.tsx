import {
  Amount,
  Button,
  Flex,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { SUnstakingPosition } from "@/modules/staking/gigaStaking/UnstakingPosition.styled"
import { useAssets } from "@/providers/assetsProvider"

type UnstakingPositionProps = {
  id: string
  value: string
  displayValue: string
  remaining: number
}

export const UnstakingPosition: FC<UnstakingPositionProps> = ({
  value,
  displayValue,
  remaining,
}) => {
  const { t } = useTranslation("common")
  const { native } = useAssets()

  // TODO: Add claiming logic

  return (
    <SUnstakingPosition align="center" justify="space-between">
      <Flex align="center" gap="s">
        <AssetLogo id={native.id} />

        <Amount
          value={t("currency", { value, symbol: native.symbol })}
          displayValue={t("currency", { value: displayValue })}
        />
      </Flex>

      {remaining > 0 ? (
        <ValueStats
          label={t("remaining")}
          value={t("day", { count: Number(remaining) })}
          wrap
          size="small"
          sx={{
            alignItems: "flex-end",
          }}
        />
      ) : (
        <Button variant="secondary" size="small">
          {t("claim")}
        </Button>
      )}
    </SUnstakingPosition>
  )
}

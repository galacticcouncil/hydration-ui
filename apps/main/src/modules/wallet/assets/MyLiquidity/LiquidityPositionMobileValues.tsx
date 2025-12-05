import { Flex } from "@galacticcouncil/ui/components"
import { Amount } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AccountOmnipoolPosition } from "@/states/account"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"

type Props = {
  readonly position: AccountOmnipoolPosition
}

export const LiquidityPositionMobileValues: FC<Props> = ({ position }) => {
  const { t } = useTranslation("common")
  const format = useFormatOmnipoolPositionData()

  return (
    <Flex px={getTokenPx("containers.paddings.primary")} gap={54}>
      <Amount
        label={t("initialValue")}
        value={t("currency", {
          value: position.data.initialValueHuman,
          symbol: position.data.meta.symbol,
        })}
        displayValue={t("currency", {
          value: position.data.initialDisplay,
        })}
      />

      <Amount
        label={t("currentValue")}
        value={format(position.data)}
        displayValue={t("currency", {
          value: position.data.currentTotalDisplay,
        })}
      />
    </Flex>
  )
}

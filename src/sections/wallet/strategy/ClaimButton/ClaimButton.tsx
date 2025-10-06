import BN from "bignumber.js"
import { Button } from "components/Button/Button"
import { DataValue } from "components/DataValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { useClaimGdotReward } from "sections/wallet/strategy/ClaimButton/ClaimButton.utils"
import { theme } from "theme"
import { BN_0 } from "utils/constants"

export const ClaimButton = () => {
  const isMobile = useMedia(theme.viewport.lt.sm)
  const { t } = useTranslation()

  const { action, incentive } = useClaimGdotReward()

  const rewardBalance = incentive
    ? BN(incentive.claimableRewards).shiftedBy(-incentive.rewardTokenDecimals)
    : BN_0

  const rewardBalanceUsd = incentive
    ? rewardBalance.times(incentive?.rewardPriceFeed)
    : BN_0

  if (!rewardBalanceUsd.gt(0)) return null

  if (isMobile) {
    return (
      <div
        sx={{
          flex: "row",
          align: "center",
          justify: "space-between",
          gap: 10,
          width: "100%",
        }}
      >
        <Text fs={16} color="brightBlue300">
          {t("wallet.strategy.claim.header.title")}
        </Text>
        <div sx={{ flex: "row", align: "center", gap: 10 }}>
          <Text fs={16}>
            {t("value.usd", {
              amount: rewardBalanceUsd,
            })}
          </Text>
          <Button variant="primary" size="micro" onClick={() => action()}>
            {t("claim")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DataValue
      labelColor="brightBlue300"
      label={t("wallet.strategy.claim.header.title")}
    >
      <div sx={{ flex: "row", align: "center", justify: "flex-end", gap: 10 }}>
        <Text fs={16}>
          {t("value.usd", {
            amount: rewardBalanceUsd,
          })}
        </Text>
        <Button variant="primary" size="micro" onClick={() => action()}>
          {t("claim")}
        </Button>
      </div>
    </DataValue>
  )
}

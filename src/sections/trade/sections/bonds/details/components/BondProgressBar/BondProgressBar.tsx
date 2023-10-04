import { Trans, useTranslation } from "react-i18next"
import { ProgressBarContainer, SBar, SFill } from "./BondProgressBar.styled"
import { Text } from "components/Typography/Text/Text"
import {
  useBondEvents,
  useLBPPoolEvents,
  isPoolLiquidityEvent,
} from "api/bonds"
import { BN_0 } from "utils/constants"
import { useMemo } from "react"
import Skeleton from "react-loading-skeleton"
import BN from "bignumber.js"

export const BondProgreesBar = ({
  bondId,
  decimals,
}: {
  bondId?: string
  decimals?: number
}) => {
  const { t } = useTranslation()
  const lbpPoolEvents = useLBPPoolEvents(bondId)
  const bondEvents = useBondEvents(bondId)

  const isLoading = bondEvents.isLoading || lbpPoolEvents.isLoading

  const {
    sold = BN_0,
    percentage = BN_0,
    total = BN_0,
  } = useMemo(() => {
    if (!lbpPoolEvents.data || !bondEvents.data || !decimals) return {}

    const sold = bondEvents.data?.events
      .reduce((acc, event) => {
        if (event.args.assetOut === Number(bondId)) {
          return acc.plus(event.args.buyPrice ?? event.args.salePrice)
        }

        if (event.args.assetIn === Number(bondId)) {
          return acc.minus(event.args.amount)
        }

        return acc
      }, BN_0)
      .shiftedBy(-decimals)

    const totalAmount = lbpPoolEvents.data?.events
      .filter(isPoolLiquidityEvent)
      .find((event) => event.name === "LBP.LiquidityAdded")?.args.amountB

    const total = totalAmount ? BN(totalAmount).shiftedBy(-decimals) : BN_0

    const percentage = sold.div(total).multipliedBy(100)

    return { percentage, total, sold }
  }, [bondEvents.data, bondId, decimals, lbpPoolEvents.data])

  return (
    <ProgressBarContainer>
      <div sx={{ flex: ["column", "row"], gap: 8 }}>
        <Text color="brightBlue300">
          {t("bonds.details.progressBar.label")}
        </Text>
        {isLoading ? (
          <Skeleton width={200} height={20} />
        ) : (
          <div>
            <Trans
              t={t}
              i18nKey="bonds.details.progressBar.value"
              tOptions={{
                sold,
                total: total,
              }}
            >
              <span sx={{ color: "white" }} css={{ fontFamily: "FontOver" }} />
              <span
                sx={{ color: "darkBlue300" }}
                css={{ fontFamily: "FontOver" }}
              />
            </Trans>
          </div>
        )}
      </div>

      <SBar>
        <SFill percentage={percentage.toNumber()} />
      </SBar>
    </ProgressBarContainer>
  )
}

import { Trans, useTranslation } from "react-i18next"
import { ProgressBarContainer, SBar, SFill } from "./BondProgressBar.styled"
import { Text } from "components/Typography/Text/Text"
import { useTotalIssuance } from "api/totalIssuance"
import { useBondEvents } from "api/bonds"
import { BN_0 } from "utils/constants"
import { useMemo } from "react"
import Skeleton from "react-loading-skeleton"

export const BondProgreesBar = ({
  bondId,
  decimals,
}: {
  bondId?: string
  decimals?: number
}) => {
  const { t } = useTranslation()
  const totalIssuance = useTotalIssuance(Number(bondId))
  const bondEvents = useBondEvents(bondId)

  const isLoading = totalIssuance.isLoading && bondEvents.isLoading

  const {
    sold = BN_0,
    percentage = BN_0,
    issuance = BN_0,
  } = useMemo(() => {
    if (!totalIssuance.data || !bondEvents.data || !decimals) return {}

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

    const issuance = totalIssuance.data.total.shiftedBy(-decimals).toString()
    const percentage = sold.div(issuance).multipliedBy(100)

    return { percentage, issuance, sold }
  }, [bondEvents.data, bondId, decimals, totalIssuance.data])

  return (
    <ProgressBarContainer>
      <div sx={{ flex: "row", gap: 8 }}>
        <Text color="brightBlue300">
          {t("bonds.details.progressBar.label")}
        </Text>
        {isLoading ? (
          <Skeleton width={200} height={20} />
        ) : (
          <>
            <Trans
              t={t}
              i18nKey="bonds.details.progressBar.value"
              tOptions={{
                sold,
                total: issuance,
              }}
            >
              <span sx={{ color: "white" }} css={{ fontFamily: "FontOver" }} />
              <span
                sx={{ color: "darkBlue300" }}
                css={{ fontFamily: "FontOver" }}
              />
            </Trans>
          </>
        )}
      </div>

      <SBar>
        <SFill percentage={percentage.toNumber()} />
      </SBar>
    </ProgressBarContainer>
  )
}

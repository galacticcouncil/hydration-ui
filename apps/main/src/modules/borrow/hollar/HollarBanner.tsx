import { GhoBorrowApyRange } from "@galacticcouncil/money-market/components"
import { useMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import { getGhoReserve } from "@galacticcouncil/money-market/utils"
import HollarCans from "@galacticcouncil/ui/assets/images/HollarCans.webp"
import { Box, Button, Text, ValueStats } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { bigMin } from "@galacticcouncil/utils"
import { Link } from "@tanstack/react-router"
import Big from "big.js"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  SContainer,
  SContent,
  SHollarImage,
  SInnerContainer,
  SValuesContainer,
} from "./HollarBanner.styled"

type HollarBannerProps = {
  className?: string
}

export const HollarBanner: FC<HollarBannerProps> = ({ className }) => {
  const { t } = useTranslation()

  const { ghoReserveData, reserves, loading, ghoLoadingData } =
    useMoneyMarketData()

  const isLoading = loading || ghoLoadingData

  const reserve = getGhoReserve(reserves)

  const totalBorrowed = useMemo(() => {
    if (!reserve) return

    const totalDebt = Big(reserve.totalDebt)
    const borrowCap = Big(reserve.borrowCap)

    if (borrowCap.gt(0)) {
      return bigMin(totalDebt, borrowCap)
    }

    return totalDebt
  }, [reserve])

  return (
    <SContainer className={className}>
      <SInnerContainer>
        <SContent>
          <Box pr={[75, 100, 0]}>
            <Text
              fs={16}
              fw={600}
              color={getToken("colors.greys.900")}
              font="primary"
            >
              {t("hollar.banner.title")}
            </Text>
            <Text
              color={getToken("colors.greys.900")}
              fs={13}
              sx={{ maxWidth: ["100%", 500] }}
            >
              {t("hollar.banner.description")}
            </Text>
          </Box>
          <SValuesContainer sx={{ display: ["none", null, "grid"] }}>
            <ValueStats
              size="small"
              label={t("totalBorrowed")}
              isLoading={isLoading}
              wrap
              customValue={
                <Text fw={600}>
                  {t("currency.compact", { value: totalBorrowed })}
                </Text>
              }
            />
            <ValueStats
              size="small"
              label={t("apyBorrowRate")}
              isLoading={isLoading}
              wrap
              customValue={
                <GhoBorrowApyRange
                  minVal={ghoReserveData.ghoBorrowAPYWithMaxDiscount}
                  maxVal={ghoReserveData.ghoVariableBorrowAPY}
                />
              }
            />
            {reserve && (
              <Box>
                <Button variant="primary" size="small" asChild>
                  <Link
                    to="/borrow/markets/$address"
                    params={{ address: reserve.underlyingAsset }}
                  >
                    {t("hollar.banner.cta")}
                  </Link>
                </Button>
              </Box>
            )}
          </SValuesContainer>
          {reserve && (
            <Button
              asChild
              variant="primary"
              sx={{
                display: ["inline-flex", null, "none"],
                mt: 10,
                width: "fit-content",
              }}
            >
              <Link
                to="/borrow/markets/$address"
                params={{ address: reserve.underlyingAsset }}
              >
                {t("hollar.banner.cta")}
              </Link>
            </Button>
          )}
        </SContent>
      </SInnerContainer>
      <SHollarImage src={HollarCans} width={110} height={110} />
    </SContainer>
  )
}

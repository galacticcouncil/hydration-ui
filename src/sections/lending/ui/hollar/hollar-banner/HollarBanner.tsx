import { useNavigate } from "@tanstack/react-location"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { DataValue } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { FC, useMemo } from "react"
import { getGhoReserve } from "sections/lending/utils/ghoUtilities"
import {
  SContainer,
  SContent,
  SHollarImage,
  SInnerContainer,
  SValuesContainer,
} from "./HollarBanner.styled"
import { HollarBorrowApyRange } from "./HollarBorrowApyRange"
import HollarCans from "./assets/hollar-cans.webp"
import HollarText from "./assets/hollar-text.svg?react"
import { useTranslation } from "react-i18next"
import { useBorrowReserves, useGhoReserveData } from "api/borrow"
import { LINKS } from "utils/navigation"
import BN from "bignumber.js"

type HollarBannerProps = {
  className?: string
}

export const HollarBanner: FC<HollarBannerProps> = ({ className }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: reserves, isLoading: isLoadingReserves } = useBorrowReserves()
  const { data: ghoReserveData, isLoading: isLoadingGhoReserveData } =
    useGhoReserveData()

  const isLoading = isLoadingReserves || isLoadingGhoReserveData

  const totalBorrowed = useMemo(() => {
    const reserve = getGhoReserve(reserves?.formattedReserves ?? [])

    const totalDebt = BN(reserve?.totalDebt || 0)
    const borrowCap = BN(reserve?.borrowCap || 0)

    if (borrowCap.gt(0)) {
      return BigNumber.min(totalDebt, borrowCap).toNumber()
    }

    return totalDebt
  }, [reserves])

  const navToStratagyPage = () =>
    navigate({
      to: LINKS.strategies,
    })

  return (
    <SContainer className={className}>
      <SInnerContainer to={LINKS.strategies}>
        <SContent>
          <div sx={{ pr: [120, 0] }}>
            <HollarText sx={{ color: ["white", "basic900"], mb: 4 }} />
            <Text
              fs={13}
              lh={16}
              color={["basic300", "basic900"]}
              sx={{ maxWidth: ["100%", 500] }}
            >
              {t("lending.hollar.banner.description")}
            </Text>
          </div>
          <SValuesContainer>
            <DataValue
              size="small"
              label={t("lending.market.table.totalBorrowed")}
              labelColor="alpha0"
              isLoading={isLoading}
            >
              <DisplayValue isUSD compact value={totalBorrowed} />
            </DataValue>
            <DataValue
              size="small"
              label={t("lending.apyBorrowRate")}
              labelColor="alpha0"
              isLoading={isLoading}
            >
              {ghoReserveData && (
                <HollarBorrowApyRange
                  minVal={ghoReserveData.ghoBorrowAPYWithMaxDiscount}
                  maxVal={ghoReserveData.ghoVariableBorrowAPY}
                />
              )}
            </DataValue>
            <Button
              variant="primary"
              size="small"
              sx={{ display: ["none", "block"] }}
              css={{ zIndex: 1, position: "relative" }}
            >
              {t("wallet.strategy.banner.cta")}
            </Button>
          </SValuesContainer>
          <Button
            size="small"
            variant="primary"
            sx={{ display: ["block", "none"], mt: 20 }}
            fullWidth
            css={{ zIndex: 1, position: "relative" }}
            onClick={navToStratagyPage}
          >
            {t("wallet.strategy.banner.cta")}
          </Button>
        </SContent>
      </SInnerContainer>
      <SHollarImage
        src={HollarCans}
        sx={{ width: [130, 110], height: [130, 110] }}
      />
    </SContainer>
  )
}

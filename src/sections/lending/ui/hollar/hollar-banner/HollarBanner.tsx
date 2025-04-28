import { valueToBigNumber } from "@aave/math-utils"
import { useNavigate } from "@tanstack/react-location"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { DataValue } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { FC, useMemo } from "react"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRootStore } from "sections/lending/store/root"
import { getGhoReserve } from "sections/lending/utils/ghoUtilities"
import {
  SContainer,
  SContent,
  SHollarImage,
  SInnerContainer,
  SValuesContainer,
} from "./HollarBanner.styled"
import { HollarBorrowApyRange } from "./HollarBorrowApyRange"
import HollarImage from "./assets/hollar-image.png"
import HollarText from "./assets/hollar-text.svg?react"
import { useTranslation } from "react-i18next"

type HollarBannerProps = {
  className?: string
}

export const HollarBanner: FC<HollarBannerProps> = ({ className }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const currentMarket = useRootStore((store) => store.currentMarket)

  const { reserves, ghoReserveData, ghoLoadingData, loading } =
    useAppDataContext()

  const isLoading = loading || ghoLoadingData

  const { reserve, totalBorrowed } = useMemo(() => {
    const reserve = getGhoReserve(reserves)

    let totalBorrowed = Number(reserve?.totalDebt)
    if (Number(reserve?.borrowCap) > 0) {
      totalBorrowed = BigNumber.min(
        valueToBigNumber(reserve?.totalDebt || 0),
        valueToBigNumber(reserve?.borrowCap || 0),
      ).toNumber()
    }

    return {
      reserve,
      totalBorrowed,
    }
  }, [reserves])

  const navToDetail = () =>
    navigate({
      to: ROUTES.reserveOverview(reserve?.underlyingAsset || "", currentMarket),
    })

  return (
    <SContainer className={className}>
      <SInnerContainer
        to={ROUTES.reserveOverview(
          reserve?.underlyingAsset || "",
          currentMarket,
        )}
      >
        <SContent>
          <div sx={{ pr: [120, 0] }}>
            <HollarText sx={{ color: ["white", "basic900"] }} />
            <Text
              fs={12}
              lh={16}
              color={["basic300", "white"]}
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
              <HollarBorrowApyRange
                minVal={ghoReserveData.ghoBorrowAPYWithMaxDiscount}
                maxVal={ghoReserveData.ghoVariableBorrowAPY}
              />
            </DataValue>
            <Button
              size="micro"
              sx={{ py: 6, display: ["none", "block"] }}
              css={{ zIndex: 1, position: "relative" }}
              onClick={navToDetail}
            >
              {t("lending.details")}
            </Button>
          </SValuesContainer>
          <Button
            size="small"
            sx={{ display: ["block", "none"], mt: 20 }}
            fullWidth
            css={{ zIndex: 1, position: "relative" }}
            onClick={navToDetail}
          >
            {t("lending.details")}
          </Button>
        </SContent>
      </SInnerContainer>
      <SHollarImage src={HollarImage} width={120} height={120} />
    </SContainer>
  )
}

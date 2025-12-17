import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import HollarCans from "@galacticcouncil/ui/assets/images/HollarCans.webp"
import { Button, Text, ValueStats } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { isArray } from "remeda"

import { useGhoReserveData } from "@/api/borrow"
import { useRpcProvider } from "@/providers/rpcProvider"

import {
  SContainer,
  SContent,
  SText,
  SValuesContainer,
} from "./HollarBanner.styled"

type HollarBannerProps = {
  readonly reserve: ComputedReserveData | null | undefined
  readonly isLoadingReserves: boolean
}

export const HollarBannerDesktop: FC<HollarBannerProps> = ({
  reserve,
  isLoadingReserves,
}) => {
  const { t } = useTranslation()

  const { isLoaded } = useRpcProvider()
  const { data: gho, isLoading: isLoadingGhoReserveData } = useGhoReserveData()

  const { ghoBorrowApyRange } = gho ?? {}

  const isLoading = !isLoaded || isLoadingReserves || isLoadingGhoReserveData

  const totalBorrowed = (() => {
    if (!reserve) return

    const totalDebt = Big(reserve.totalDebt)
    const borrowCap = Big(reserve.borrowCap)

    if (borrowCap.gt(0)) {
      return Big.min(totalDebt, borrowCap)
    }

    return totalDebt
  })()

  return (
    <SContainer>
      <img
        sx={{ mt: -12, ml: 15, zIndex: 10 }}
        src={HollarCans}
        width={105}
        height={106}
      />
      <SContent>
        <SText>
          <Text fs={14} lh={1.3} fw={700} color="#242C23" font="primary">
            {t("hollar.banner.title.desktop")}
          </Text>
          <Text color="#1B1E1B" fs={12} lh={1.3}>
            {t("hollar.banner.description")}
          </Text>
        </SText>
        <SValuesContainer>
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
            wrap
            isLoading={isLoading}
            customValue={
              ghoBorrowApyRange && (
                <Text fw={600}>
                  {isArray(ghoBorrowApyRange)
                    ? t(`percent.range`, {
                        valueA: ghoBorrowApyRange[0],
                        valueB: ghoBorrowApyRange[1],
                      })
                    : t(`percent`, {
                        value: ghoBorrowApyRange,
                      })}
                </Text>
              )
            }
          />
          {reserve && (
            <Button asChild>
              <Link
                to="/borrow/markets/$address"
                params={{ address: reserve.underlyingAsset }}
              >
                {t("hollar.banner.cta")}
              </Link>
            </Button>
          )}
        </SValuesContainer>
      </SContent>
    </SContainer>
  )
}

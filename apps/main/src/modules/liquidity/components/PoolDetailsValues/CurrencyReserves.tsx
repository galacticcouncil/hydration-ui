import { Flex, Separator, Skeleton, Text } from "@galacticcouncil/ui/components"
import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { Trans, useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { TReserve, TStablepoolData } from "@/modules/liquidity/Liquidity.utils"

export const CurrencyReserves = ({
  stablepoolData,
}: {
  stablepoolData: TStablepoolData
}) => {
  const { t } = useTranslation(["common", "liquidity"])

  const { reserves, totalDisplayAmount } = stablepoolData

  return (
    <Flex direction="column" gap={10}>
      <Text
        fw={500}
        fs="h7"
        color={getToken("text.tint.secondary")}
        font="primary"
      >
        {t("liquidity:liquidity.stablepool.currencyReserves.label")}
      </Text>

      <Separator mx={-20} />

      {reserves.map((reserve) => (
        <Fragment key={reserve.asset_id}>
          <CurrencyReservesRow
            reserve={reserve}
            totalDisplayAmount={totalDisplayAmount}
          />
          <Separator mx={-20} />
        </Fragment>
      ))}
    </Flex>
  )
}

export const CurrencyReservesRow = ({
  reserve,
  totalDisplayAmount,
  loading,
  separator,
}: {
  reserve: TReserve
  totalDisplayAmount: string
  loading?: boolean
  separator?: React.ReactNode
}) => {
  const { t } = useTranslation(["common", "liquidity"])

  if (loading) {
    return <CurrencyReservesRowSkeleton />
  }

  return (
    <>
      <Flex justify="space-between">
        <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
          <AssetLogo id={reserve.asset_id.toString()} size="small" />
          <Text color={getToken("text.high")} fs="p3" fw={600}>
            {reserve.meta.symbol}
          </Text>
        </Flex>

        <Flex align="center" gap={6}>
          <Trans
            t={t}
            i18nKey="liquidity:liquidity.stablepool.currencyReserves.amount"
            values={{
              value: reserve.amountHuman,
              percentage: reserve.displayAmount
                ? Big(reserve.displayAmount)
                    .div(totalDisplayAmount)
                    .times(100)
                    .toFixed(1)
                : 0,
            }}
          >
            <Text color={getToken("text.high")} fw={500} fs={12} />
            <Text color={getToken("text.low")} fw={500} fs={12} />
          </Trans>
        </Flex>
      </Flex>
      {separator}
    </>
  )
}

export const CurrencyReservesRowSkeleton = () => {
  return (
    <Flex justify="space-between">
      <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
        <AssetLogo id={"0"} size="small" isLoading />
        <Skeleton width={50} height={14} />
      </Flex>
      <Skeleton width={50} height={13} />
    </Flex>
  )
}

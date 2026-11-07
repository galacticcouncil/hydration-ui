import { valueToBigNumber } from "@aave/math-utils"
import { Flex, SummaryRowValue, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import BigNumber from "bignumber.js"

import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { ComputedReserveData } from "@/hooks/commonTypes"

export type ReserveAmountProps = {
  reserve: ComputedReserveData
  amount: BigNumber
}

export const ReserveAmount: React.FC<ReserveAmountProps> = ({
  reserve,
  amount,
}) => {
  const { formatCurrency } = useAppFormatters()

  return (
    <Flex gap="s" align="center">
      <ReserveLogo address={reserve.underlyingAsset} size="small" />
      <SummaryRowValue>
        {formatCurrency(amount.toString(), { symbol: reserve.symbol })}
      </SummaryRowValue>
      <Text fs="p5" color={getToken("text.medium")}>
        (
        {formatCurrency(
          amount.multipliedBy(valueToBigNumber(reserve.priceInUSD)).toString(),
        )}
        )
      </Text>
    </Flex>
  )
}

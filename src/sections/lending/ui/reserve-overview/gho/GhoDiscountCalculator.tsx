import { FormattedGhoReserveData } from "@aave/math-utils"

import { ReactNode } from "react"

import { DataValue } from "components/DataValue"
import { Text } from "components/Typography/Text/Text"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"

export const GhoDiscountParameters: React.FC<{
  loading: boolean
  ghoReserveData: FormattedGhoReserveData
}> = ({ loading, ghoReserveData }) => {
  return (
    <div>
      <Text
        fs={14}
        sx={{ mb: 20 }}
        css={{ textTransform: "uppercase" }}
        font="GeistSemiBold"
      >
        Discount model parameters
      </Text>
      <div
        css={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
        }}
      >
        <DiscountDataValue title="Discountable amount" loading={loading}>
          <Text>{ghoReserveData.ghoDiscountedPerToken} to 1</Text>
        </DiscountDataValue>
        <DiscountDataValue title="Discount" loading={loading}>
          <FormattedNumber
            value={ghoReserveData.ghoDiscountRate}
            percent
            visibleDecimals={0}
          />
        </DiscountDataValue>
        <DiscountDataValue title="APY with discount applied" loading={loading}>
          <FormattedNumber
            value={ghoReserveData.ghoBorrowAPYWithMaxDiscount}
            percent
          />
        </DiscountDataValue>
        <DiscountDataValue title="Minimum staked Aave amount" loading={loading}>
          <FormattedNumber
            value={ghoReserveData.ghoMinDiscountTokenBalanceForDiscount}
            visibleDecimals={3}
          />
        </DiscountDataValue>
        <DiscountDataValue title="Minimum GHO borrow amount" loading={loading}>
          <FormattedNumber
            value={ghoReserveData.ghoMinDebtTokenBalanceForDiscount}
            visibleDecimals={2}
          />
        </DiscountDataValue>
      </div>
    </div>
  )
}

interface DiscountDataValueProps {
  title: ReactNode
  children: ReactNode
  loading: boolean
}

const DiscountDataValue = ({
  title,
  children,
  loading,
}: DiscountDataValueProps) => {
  return (
    <DataValue
      labelColor="basic400"
      font="Geist"
      size="small"
      label={title}
      isLoading={loading}
    >
      {children}
    </DataValue>
  )
}

import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { PercentageValue } from "sections/lending/components/PercentageValue"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export const SuppliedAssetsStats = () => {
  const { user, loading } = useAppDataContext()

  return (
    <DataValueList>
      <DataValue
        size="small"
        font="ChakraPetch"
        labelColor="basic600"
        label="Balance"
        isLoading={loading}
      >
        <DisplayValue value={Number(user?.totalLiquidityUSD || 0)} isUSD />
      </DataValue>
      <DataValue
        size="small"
        font="ChakraPetch"
        labelColor="basic600"
        label="APY"
        tooltip="The weighted average of APY for all supplied assets, including incentives."
        isLoading={loading}
      >
        <PercentageValue value={(user?.earnedAPY || 0) * 100} />
      </DataValue>
      <DataValue
        size="small"
        font="ChakraPetch"
        labelColor="basic600"
        label="Collateral"
        tooltip="The total amount of your assets denominated in USD that can be used as collateral for borrowing assets."
        isLoading={loading}
      >
        <DisplayValue value={Number(user?.totalCollateralUSD || 0)} isUSD />
      </DataValue>
    </DataValueList>
  )
}

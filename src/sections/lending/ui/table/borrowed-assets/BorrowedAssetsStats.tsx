import { DataValue, DataValueList } from "components/DataValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useTranslation } from "react-i18next"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"

export const BorrowedAssetsStats = () => {
  const { t } = useTranslation()
  const { user, loading } = useAppDataContext()

  const maxBorrowAmount = BN(
    user?.totalBorrowsMarketReferenceCurrency || "0",
  ).plus(user?.availableBorrowsMarketReferenceCurrency || "0")
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? BN_0
    : BN(user?.totalBorrowsMarketReferenceCurrency || "0").div(maxBorrowAmount)

  return (
    <DataValueList>
      <DataValue
        size="small"
        font="ChakraPetch"
        labelColor="basic600"
        label="Balance"
        isLoading={loading}
      >
        <DisplayValue value={Number(user?.totalBorrowsUSD || 0)} isUSD />
      </DataValue>
      <DataValue
        size="small"
        font="ChakraPetch"
        labelColor="basic600"
        label="APY"
        tooltip="The weighted average of APY for all supplied assets, including incentives."
        isLoading={loading}
      >
        {t("value.percentage", {
          value: (user?.debtAPY || 0) * 100,
        })}
      </DataValue>
      <DataValue
        size="small"
        font="ChakraPetch"
        labelColor="basic600"
        label="Borrow power used"
        tooltip="The % of your total borrowing power used. This is based on the amount of your collateral supplied and the total amount that you can borrow."
        isLoading={loading}
      >
        {t("value.percentage", {
          value: collateralUsagePercent.toNumber() * 100,
        })}
      </DataValue>
    </DataValueList>
  )
}

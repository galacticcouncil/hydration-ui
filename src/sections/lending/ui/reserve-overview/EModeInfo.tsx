import { DataValue, DataValueList } from "components/DataValue"
import { Text } from "components/Typography/Text/Text"
import { PercentageValue } from "components/PercentageValue"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { getEmodeMessage } from "sections/lending/components/transactions/Emode/EmodeNaming"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

type EModeInfoProps = {
  reserve: ComputedReserveData
}

export const EModeInfo: React.FC<EModeInfoProps> = ({ reserve }) => {
  return (
    <div>
      <div sx={{ flex: "row", mb: 20, gap: 10, align: "center" }}>
        <Text color="basic400" fs={14}>
          E-Mode Category
        </Text>
        <Text fs={14} sx={{ flex: "row", align: "center" }}>
          <span>{getEmodeMessage(reserve.eModeLabel)}</span>
        </Text>
      </div>
      <DataValueList>
        <DataValue
          labelColor="basic400"
          font="Geist"
          size="small"
          label="Max LTV"
          tooltip="The Maximum LTV ratio represents the maximum borrowing power of a specific collateral. For example, if a collateral has an LTV of 75%, the user can borrow up to 0.75 worth of ETH in the principal currency for every 1 ETH worth of collateral."
        >
          <PercentageValue value={Number(reserve.formattedEModeLtv) * 100} />
        </DataValue>
        <DataValue
          labelColor="basic400"
          font="Geist"
          size="small"
          label="Liquidation threshold"
          tooltip="This represents the threshold at which a borrow position will be considered undercollateralized and subject to liquidation for each collateral. For example, if a collateral has a liquidation threshold of 80%, it means that the position will be liquidated when the debt value is worth 80% of the collateral value."
        >
          <PercentageValue
            value={Number(reserve.formattedEModeLiquidationThreshold) * 100}
          />
        </DataValue>
        <DataValue
          labelColor="basic400"
          font="Geist"
          size="small"
          label="Liquidation penalty"
          tooltip="When a liquidation occurs, liquidators repay up to 50% of the outstanding borrowed amount on behalf of the borrower. In return, they can buy the collateral at a discount and keep the difference (liquidation penalty) as a bonus."
        >
          <PercentageValue
            value={Number(reserve.formattedEModeLiquidationBonus) * 100}
          />
        </DataValue>
      </DataValueList>
    </div>
  )
}

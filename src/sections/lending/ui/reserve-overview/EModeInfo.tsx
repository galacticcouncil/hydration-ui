import { DataValue, DataValueList } from "components/DataValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import LightningBoltGradient from "sections/lending/assets/lightningBoltGradient.svg?react"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { getEmodeMessage } from "sections/lending/components/transactions/Emode/EmodeNaming"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

type EModeInfoProps = {
  reserve: ComputedReserveData
}

export const EModeInfo: React.FC<EModeInfoProps> = ({ reserve }) => {
  const { t } = useTranslation()
  return (
    <div>
      <div sx={{ flex: "row", mb: 20, gap: 10, align: "center" }}>
        <Text color="basic400" fs={14}>
          E-Mode Category
        </Text>
        <Text fs={14} sx={{ flex: "row", align: "center" }}>
          <LightningBoltGradient width={14} height={14} sx={{ mr: 4 }} />
          <span>{getEmodeMessage(reserve.eModeLabel)}</span>
        </Text>
      </div>
      <DataValueList>
        <DataValue
          labelColor="basic400"
          font="ChakraPetch"
          size="small"
          label="Max LTV"
          tooltip="The Maximum LTV ratio represents the maximum borrowing power of a specific collateral. For example, if a collateral has an LTV of 75%, the user can borrow up to 0.75 worth of ETH in the principal currency for every 1 ETH worth of collateral."
        >
          {t("value.percentage", {
            value: +reserve.formattedEModeLtv * 100,
          })}
        </DataValue>
        <DataValue
          labelColor="basic400"
          font="ChakraPetch"
          size="small"
          label="Liquidation threshold"
          tooltip="This represents the threshold at which a borrow position will be considered undercollateralized and subject to liquidation for each collateral. For example, if a collateral has a liquidation threshold of 80%, it means that the position will be liquidated when the debt value is worth 80% of the collateral value."
        >
          {t("value.percentage", {
            value: +reserve.formattedEModeLiquidationThreshold * 100,
          })}
        </DataValue>
        <DataValue
          labelColor="basic400"
          font="ChakraPetch"
          size="small"
          label="Liquidation penalty"
          tooltip="When a liquidation occurs, liquidators repay up to 50% of the outstanding borrowed amount on behalf of the borrower. In return, they can buy the collateral at a discount and keep the difference (liquidation penalty) as a bonus."
        >
          {t("value.percentage", {
            value: +reserve.formattedEModeLiquidationBonus * 100,
          })}
        </DataValue>
      </DataValueList>
      <Text color="basic400" fs={14} sx={{ mt: 20 }}>
        <span>
          E-Mode increases your LTV for a selected category of assets, meaning
          that when E-mode is enabled, you will have higher borrowing power over
          assets of the same E-mode category which are defined by Aave
          Governance. You can enter E-Mode from your{" "}
          <a
            target="_blank"
            href={ROUTES.dashboard}
            css={{ textDecoration: "underline" }}
            rel="noreferrer"
          >
            Dashboard
          </a>
          . To learn more about E-Mode and applied restrictions in{" "}
          <a
            target="_blank"
            href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
            css={{ textDecoration: "underline" }}
            rel="noreferrer"
          >
            FAQ
          </a>{" "}
          or{" "}
          <a
            target="_blank"
            href="https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf"
            css={{ textDecoration: "underline" }}
            rel="noreferrer"
          >
            Aave V3 Technical Paper
          </a>
          .
        </span>
      </Text>
    </div>
  )
}

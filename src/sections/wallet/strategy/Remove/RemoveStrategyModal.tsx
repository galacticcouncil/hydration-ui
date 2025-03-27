import BigNumber from "bignumber.js"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { BoxSwitch, BoxSwitchOption } from "components/BoxSwitch/BoxSwitch"
import { Button } from "components/Button/Button"
import { Input } from "components/Input/Input"
import { ModalHorizontalSeparator } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { Slider } from "components/Slider/Slider"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { FC } from "react"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useRemoveForm } from "sections/wallet/strategy/Remove/RemoveStrategyModal.form"
import { GIGADOT_ASSET_ID } from "sections/wallet/strategy/strategy.mock"
import { useAssetsPrice } from "state/displayPrice"
import { theme } from "theme"

type Props = {
  readonly balance: string
  readonly assetReceiveId: string
  readonly assetReceiveAmount: string
  readonly onClose: () => void
}

export const RemoveStrategyModal: FC<Props> = ({
  balance,
  assetReceiveId,
  assetReceiveAmount,
  onClose,
}) => {
  const { t } = useTranslation()
  const form = useRemoveForm()

  // If the tokensToGet rounded to zero, allow only 100% withdrawal,
  // else, check if remaining value is below minimum allowed pool liquidity
  // TODO

  const { getAssetWithFallback } = useAssets()
  const assetReceive = getAssetWithFallback(assetReceiveId)

  const { getAssetPrice } = useAssetsPrice([assetReceiveId])
  const assetReceivePrice = getAssetPrice(assetReceiveId).price || "0"

  return (
    <form sx={{ display: "grid" }} onSubmit={form.handleSubmit(() => {})}>
      <div sx={{ flex: "column", gap: 16 }}>
        <Controller
          control={form.control}
          name="percentage"
          render={({ field: percentageField }) => (
            <div sx={{ flex: "column", gap: 4 }}>
              <div sx={{ flex: "column", gap: 12, pb: 16 }}>
                <div
                  sx={{
                    flex: "row",
                    justify: "space-between",
                    align: "center",
                    pt: 8,
                    pb: 16,
                  }}
                >
                  <AssetTableName id={GIGADOT_ASSET_ID} />
                  <div sx={{ flex: "column", align: "flex-end" }}>
                    <Text fw={600} fs={24} color="white">
                      {t("value", {
                        value: new BigNumber(balance)
                          .times(percentageField.value)
                          .div(100)
                          .toString(),
                      })}
                    </Text>
                    <Text fw={126} fs={16} lh={"1.3"} color="pink500">
                      {t("value.percentage", { value: percentageField.value })}
                    </Text>
                  </div>
                </div>
                <Slider
                  value={[percentageField.value]}
                  min={0}
                  max={100}
                  step={1}
                  onChange={percentageField.onChange}
                />
              </div>
              <div
                sx={{ flex: "column", gap: 6, py: 8, px: 10 }}
                css={{ background: "#00010766" }}
              >
                <div
                  sx={{
                    flex: "row",
                    justify: "space-between",
                    align: "center",
                  }}
                >
                  <Text fw={500} fs={12} color="whiteish500">
                    {t("wallet.strategy.remove.shareTokenAmount")}
                  </Text>
                  <div sx={{ flex: "row", align: "center", gap: 2 }}>
                    <Text
                      fw={500}
                      fs={11}
                      lh="1.4"
                      css={{ color: "#FFFFFFB2" }}
                    >
                      {t("balance")}
                    </Text>
                    <Text fw={500} fs={11} lh="1.4" color="white">
                      {t("value", { value: balance })}
                    </Text>
                  </div>
                </div>
                <div
                  css={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    columnGap: 6,
                  }}
                >
                  <BoxSwitch
                    options={options}
                    selected={percentageField.value}
                    onSelect={percentageField.onChange}
                  />
                  <Controller
                    control={form.control}
                    name="customPercentageInput"
                    render={({ field }) => (
                      <Input
                        value={field.value.toString()}
                        onChange={(value) => {
                          field.onChange(value)
                          percentageField.onChange(
                            Math.max(0, Math.min(100, Number(value) || 0)),
                          )
                        }}
                        name="custom"
                        label={t("custom")}
                        placeholder={t("custom")}
                        unit="%"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}
        />
        <div
          sx={{ flex: "column", gap: 3, px: 20, pt: 8, pb: 16 }}
          css={{ background: "#9EA7BA0F" }}
        >
          <Text fw={500} fs={16} color="brightBlue300" sx={{ py: 10 }}>
            {t("wallet.strategy.remove.assetToReceive")}
          </Text>
          <Separator />
          <div sx={{ flex: "row", justify: "space-between", py: 12 }}>
            <AssetTableName id={assetReceiveId} />
            <div sx={{ flex: "column", align: "flex-end" }}>
              <Text fw={500} fs={18} lh="1.3" color="white">
                {t("value.tokenWithSymbol", {
                  value: assetReceiveAmount,
                  symbol: assetReceive.symbol,
                })}
              </Text>
              <Text fs={12} lh="1.4" css={{ color: "#FFFFFFAD" }}>
                {t("value.usd", {
                  amount: new BigNumber(assetReceiveAmount)
                    .times(assetReceivePrice)
                    .toString(),
                })}
              </Text>
            </div>
          </div>
        </div>
      </div>
      <div sx={{ pt: 8, pb: 16 }}>
        <div sx={{ flex: "row", justify: "space-between", py: 4 }}>
          <Text fw={500} fs={14} color="basic400">
            {t("wallet.strategy.deposit.minReceived")}
          </Text>
          <Text fw={500} fs={14} color="white">
            ≈ 233 {assetReceive.symbol}
          </Text>
        </div>
        <Separator />
        <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
          <Text fw={500} fs={14} css={{ color: "#B2B6C5" }}>
            {t("healthFactor")}
          </Text>
          <div sx={{ flex: "column", align: "flex-end" }}>
            <div sx={{ flex: "row", align: "center", gap: 7 }}>
              <Text fw={600} fs={16} color="brightBlue300">
                ∞ →{" "}
                <span css={{ color: theme.colors.warningYellow300 }}>
                  1.38%
                </span>
              </Text>
            </div>
            <Text fw={500} fs={12} lh={16} color="basic500">
              {t("wallet.strategy.remove.liquidationAt", {
                value: "1.0",
              })}
            </Text>
          </div>
        </div>
      </div>
      <ModalHorizontalSeparator mb={16} />
      <Button variant="primary">{t("wallet.strategy.remove.confirm")}</Button>
    </form>
  )
}

const options: ReadonlyArray<BoxSwitchOption> = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "MAX", value: 100 },
]

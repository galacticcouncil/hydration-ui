import { useAccountAssets } from "api/deposits"
import { useAssets } from "providers/assets"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"
import { useSubmitNewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.submit"
import { NewDepositAssetField } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetField"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import BigNumber from "bignumber.js"
import { NewDepositAssetSelector } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { noop } from "utils/helpers"
import { SupplyAssetSummary } from "sections/lending/ui/table/supply-assets/SupplyAssetSummary"
import { Alert } from "components/Alert/Alert"
import { Switch } from "components/Switch/Switch"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Slider } from "components/Slider/Slider"
import { Separator } from "components/Separator/Separator"
import { useLooping } from "sections/lending/hooks/useLooping"
import { DOT_ASSET_ID } from "utils/constants"
import { A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"

type Props = {
  readonly assetId: string
  readonly assetsBlacklist: ReadonlyArray<string>
  readonly onClose: () => void
}

const LOOPING_MULTIPLIER_MIN = 2
const LOOPING_MULTIPLIER_MAX = 4

export const SupplyAssetModal: FC<Props> = ({
  assetId,
  assetsBlacklist,
  onClose,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const [isLoopingEnabled, setIsLoopingEnabled] = useState(false)
  const [loopingMultiplier, setLoopingMultiplier] = useState(
    LOOPING_MULTIPLIER_MIN,
  )

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { data: accountAssets } = useAccountAssets()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  const form = useFormContext<NewDepositFormValues>()
  const [selectedAsset, amount] = form.watch(["asset", "amount"])
  const selectedAssetBalance =
    accountAssetsMap?.get(selectedAsset?.id ?? "")?.balance?.balance || "0"

  const allowedAssets = useNewDepositAssets(assetsBlacklist)
  const {
    minAmountOut: minDepositedAmountOut,
    submit,
    healthFactorChange,
    underlyingReserve,
    supplyCapReached,
  } = useSubmitNewDepositForm(assetId)

  const onSubmit = (): void => {
    submit()
    onClose()
  }

  const { page, direction, back, next } = useModalPagination()

  const supplyAssetId = A_TOKEN_UNDERLYING_ID_MAP[assetId]
  const aTokenId = assetId

  const {
    createLoopingTx,
    isLoading: isLoopingLoading,
    minAmountOut: minLoopedAmountOut,
  } = useLooping(
    {
      amount,
      multiplier: loopingMultiplier,
      supplyAssetId,
      borrowAssetId: DOT_ASSET_ID,
      aTokenId: aTokenId,
    },
    {
      enabled: isLoopingEnabled,
      onSubmitted: onClose,
    },
  )

  const minAmountOut = isLoopingEnabled
    ? minLoopedAmountOut
    : minDepositedAmountOut

  return (
    <ModalContents
      page={page}
      direction={direction}
      onBack={back}
      onClose={onClose}
      contents={[
        {
          title: t("lending.supply.modal.title", { name: asset.name }),
          content: (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div sx={{ flex: "column", gap: 10 }}>
                <NewDepositAssetField
                  selectedAssetBalance={selectedAssetBalance}
                  onSelectAssetClick={allowedAssets.length ? next : noop}
                />
                <SummaryRow
                  label={
                    <Text fs={14} color="brightBlue300">
                      {t("lending.looping.switch.title")}
                    </Text>
                  }
                  content={
                    <Switch
                      name="looping"
                      onCheckedChange={setIsLoopingEnabled}
                      value={isLoopingEnabled}
                    />
                  }
                />
                <Separator sx={{ my: -5 }} />
                {isLoopingEnabled && (
                  <>
                    <SummaryRow
                      label={
                        <Text fs={14}>{t("lending.looping.slider.title")}</Text>
                      }
                      content={<Text fs={14}>{loopingMultiplier}x</Text>}
                    />
                    <div sx={{ mt: -10 }}>
                      <Slider
                        step={1}
                        min={LOOPING_MULTIPLIER_MIN}
                        max={LOOPING_MULTIPLIER_MAX}
                        dashCount={6}
                        onChange={([value]) => setLoopingMultiplier(value)}
                        value={[loopingMultiplier]}
                      />
                    </div>
                  </>
                )}
                {underlyingReserve && (
                  <SupplyAssetSummary
                    asset={asset}
                    reserve={underlyingReserve}
                    minReceived={new BigNumber(minAmountOut || "0")
                      .shiftedBy(-asset.decimals)
                      .toString()}
                    hfChange={healthFactorChange}
                  />
                )}
                {supplyCapReached && (
                  <Alert variant="warning">
                    {t("lending.tooltip.supplyCapMaxed", {
                      symbol: asset.symbol,
                    })}
                  </Alert>
                )}
                {account && (
                  <>
                    {isLoopingEnabled ? (
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => createLoopingTx?.()}
                        disabled={isLoopingLoading}
                        isLoading={isLoopingLoading}
                      >
                        {t("lending.looping.cta.title", {
                          symbol: asset.symbol,
                          multiplier: loopingMultiplier,
                        })}
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={supplyCapReached}
                      >
                        {t("lending.supply.modal.cta", {
                          symbol: asset.symbol,
                        })}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </form>
          ),
        },
        {
          noPadding: true,
          title: t("selectAsset.title"),
          content: (
            <NewDepositAssetSelector
              allowedAssets={allowedAssets}
              onClose={back}
            />
          ),
        },
      ]}
    />
  )
}

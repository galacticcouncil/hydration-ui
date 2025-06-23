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
import { useLooping } from "sections/lending/hooks/useLooping"
import { DOT_ASSET_ID } from "utils/constants"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAssetIdFromAddress } from "utils/evm"
import { IncompatibleEmodePositionsWarning } from "sections/lending/components/transactions/Warnings/IncompatibleEmodePositionsWarning"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"

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
  const { user } = useAppDataContext()

  const [shouldEnableEmode, setShouldEnableEmode] = useState(false)
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

  const {
    submitLooping,
    isLoading: isLoopingLoading,
    minAmountOut: minLoopedAmountOut,
  } = useLooping(
    {
      amount,
      multiplier: loopingMultiplier,
      supplyAssetId: getAssetIdFromAddress(
        underlyingReserve?.underlyingAsset ?? "",
      ),
      borrowAssetId: DOT_ASSET_ID,
      assetInId: selectedAsset?.id ?? "",
      assetOutId: assetId,
      withEmode: shouldEnableEmode,
    },
    {
      enabled: !!selectedAsset && isLoopingEnabled,
      onSubmitted: onClose,
    },
  )

  const onSubmit = (): void => {
    if (isLoopingEnabled) {
      submitLooping()
    } else {
      submit()
      onClose()
    }
  }

  const { page, direction, back, next } = useModalPagination()

  const minAmountOut = isLoopingEnabled
    ? minLoopedAmountOut
    : minDepositedAmountOut

  const isInCorrectEmode =
    user.userEmodeCategoryId === underlyingReserve?.eModeCategoryId

  const hasIncompatibleEmodePositions =
    shouldEnableEmode &&
    user.userReservesData.some(
      (userReserve) =>
        (Number(userReserve.scaledVariableDebt) > 0 ||
          Number(userReserve.principalStableDebt) > 0) &&
        userReserve.reserve.eModeCategoryId !==
          underlyingReserve?.eModeCategoryId,
    )

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
                {!isInCorrectEmode && (
                  <SummaryRow
                    label={
                      <Text fs={14} color="brightBlue300">
                        {t("lending.emode.switch.title")}
                      </Text>
                    }
                    content={
                      <Switch
                        name="emode"
                        sx={{ my: -6 }}
                        onCheckedChange={setShouldEnableEmode}
                        value={shouldEnableEmode}
                      />
                    }
                    withSeparator
                  />
                )}
                <SummaryRow
                  label={
                    <Text fs={14} color="brightBlue300">
                      {t("lending.looping.switch.title")}
                    </Text>
                  }
                  content={
                    <Switch
                      name="looping"
                      sx={{ my: -6 }}
                      onCheckedChange={setIsLoopingEnabled}
                      value={isLoopingEnabled}
                    />
                  }
                  withSeparator
                />
                {isLoopingEnabled && (
                  <div sx={{ mb: 10 }}>
                    <SummaryRow
                      label={
                        <Text fs={14}>{t("lending.looping.slider.title")}</Text>
                      }
                      content={
                        <InfoTooltip text={t("lending.looping.slider.tooltip")}>
                          <Text
                            fs={14}
                            sx={{ flex: "row", align: "center", gap: 4 }}
                          >
                            <span>
                              {t("lending.looping.slider.value", {
                                value: loopingMultiplier,
                              })}
                            </span>
                            <SInfoIcon />
                          </Text>
                        </InfoTooltip>
                      }
                    />
                    <div>
                      <Slider
                        thumbSize="small"
                        step={1}
                        min={LOOPING_MULTIPLIER_MIN}
                        max={LOOPING_MULTIPLIER_MAX}
                        dashes="auto"
                        onChange={([value]) => setLoopingMultiplier(value)}
                        value={[loopingMultiplier]}
                        formatDashValue={(value) =>
                          t("lending.looping.slider.value", { value })
                        }
                      />
                    </div>
                  </div>
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
                <Alert variant="info">
                  {t("lending.looping.collateral.dot.warning")}
                </Alert>
                {supplyCapReached && (
                  <Alert variant="warning">
                    {t("lending.tooltip.supplyCapMaxed", {
                      symbol: asset.symbol,
                    })}
                  </Alert>
                )}
                {hasIncompatibleEmodePositions && (
                  <IncompatibleEmodePositionsWarning
                    eModeLabel={underlyingReserve?.eModeLabel}
                  />
                )}
                {account && (
                  <>
                    {isLoopingEnabled ? (
                      <Button
                        variant="primary"
                        disabled={
                          isLoopingLoading || hasIncompatibleEmodePositions
                        }
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

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
import { useLooping } from "sections/lending/hooks/useLooping"
import { DOT_ASSET_ID } from "utils/constants"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAssetIdFromAddress } from "utils/evm"
import { IncompatibleEmodePositionsWarning } from "sections/lending/components/transactions/Warnings/IncompatibleEmodePositionsWarning"
import { SupplyAssetLoopingSlider } from "sections/lending/ui/table/supply-assets/SupplyAssetLoopingSlider"

type Props = {
  readonly assetId: string
  readonly assetsBlacklist: ReadonlyArray<string>
  readonly onClose: () => void
}

export const SupplyAssetModal: FC<Props> = ({
  assetId,
  assetsBlacklist,
  onClose,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { user } = useAppDataContext()

  const [shouldEnableEmode, setShouldEnableEmode] = useState(false)
  const [loopingMultiplier, setLoopingMultiplier] = useState(1)

  const isLoopingEnabled = loopingMultiplier > 1

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
                <SupplyAssetLoopingSlider
                  value={loopingMultiplier}
                  onChange={setLoopingMultiplier}
                  sx={{ py: 12, mb: 10 }}
                />
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

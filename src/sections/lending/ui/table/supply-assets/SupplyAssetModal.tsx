import { useAccountBalances } from "api/deposits"
import { TAsset, useAssets } from "providers/assets"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { FC, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"
import { useSubmitNewDepositForm } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.submit"
import { NewDepositAssetField } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetField"
import { Button } from "components/Button/Button"
import BigNumber from "bignumber.js"
import { NewDepositAssetSelector } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector"
import { useModalPagination } from "components/Modal/Modal.utils"
import {
  useNewDepositAssets,
  useNewDepositDefaultAssetId,
} from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { SupplyAssetSummary } from "sections/lending/ui/table/supply-assets/SupplyAssetSummary"
import { Alert } from "components/Alert/Alert"
import { NewDepositFormWrapper } from "sections/wallet/strategy/NewDepositForm/NewDepositFormWrapper"
import { AssetSelectSkeleton } from "components/AssetSelect/AssetSelectSkeleton"
import { useLooping } from "sections/lending/hooks/useLooping"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAssetIdFromAddress } from "utils/evm"
import { IncompatibleEmodePositionsWarning } from "sections/lending/components/transactions/Warnings/IncompatibleEmodePositionsWarning"
import { SupplyAssetLoopingSlider } from "sections/lending/ui/table/supply-assets/SupplyAssetLoopingSlider"
import { getMaxMultiplierFromLtv } from "sections/lending/utils/looping"
import { LOOPING_ASSET_PAIRS } from "sections/lending/ui-config/misc"

type Props = {
  readonly assetId: string
  readonly onClose: () => void
}

export const SupplyAssetModal: FC<Props> = ({ assetId, onClose }) => {
  const { t } = useTranslation()

  const { getAssetWithFallback, getRelatedAToken, native } = useAssets()
  const aToken = getRelatedAToken(assetId) ?? getAssetWithFallback(assetId)

  const { data: defaultAssetId, isLoading } =
    useNewDepositDefaultAssetId(assetId)

  const aTokenId = aToken.id

  const allowedAssets = useNewDepositAssets(assetId, {
    blacklist: aTokenId ? [aTokenId] : [],
    firstAssetId: defaultAssetId,
    lowPriorityAssetIds: [native.id],
  })

  const { page, direction, back, next } = useModalPagination()

  return isLoading ? (
    <ModalContents
      page={page}
      direction={direction}
      onBack={back}
      onClose={onClose}
      contents={[
        {
          title: t("lending.supply.modal.title", { name: aToken.name }),
          content: (
            <AssetSelectSkeleton
              title={t("wallet.strategy.deposit.depositAsset")}
              name=""
              balanceLabel=""
            />
          ),
        },
      ]}
    />
  ) : (
    <NewDepositFormWrapper defaultAssetId={defaultAssetId}>
      <ModalContents
        page={page}
        direction={direction}
        onBack={back}
        onClose={onClose}
        contents={[
          {
            title: t("lending.supply.modal.title", { name: aToken.name }),
            content: (
              <SupplyModalForm
                onClose={onClose}
                asset={aToken}
                allowedAssets={allowedAssets}
                onAssetSelect={next}
              />
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
    </NewDepositFormWrapper>
  )
}

const SupplyModalForm = ({
  asset,
  allowedAssets,
  onClose,
  onAssetSelect,
}: {
  asset: TAsset
  allowedAssets: string[]
  onClose: () => void
  onAssetSelect: () => void
}) => {
  const { getAsset } = useAssets()
  const { t } = useTranslation()
  const { account } = useAccount()
  const { data: accountAssets } = useAccountBalances()
  const { user } = useAppDataContext()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  const form = useFormContext<NewDepositFormValues>()
  const [selectedAsset, amount, loopingMultiplier] = form.watch([
    "asset",
    "amount",
    "loopingMultiplier",
  ])
  const selectedAssetBalance =
    accountAssetsMap?.get(selectedAsset?.id ?? "")?.balance?.transferable || "0"

  const {
    minAmountOut: minDepositedAmountOut,
    submit,
    healthFactorChange,
    underlyingReserve,
    supplyCapReached,
  } = useSubmitNewDepositForm(asset.id)

  const isInCorrectEmode =
    user.userEmodeCategoryId === underlyingReserve?.eModeCategoryId

  const supplyAssetId = getAssetIdFromAddress(
    underlyingReserve?.underlyingAsset ?? "",
  )

  const maxLoopingMultiplier = getMaxMultiplierFromLtv(
    Number(underlyingReserve?.formattedEModeLtv ?? 0),
  )

  const borrowAssetId = LOOPING_ASSET_PAIRS[supplyAssetId]
  const borrowAsset = getAsset(borrowAssetId)

  const isLoopingAvailable =
    maxLoopingMultiplier > 0 &&
    !!selectedAsset &&
    !!supplyAssetId &&
    !!borrowAssetId

  const isLoopingEnabled = isLoopingAvailable && loopingMultiplier > 1

  useEffect(() => {
    if (borrowAssetId && loopingMultiplier > 1) {
      form.setValue("asset", getAsset(borrowAssetId) ?? null)
    }
  }, [borrowAssetId, form, getAsset, loopingMultiplier])

  const {
    submitLooping,
    isLoading: isLoopingLoading,
    minAmountOut: minLoopedAmountOut,
  } = useLooping(
    {
      amount,
      multiplier: loopingMultiplier,
      supplyAssetId,
      borrowAssetId,
      assetInId: selectedAsset?.id ?? "",
      assetOutId: asset.id,
      withEmode: !isInCorrectEmode,
    },
    {
      enabled: isLoopingEnabled,
      onSubmitted: onClose,
    },
  )

  const onSubmit = (): void => {
    if (isLoopingAvailable) {
      submitLooping()
    } else {
      submit()
      onClose()
    }
  }

  const minAmountOut = isLoopingAvailable
    ? minLoopedAmountOut
    : minDepositedAmountOut

  const hasIncompatibleLoopingPositions =
    isLoopingAvailable &&
    !isInCorrectEmode &&
    user.userReservesData.some(
      (userReserve) =>
        (Number(userReserve.scaledVariableDebt) > 0 ||
          Number(userReserve.principalStableDebt) > 0) &&
        userReserve.reserve.eModeCategoryId !==
          underlyingReserve?.eModeCategoryId,
    )

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div sx={{ flex: "column", gap: 10 }}>
        <NewDepositAssetField
          selectedAssetBalance={selectedAssetBalance}
          onSelectAssetClick={
            allowedAssets.length && loopingMultiplier === 1
              ? onAssetSelect
              : undefined
          }
        />
        {isLoopingAvailable && (
          <SupplyAssetLoopingSlider
            max={maxLoopingMultiplier}
            sx={{ py: 12, mb: 10 }}
          />
        )}
        {isLoopingEnabled && (
          <Alert variant="info">
            {t("lending.looping.collateral.warning", {
              symbol: borrowAsset?.symbol,
            })}
          </Alert>
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
        {hasIncompatibleLoopingPositions && (
          <IncompatibleEmodePositionsWarning
            title={t("lending.looping.incompatibleEmodePositions.title", {
              eModeLabel: underlyingReserve?.eModeLabel ?? "",
            })}
            eModeLabel={underlyingReserve?.eModeLabel}
          />
        )}
        {account && (
          <>
            {isLoopingAvailable ? (
              <Button
                type="submit"
                variant="primary"
                disabled={
                  supplyCapReached ||
                  isLoopingLoading ||
                  hasIncompatibleLoopingPositions
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
  )
}

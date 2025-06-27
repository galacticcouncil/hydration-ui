import { useAccountAssets } from "api/deposits"
import { TAsset, useAssets } from "providers/assets"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { FC } from "react"
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
import { noop } from "utils/helpers"
import { SupplyAssetSummary } from "sections/lending/ui/table/supply-assets/SupplyAssetSummary"
import { Alert } from "components/Alert/Alert"
import { NewDepositFormWrapper } from "sections/wallet/strategy/NewDepositForm/NewDepositFormWrapper"
import { A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"
import { AssetSelectSkeleton } from "components/AssetSelect/AssetSelectSkeleton"

type Props = {
  readonly assetId: string
  readonly onClose: () => void
}

export const SupplyAssetModal: FC<Props> = ({ assetId, onClose }) => {
  const { t } = useTranslation()

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { data: defaultAssetId, isLoading } =
    useNewDepositDefaultAssetId(assetId)
  const allowedAssets = useNewDepositAssets([
    assetId,
    A_TOKEN_UNDERLYING_ID_MAP[assetId],
  ])

  const { page, direction, back, next } = useModalPagination()

  return isLoading ? (
    <ModalContents
      page={page}
      direction={direction}
      onBack={back}
      onClose={onClose}
      contents={[
        {
          title: t("lending.supply.modal.title", { name: asset.name }),
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
            title: t("lending.supply.modal.title", { name: asset.name }),
            content: (
              <SupplyModalForm
                onClose={onClose}
                asset={asset}
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
  const { t } = useTranslation()
  const { account } = useAccount()
  const { data: accountAssets } = useAccountAssets()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  const form = useFormContext<NewDepositFormValues>()
  const selectedAsset = form.watch("asset")
  const selectedAssetBalance =
    accountAssetsMap?.get(selectedAsset?.id ?? "")?.balance?.balance || "0"

  const {
    minAmountOut,
    submit,
    healthFactorChange,
    underlyingReserve,
    supplyCapReached,
  } = useSubmitNewDepositForm(asset.id)

  const onSubmit = (): void => {
    submit()
    onClose()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div sx={{ flex: "column", gap: 10 }}>
        <NewDepositAssetField
          selectedAssetBalance={selectedAssetBalance}
          onSelectAssetClick={allowedAssets.length ? onAssetSelect : noop}
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
        {supplyCapReached && (
          <Alert variant="warning">
            {t("lending.tooltip.supplyCapMaxed", {
              symbol: asset.symbol,
            })}
          </Alert>
        )}
        {account && (
          <Button type="submit" variant="primary" disabled={supplyCapReached}>
            {t("lending.supply.modal.cta", { symbol: asset.symbol })}
          </Button>
        )}
      </div>
    </form>
  )
}

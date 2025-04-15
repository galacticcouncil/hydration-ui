import { useAccountAssets } from "api/deposits"
import { useAssets } from "providers/assets"
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
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { noop } from "utils/helpers"
import { SupplyAssetSummary } from "sections/lending/ui/table/supply-assets/SupplyAssetSummary"

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

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { data: accountAssets } = useAccountAssets()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  const form = useFormContext<NewDepositFormValues>()
  const selectedAsset = form.watch("asset")
  const selectedAssetBalance =
    accountAssetsMap?.get(selectedAsset?.id ?? "")?.balance?.balance || "0"

  const allowedAssets = useNewDepositAssets(assetsBlacklist)
  const { minAmountOut, submit, healthFactorChange, underlyingReserve } =
    useSubmitNewDepositForm(assetId)

  const onSubmit = (): void => {
    submit()
    onClose()
  }

  const { page, direction, back, next } = useModalPagination()

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
                {account && (
                  <Button type="submit" variant="primary">
                    {t("lending.supply.modal.cta", { symbol: asset.symbol })}
                  </Button>
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

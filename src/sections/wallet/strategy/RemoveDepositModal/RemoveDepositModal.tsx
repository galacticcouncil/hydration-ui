import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { ModalHorizontalSeparator } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { useBestTrade } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.api"
import { useRemoveDepositForm } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"
import { RemoveDepositSummary } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositSummary"
import { RemoveDepositAmount } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositAmount"
import { RemoveDepositAsset } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositAsset"
import { useHealthFactorChange } from "api/borrow"
import { useAssets } from "providers/assets"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { useDebouncedValue } from "hooks/useDebouncedValue"

type Props = {
  readonly assetId: string
  readonly balance: string
  readonly onClose: () => void
}

export const RemoveDepositModal: FC<Props> = ({
  assetId,
  balance,
  onClose,
}) => {
  const { tradable } = useAssets()
  const { t } = useTranslation()
  const form = useRemoveDepositForm()

  const [assetReceived, percentage] = form.watch([
    "assetReceived",
    "percentage",
  ])

  const balanceToSell = new BigNumber(balance)
    .times(percentage)
    .div(100)
    .toString()

  const [debouncedBalance] = useDebouncedValue(balanceToSell, 300)

  const [minAmountOut, removeMutation, amountOut] = useBestTrade(
    assetId,
    assetReceived?.id ?? "",
    debouncedBalance,
  )

  const { page, direction, paginateTo } = useModalPagination()

  const hfChange = useHealthFactorChange(assetId, balanceToSell)

  return (
    <ModalContents
      page={page}
      direction={direction}
      onClose={onClose}
      onBack={() => paginateTo(0)}
      contents={[
        {
          title: t("wallet.strategy.remove.title"),
          content: (
            <FormProvider {...form}>
              <form
                sx={{ display: "grid" }}
                onSubmit={form.handleSubmit(() => removeMutation.mutate())}
              >
                <div sx={{ flex: "column", gap: 8 }}>
                  <div sx={{ flex: "column", gap: 16 }}>
                    <RemoveDepositAmount assetId={assetId} balance={balance} />
                    <RemoveDepositAsset
                      amountOut={new BigNumber(amountOut)
                        .shiftedBy(-(assetReceived?.decimals ?? 0))
                        .toString()}
                      onSelectorOpen={() => paginateTo(1)}
                    />
                  </div>
                  <RemoveDepositSummary
                    hfChange={hfChange}
                    minReceived={new BigNumber(minAmountOut)
                      .shiftedBy(-(assetReceived?.decimals ?? 0))
                      .toString()}
                    assetReceived={assetReceived}
                  />
                </div>
                <ModalHorizontalSeparator my={16} />
                <Button variant="primary" type="submit">
                  {t("wallet.strategy.remove.confirm")}
                </Button>
              </form>
            </FormProvider>
          ),
        },
        {
          title: t("selectAsset.title"),
          noPadding: true,
          content: (
            <AssetsModalContent
              allAssets
              hideInactiveAssets
              allowedAssets={tradable
                .map((asset) => asset.id)
                .filter(
                  (assetId) =>
                    assetId !== GDOT_ERC20_ASSET_ID &&
                    assetId !== GDOT_STABLESWAP_ASSET_ID,
                )}
              onSelect={(asset) => {
                form.setValue("assetReceived", asset, { shouldValidate: true })
                paginateTo(0)
              }}
            />
          ),
        },
      ]}
    />
  )
}

import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useNewDepositForm } from "./NewDepositForm.form"
import { FormProvider } from "react-hook-form"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { CurrentDepositData } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit"
import { NewDepositAssetField } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetField"
import { NewDepositSummary } from "sections/wallet/strategy/NewDepositForm/NewDepositSummary"
import { useAccountAssets } from "api/deposits"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { useStore } from "state/store"
import { useBestTradeSell } from "api/trade"
import { createToastMessages } from "state/toasts"

type Props = {
  readonly assetId: string
  readonly depositData: CurrentDepositData | null
}

export const NewDepositForm: FC<Props> = ({ assetId, depositData }) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()
  const { createTransaction } = useStore()
  const asset = getAssetWithFallback(assetId)

  const { data: accountAssets } = useAccountAssets()
  const accountAssetsMap = accountAssets?.accountAssetsMap

  const form = useNewDepositForm()
  const [selectedAsset, amount] = form.watch(["asset", "amount"])
  const selectedAssetBalance =
    accountAssetsMap?.get(selectedAsset?.id ?? "")?.balance?.balance || "0"

  const { minAmountOut, swapTx } = useBestTradeSell(
    selectedAsset?.id ?? "",
    assetId,
    amount,
  )

  const onSubmit = () => {
    createTransaction(
      { tx: swapTx },
      {
        toast: createToastMessages("wallet.strategy.deposit.toast", {
          t,
          tOptions: {
            strategy: asset.name,
            amount: amount,
            symbol: selectedAsset?.symbol,
          },
          components: ["span.highlight"],
        }),
      },
    )
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div sx={{ flex: "column", gap: 10 }}>
          <Text fw={[126, 600]} fs={[14, 17.5]} lh="1.2" color="white">
            {t("wallet.strategy.deposit.yourDeposit")}
          </Text>
          <NewDepositAssetField selectedAssetBalance={selectedAssetBalance} />
          {account && (
            <Button type="submit" variant="primary">
              {depositData ? t("add") : t("wallet.strategy.gigadot.deposit.cta")}
            </Button>
          )}
          {!account && <Web3ConnectModalButton />}
          <NewDepositSummary
            asset={asset}
            minReceived={new BigNumber(minAmountOut || "0")
              .shiftedBy(-asset.decimals)
              .toString()}
          />
        </div>
      </form>
    </FormProvider>
  )
}

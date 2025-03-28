import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { useAssets } from "providers/assets"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { useGigadotStrategyForm } from "./NewDepositForm.form"
import { BigNumber } from "bignumber.js"
import { Controller } from "react-hook-form"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { Text } from "components/Typography/Text/Text"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
// import { useRootStore } from "sections/lending/store/root"
import { maxBalance, maxBalanceError } from "utils/validators"
import { Modal } from "components/Modal/Modal"
import { useMinReceivedGigadot } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.query"
import { GIGADOT_ASSET_ID } from "sections/wallet/strategy/strategy.mock"
import { DepositData } from "sections/wallet/strategy/CurrentDeposit/CurrentDeposit"

const isLoading = false

type Props = {
  readonly depositData: DepositData | null
}

export const NewDepositForm: FC<Props> = ({ depositData }) => {
  const { t } = useTranslation()

  const [isAssetSelectOpen, setIsAssetSelectOpen] = useState(false)

  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(GIGADOT_ASSET_ID)

  const form = useGigadotStrategyForm()
  const [selectedAsset, selectedAssetBalance, amount] = form.watch([
    "asset",
    "balance",
    "amount",
  ])
  // const minRemainingBaseTokenBalance = useRootStore(
  //   (state) => state.poolComputed.minRemainingBaseTokenBalance,
  // )
  // const underlyingAsset = selectedAsset
  //   ? decimalToFormattedHex(+selectedAsset.id)
  //   : ""
  // const result = useBorrowModalWrapper({
  //   underlyingAsset,
  //   requiredPermission: PERMISSION.DEPOSITOR,
  // })
  // // Calculate max amount to supply
  // const maxAmountToSupply = useMemo(() => {
  //   if (!underlyingAsset || result.type === "error") {
  //     return "0"
  //   }

  //   const { nativeBalance, tokenBalance, poolReserve } = result.data
  //   const supplyUnWrapped =
  //     underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()

  //   const walletBalance = supplyUnWrapped ? nativeBalance : tokenBalance

  //   const {
  //     supplyCap,
  //     totalLiquidity,
  //     isFrozen,
  //     decimals,
  //     debtCeiling,
  //     isolationModeTotalDebt,
  //   } = poolReserve

  //   const amountRaw = getMaxAmountAvailableToSupply(
  //     walletBalance,
  //     {
  //       supplyCap,
  //       totalLiquidity,
  //       isFrozen,
  //       decimals,
  //       debtCeiling,
  //       isolationModeTotalDebt,
  //     },
  //     underlyingAsset,
  //     minRemainingBaseTokenBalance,
  //   )

  //   return selectedAsset?.decimals
  //     ? new BigNumber(amountRaw).shiftedBy(selectedAsset.decimals).toString()
  //     : "0"
  // }, [result, underlyingAsset, minRemainingBaseTokenBalance, selectedAsset])

  // if (result.type === "error") {
  //   return <TxErrorView txError={result.txError} />
  // }

  const minReceived = useMinReceivedGigadot(selectedAsset?.id ?? "", amount)

  return (
    <form onSubmit={form.handleSubmit(() => {})}>
      <div sx={{ flex: "column", gap: 10 }}>
        <Text
          font="GeistMono"
          fw={[126, 600]}
          fs={[14, 17.5]}
          lh="1.2"
          color="white"
        >
          {t("wallet.strategy.deposit.yourDeposit")}
        </Text>
        <Controller
          control={form.control}
          name="asset"
          render={({ field: assetField, fieldState: assetFieldState }) => (
            <Controller
              control={form.control}
              name="amount"
              rules={{
                validate: {
                  maxBalance: (value) => {
                    return !selectedAsset?.decimals ||
                      maxBalance(
                        selectedAssetBalance,
                        selectedAsset.decimals,
                      ).safeParse(value).success
                      ? undefined
                      : maxBalanceError
                  },
                },
              }}
              render={({
                field: amountField,
                fieldState: amountFieldState,
              }) => (
                <AssetSelect
                  sx={{ flex: "column" }}
                  disabled={isLoading}
                  name={amountField.name}
                  value={amountField.value}
                  id={assetField.value?.id ?? ""}
                  error={
                    assetFieldState.error?.message ??
                    amountFieldState.error?.message
                  }
                  title={t("wallet.strategy.deposit.yourDeposit")}
                  onChange={amountField.onChange}
                  balance={new BigNumber(selectedAssetBalance)}
                  balanceLabel={t("balance")}
                  onSelectAssetClick={() => setIsAssetSelectOpen(true)}
                />
              )}
            />
          )}
        />
        <Button variant="primary">
          {depositData ? t("add") : t("wallet.strategy.deposit.cta")}
        </Button>
        <div sx={{ flex: "row", justify: "space-between", height: 25 }}>
          <Text fw={500} fs={[12, 14]} color="basic400">
            {t("wallet.strategy.deposit.minReceived")}
          </Text>
          <Text fw={500} fs={[12, 14]} color="white">
            {"≈ "}
            {t("value.tokenWithSymbol", {
              value: new BigNumber(minReceived || "0")
                .shiftedBy(-asset.decimals)
                .toString(),
              symbol: asset.symbol,
            })}
          </Text>
        </div>
      </div>
      <Separator />
      <Modal
        open={isAssetSelectOpen}
        onClose={() => setIsAssetSelectOpen(false)}
        title={t("selectAsset.title")}
      >
        <AssetsModalContent
          onSelect={(asset, balance) => {
            form.setValue("balance", balance ?? "0", {
              shouldValidate: true,
            })
            form.setValue("asset", asset, { shouldValidate: true })
            setIsAssetSelectOpen(false)
          }}
        />
      </Modal>
    </form>
  )
}

// function decimalToFormattedHex(decimal: number): string {
//   // Convert decimal to hexadecimal
//   let hex = decimal.toString(16) // Converts decimal to hex (without leading 0x)

//   // Normalize to lowercase
//   hex = hex.toLowerCase()

//   // Define the fixed prefix
//   const fixedPrefix = "0x00000000000000000000000000000001"

//   // Concatenate the fixed prefix with the hexadecimal value
//   // Since we want to maintain 64 characters total, pad the hex appropriately
//   const formattedHex = fixedPrefix + hex.padStart(8, "0")

//   return formattedHex
// }

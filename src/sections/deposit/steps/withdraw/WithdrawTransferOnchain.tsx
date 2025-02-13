import { zodResolver } from "@hookform/resolvers/zod"
import { useTokenBalance } from "api/balances"
import { useEstimatedFees } from "api/transaction"
import BN from "bignumber.js"
import { AddressBook } from "components/AddressBook/AddressBook"
import { Alert } from "components/Alert"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  CEX_CONFIG,
  CEX_MIN_WITHDRAW_VALUES,
  useDeposit,
  useTransferSchema,
} from "sections/deposit/DepositPage.utils"
import { useWithdrawalOnchain } from "sections/deposit/steps/withdraw/WithdrawTransfer.utils"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_0, BN_NAN } from "utils/constants"
import { FormValues } from "utils/helpers"

export type WithdrawTransferOnchainProps = {
  onTransferSuccess: () => void
}

export const WithdrawTransferOnchain: React.FC<
  WithdrawTransferOnchainProps
> = ({ onTransferSuccess }) => {
  const { api } = useRpcProvider()
  const { t } = useTranslation()
  const { account } = useAccount()
  const { asset, cexId } = useDeposit()
  const [addressBookOpen, setAddressBookOpen] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  const activeCex = CEX_CONFIG.find((cex) => cex.id === cexId)
  const address = account?.address ?? ""

  const { getAsset } = useAssets()
  const { data: tokenBalance } = useTokenBalance(asset?.assetId, address)
  const assetMeta = getAsset(asset?.assetId ?? "")

  const estimatedFees = useEstimatedFees([
    api.tx.currencies.transfer(address, asset?.assetId ?? "0", "1"),
  ])

  const transferData = useMemo(() => {
    if (!assetMeta) {
      return {
        balance: BN_NAN,
        min: BN_0,
        max: BN_NAN,
        symbol: "",
        decimals: 0,
      }
    }
    const balance = BN(tokenBalance?.balance ?? "0")
    const max =
      estimatedFees.accountCurrencyId === asset?.assetId
        ? balance
            .minus(estimatedFees.accountCurrencyFee)
            .minus(assetMeta.existentialDeposit)
        : balance

    const min = BN(
      CEX_MIN_WITHDRAW_VALUES[asset?.assetId ?? ""] ?? "0",
    ).shiftedBy(assetMeta.decimals)

    return {
      balance,
      min,
      max,
      symbol: assetMeta?.symbol ?? "",
      decimals: assetMeta?.decimals ?? 0,
    }
  }, [
    asset?.assetId,
    assetMeta,
    estimatedFees.accountCurrencyFee,
    estimatedFees.accountCurrencyId,
    tokenBalance?.balance,
  ])

  const zodSchema = useTransferSchema({
    min: transferData.min,
    max: transferData.max,
    symbol: transferData.symbol,
    decimals: transferData.decimals,
  })

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      amount: "",
      address: "",
    },
    resolver: zodResolver(zodSchema),
  })

  const { mutateAsync: withdraw, isLoading } = useWithdrawalOnchain(
    asset?.assetId ?? "",
  )

  const onSubmit = async (values: FormValues<typeof form>) => {
    await withdraw(
      {
        cexAddress: values.address,
        amount: values.amount,
      },
      {
        onSuccess: onTransferSuccess,
      },
    )
  }

  const toggleAddressBook = () => {
    setAddressBookOpen((open) => !open)
  }

  return (
    <>
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <div sx={{ flex: "column", gap: [14, 20] }}>
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <div sx={{ flex: "column" }}>
                <AssetSelect
                  name={field.name}
                  value={field.value}
                  id={asset?.assetId ?? ""}
                  error={fieldState.error?.message}
                  title={t("selectAssets.asset")}
                  onChange={field.onChange}
                  balance={transferData.balance}
                  balanceMax={
                    !transferData.max.isNaN() ? transferData.max : undefined
                  }
                  balanceLabel={t("selectAsset.balance.label")}
                />
              </div>
            )}
          />
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <div sx={{ flex: "column", mx: [-16, 0] }}>
                <WalletTransferAccountInput
                  label={t("xcm.transfer.destAddress")}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("wallet.assets.transfer.dest.placeholder")}
                  openAddressBook={toggleAddressBook}
                  error={fieldState.error?.message}
                  hideNativeAddress
                />
              </div>
            )}
          />
          <Alert variant="info" hideIcon>
            <label sx={{ flex: "row", gap: 12, align: "start" }}>
              <Switch
                name="disclaimer-accepted"
                value={disclaimerAccepted}
                onCheckedChange={setDisclaimerAccepted}
              />
              <div>
                <Text fs={13} color="basic100" font="GeistSemiBold">
                  {t("withdraw.disclaimer.cex.title", {
                    cex: activeCex?.title,
                    symbol: asset?.data.asset.originSymbol,
                  })}
                </Text>
                <Text fs={13} color="basic400">
                  {t("withdraw.disclaimer.cex.description")}
                </Text>
              </div>
            </label>
          </Alert>
          <Button
            isLoading={isLoading}
            disabled={isLoading || !disclaimerAccepted}
            variant={isLoading ? "secondary" : "primary"}
          >
            {disclaimerAccepted
              ? t("withdraw.transfer.button")
              : t("withdraw.disclaimer.button")}
          </Button>
        </div>
      </form>
      <Modal
        open={addressBookOpen}
        onClose={toggleAddressBook}
        title={t("deposit.cex.transfer.addressbook.title")}
        headerVariant="gradient"
      >
        <AddressBook
          onSelect={(address) => {
            form.setValue("address", address)
            setAddressBookOpen(false)
          }}
        />
      </Modal>
    </>
  )
}

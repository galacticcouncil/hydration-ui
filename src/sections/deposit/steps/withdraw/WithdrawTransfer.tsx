import { zodResolver } from "@hookform/resolvers/zod"
import { useCrossChainTransfer, useCrossChainWallet } from "api/xcm"
import BN from "bignumber.js"
import { AddressBook } from "components/AddressBook/AddressBook"
import { Alert } from "components/Alert"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import {
  CEX_CONFIG,
  CEX_WITHDRAW_LIMITS,
  useDeposit,
  useTransferSchema,
} from "sections/deposit/DepositPage.utils"
import { WithdrawProcessing } from "sections/deposit/steps/withdraw/WithdrawProcessing"
import { useWithdraw } from "sections/deposit/steps/withdraw/WithdrawTransfer.utils"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_NAN } from "utils/constants"
import { FormValues } from "utils/helpers"

export type WithdrawTransferProps = {
  onTransferSuccess: () => void
}

export const WithdrawTransfer: React.FC<WithdrawTransferProps> = ({
  onTransferSuccess,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { asset, cexId } = useDeposit()
  const [addressBookOpen, setAddressBookOpen] = useState(false)
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false)

  const activeCex = CEX_CONFIG.find((cex) => cex.id === cexId)
  const address = account?.address ?? ""
  const dstChain = asset?.withdrawalChain ?? ""

  const wallet = useCrossChainWallet()

  const { data: xTransfer, isLoading: isLoadingXTransfer } =
    useCrossChainTransfer(wallet, {
      asset: asset?.data.asset.key ?? "",
      srcAddr: address,
      dstAddr: address,
      srcChain: "hydration",
      dstChain,
    })

  const transferData = useMemo(() => {
    if (!xTransfer)
      return {
        balance: BN_NAN,
        min: BN_NAN,
        max: BN_NAN,
        symbol: "",
        decimals: 0,
      }

    const { balance, min, max } = xTransfer.source

    const minWithdraw = BN(
      CEX_WITHDRAW_LIMITS[asset?.assetId ?? ""] ?? "0",
    ).shiftedBy(balance.decimals)

    return {
      symbol: balance.symbol,
      decimals: balance.decimals,
      balance: BN(balance.amount.toString()),
      min: BN.max(min.amount.toString(), minWithdraw),
      max: BN(max.amount.toString()),
    }
  }, [asset?.assetId, xTransfer])

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

  const { mutateAsync: withdraw, isLoading: isWithdrawing } = useWithdraw(
    cexId,
    asset?.assetId ?? "",
  )

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (!activeCex) throw new Error("CEX not found")
    if (!asset) throw new Error("Asset not found")

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
        <div
          sx={{ flex: "column", gap: [14, 20] }}
          css={{ position: "relative" }}
        >
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
            isLoading={isWithdrawing}
            disabled={
              isWithdrawing || isLoadingXTransfer || !disclaimerAccepted
            }
            variant={isWithdrawing ? "secondary" : "primary"}
          >
            {disclaimerAccepted
              ? t("withdraw.transfer.button")
              : t("withdraw.disclaimer.button")}
          </Button>
          {isWithdrawing && (
            <WithdrawProcessing
              css={{ position: "absolute", inset: 0, width: "100%", zIndex: 1 }}
            />
          )}
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

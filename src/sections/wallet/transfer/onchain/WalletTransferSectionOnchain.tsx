import { useAccountCurrency } from "api/payments"
import { useSpotPrice } from "api/spotPrice"
import { usePaymentInfo } from "api/transaction"
import CrossIcon from "assets/icons/CrossIcon.svg?react"
import BigNumber from "bignumber.js"
import { Alert } from "components/Alert/Alert"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Controller, UseFormReturn } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { theme } from "theme"
import { BN_0, BN_1, BN_10 } from "utils/constants"
import { safeConvertAddressSS58, shortenAccountAddress } from "utils/formatting"
import { FormValues } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import {
  CloseIcon,
  PasteAddressIcon,
} from "./WalletTransferSectionOnchain.styled"
import { useTokenBalance } from "api/balances"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { H160, safeConvertAddressH160 } from "utils/evm"

export function WalletTransferSectionOnchain({
  asset,
  form,
  onClose,
  openAssets,
  openAddressBook,
}: {
  asset: string
  form: UseFormReturn<{ dest: string; amount: string }>
  onClose: () => void
  openAssets: () => void
  openAddressBook: () => void
}) {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { api, assets } = useRpcProvider()
  const { createTransaction } = useStore()

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const tokenBalance = useTokenBalance(asset, account?.address)
  const assetMeta = assets.getAsset(asset.toString())

  const accountCurrency = useAccountCurrency(account?.address)
  const accountCurrencyMeta = accountCurrency.data
    ? assets.getAsset(accountCurrency.data)
    : undefined

  const spotPrice = useSpotPrice(assets.native.id, accountCurrencyMeta?.id)

  const { data: paymentInfoData } = usePaymentInfo(
    asset.toString() === assets.native.id
      ? api.tx.balances.transferKeepAlive("", "0")
      : api.tx.tokens.transferKeepAlive("", asset, "0"),
  )

  const isTransferingPaymentAsset = accountCurrency.data === asset.toString()

  const nativeFee = paymentInfoData?.partialFee.toBigNumber() ?? BN_0
  const nativeDecimals = assets.native.decimals
  const nativeDecimalsDiff =
    nativeDecimals - (accountCurrencyMeta?.decimals ?? nativeDecimals)

  const convertedFee = nativeFee.multipliedBy(spotPrice.data?.spotPrice ?? BN_1)

  const balance = tokenBalance.data?.balance
  const balanceMax = isTransferingPaymentAsset
    ? balance?.minus(convertedFee.div(BN_10.pow(nativeDecimalsDiff)))
    : balance

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta.decimals == null) throw new Error("Missing asset meta")

    const amount = new BigNumber(values.amount).multipliedBy(
      BN_10.pow(assetMeta.decimals),
    )

    const normalizedDest =
      safeConvertAddressH160(values.dest) !== null
        ? new H160(values.dest).toAccount()
        : values.dest

    return await createTransaction(
      {
        tx:
          asset.toString() === assets.native.id
            ? api.tx.balances.transferKeepAlive(
                normalizedDest,
                amount.toFixed(),
              )
            : api.tx.tokens.transferKeepAlive(
                normalizedDest,
                asset,
                amount.toFixed(),
              ),
      },
      {
        onClose,
        onBack: () => {},
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="wallet.assets.transfer.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: assetMeta.symbol,
                address: shortenAccountAddress(values.dest, 12),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onSuccess: (
            <Trans
              t={t}
              i18nKey="wallet.assets.transfer.toast.onSuccess"
              tOptions={{
                value: values.amount,
                symbol: assetMeta.symbol,
                address: shortenAccountAddress(values.dest, 12),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
          onError: (
            <Trans
              t={t}
              i18nKey="wallet.assets.transfer.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: assetMeta.symbol,
                address: shortenAccountAddress(values.dest, 12),
              }}
            >
              <span />
              <span className="highlight" />
            </Trans>
          ),
        },
      },
    )
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      autoComplete="off"
      sx={{
        flex: "column",
        justify: "space-between",
        minHeight: "100%",
      }}
    >
      <div sx={{ flex: "column", gap: 12 }}>
        <Controller
          name="dest"
          control={form.control}
          rules={{
            required: t("wallet.assets.transfer.error.required"),
            validate: {
              validAddress: (value) =>
                safeConvertAddressSS58(value, 0) != null ||
                safeConvertAddressH160(value) !== null ||
                t("wallet.assets.transfer.error.validAddress"),
              notSame: (value) => {
                if (!account?.address) return true
                const from = safeConvertAddressSS58(
                  account.address.toString(),
                  0,
                )
                const to = safeConvertAddressSS58(value, 0)
                if (from != null && to != null && from === to) {
                  return t("wallet.assets.transfer.error.notSame")
                }
                return true
              },
            },
          }}
          render={({
            field: { name, onChange, value, onBlur },
            fieldState: { error },
          }) => {
            const rightIcon = value ? (
              <CloseIcon
                icon={<CrossIcon />}
                onClick={() => onChange("")}
                name={t("modal.closeButton.name")}
              />
            ) : (
              <PasteAddressIcon
                onClick={async () => {
                  const text = await navigator.clipboard.readText()
                  onChange(text)
                }}
              />
            )

            return (
              <WalletTransferAccountInput
                label={t("wallet.assets.transfer.dest.label")}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={t("wallet.assets.transfer.dest.placeholder")}
                rightIcon={rightIcon}
                onBlur={onBlur}
                error={error?.message}
                openAddressBook={openAddressBook}
              />
            )
          }}
        />

        <Controller
          name="amount"
          control={form.control}
          rules={{
            required: t("wallet.assets.transfer.error.required"),
            validate: {
              validNumber: (value) => {
                try {
                  if (!new BigNumber(value).isNaN()) return true
                } catch {}
                return t("error.validNumber")
              },
              maxBalance: (value) => {
                try {
                  if (assetMeta.decimals == null)
                    throw new Error("Missing asset meta")
                  if (
                    balance?.gte(
                      BigNumber(value).multipliedBy(
                        BN_10.pow(assetMeta.decimals),
                      ),
                    )
                  )
                    return true
                } catch {}
                return t("liquidity.add.modal.validation.notEnoughBalance")
              },
              positive: (value) =>
                new BigNumber(value).gt(0) || t("error.positive"),
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={
                isDesktop
                  ? t("wallet.assets.transfer.asset.label")
                  : t("wallet.assets.transfer.asset.label_mob")
              }
              name={name}
              balance={balance}
              balanceMax={balanceMax}
              value={value}
              onChange={onChange}
              asset={asset}
              error={error?.message}
              onAssetOpen={openAssets}
            />
          )}
        />
        {asset !== "0" && (
          <Alert variant="warning" css={{ marginTop: 22 }}>
            {t("wallet.assets.transfer.warning.nonNative")}
          </Alert>
        )}
        <SummaryRow
          label={t("wallet.assets.transfer.transaction_cost")}
          content={
            paymentInfoData?.partialFee != null
              ? t("value.tokenWithSymbol", {
                  value: convertedFee,
                  symbol: accountCurrencyMeta?.symbol,
                  fixedPointScale: 12,
                })
              : ""
          }
        />
      </div>
      <div>
        <Separator color="darkBlue401" sx={{ mt: 31 }} />
        <div sx={{ flex: "row", justify: "space-between", mt: 20 }}>
          <Button onClick={onClose}>
            {t("wallet.assets.transfer.cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!form.formState.isDirty}
          >
            {t("wallet.assets.transfer.submit")}
          </Button>
        </div>
      </div>
    </form>
  )
}

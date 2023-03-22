import { u32 } from "@polkadot/types"
import { Button } from "components/Button/Button"
import { ModalMeta } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { FormValues } from "utils/helpers"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useAccountStore, useStore } from "state/store"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import BigNumber from "bignumber.js"
import { BN_1, BN_10 } from "utils/constants"
import { useAssetMeta } from "api/assetMeta"
import { Trans, useTranslation } from "react-i18next"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import {
  CloseIcon,
  PasteAddressIcon,
} from "./WalletTransferSectionOnchain.styled"
import { useMedia } from "react-use"
import { theme } from "theme"
import { safeConvertAddressSS58, shortenAccountAddress } from "utils/formatting"
import { Alert } from "components/Alert/Alert"
import { usePaymentInfo } from "api/transaction"
import { Spacer } from "components/Spacer/Spacer"
import { useAccountCurrency } from "api/payments"
import { useSpotPrice } from "api/spotPrice"
import { useAssetsModal } from "sections/assets/AssetsModal.utils"
import { SummaryRow } from "components/Summary/SummaryRow"

export function WalletTransferSectionOnchain(props: {
  initialAsset: u32 | string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [asset, setAsset] = useState(props.initialAsset)
  const {
    openModal,
    modal,
    isOpen: isOpenSelectAssetModal,
  } = useAssetsModal({
    onSelect: setAsset,
  })

  const api = useApiPromise()
  const { createTransaction } = useStore()

  const form = useForm<{
    dest: string
    amount: string
  }>({})

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const assetMeta = useAssetMeta(asset)
  const { account } = useAccountStore()
  const accountCurrency = useAccountCurrency(account?.address)
  const accountCurrencyMeta = useAssetMeta(accountCurrency.data)

  const spotPrice = useSpotPrice(NATIVE_ASSET_ID, accountCurrencyMeta.data?.id)

  const { data: paymentInfoData } = usePaymentInfo(
    asset === NATIVE_ASSET_ID
      ? api.tx.balances.transferKeepAlive("", "0")
      : api.tx.tokens.transferKeepAlive("", asset, "0"),
  )

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta.data?.decimals == null) throw new Error("Missing asset meta")

    const amount = new BigNumber(values.amount).multipliedBy(
      BN_10.pow(assetMeta.data?.decimals?.toString()),
    )

    return await createTransaction(
      {
        tx:
          asset === NATIVE_ASSET_ID
            ? api.tx.balances.transferKeepAlive(values.dest, amount.toFixed())
            : api.tx.tokens.transferKeepAlive(
                values.dest,
                asset,
                amount.toFixed(),
              ),
      },
      {
        toast: {
          onLoading: (
            <Trans
              t={t}
              i18nKey="wallet.assets.transfer.toast.onLoading"
              tOptions={{
                value: values.amount,
                symbol: assetMeta.data?.symbol,
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
                symbol: assetMeta.data?.symbol,
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
                symbol: assetMeta.data?.symbol,
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
    <>
      <ModalMeta
        title={t("wallet.assets.transfer.title")}
        withoutOutsideClose
      />

      <Spacer size={[13, 26]} />
      {isOpenSelectAssetModal ? (
        modal
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          autoComplete="off"
          sx={{ flex: "column", justify: "space-between", height: "100%" }}
        >
          <div sx={{ flex: "column" }}>
            <Controller
              name="dest"
              control={form.control}
              rules={{
                required: t("wallet.assets.transfer.error.required"),
                validate: {
                  validAddress: (value) =>
                    safeConvertAddressSS58(value, 0) != null ||
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
                  value={value}
                  onChange={onChange}
                  asset={asset}
                  error={error?.message}
                  onAssetOpen={openModal}
                />
              )}
            />
            {asset !== "0" && (
              <Alert variant="warning" css={{ marginTop: 22 }}>
                {t("wallet.assets.transfer.warning.nonNative")}
              </Alert>
            )}
            <Spacer size={15} />
            <SummaryRow
              label={t("wallet.assets.transfer.transaction_cost")}
              content={
                paymentInfoData?.partialFee != null
                  ? t("liquidity.add.modal.row.transactionCostValue", {
                      amount: new BigNumber(
                        paymentInfoData.partialFee.toHex(),
                      ).multipliedBy(spotPrice.data?.spotPrice ?? BN_1),
                      symbol: accountCurrencyMeta.data?.symbol,
                      fixedPointScale: 12,
                    })
                  : ""
              }
            />
          </div>
          <div>
            <Separator color="darkBlue401" sx={{ mt: 31 }} />
            <div sx={{ flex: "row", justify: "space-between", mt: 20 }}>
              <Button onClick={props.onClose}>
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
      )}
    </>
  )
}

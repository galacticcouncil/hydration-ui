import { u32 } from "@polkadot/types"
import { Button } from "components/Button/Button"
import { ModalMeta } from "components/Modal/Modal"
import { Separator } from "components/Separator/Separator"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { FormValues } from "utils/helpers"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import BigNumber from "bignumber.js"
import { BN_10 } from "utils/constants"
import { useAssetMeta } from "api/assetMeta"
import { useTranslation } from "react-i18next"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { ReactComponent as CrossIcon } from "assets/icons/CrossIcon.svg"
import {
  CloseIcon,
  PasteAddressIcon,
} from "./WalletTransferSectionOnchain.styled"
import { Text } from "components/Typography/Text/Text"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { useMedia } from "react-use"
import { theme } from "theme"

export function WalletTransferSectionOnchain(props: {
  initialAsset: u32 | string
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [asset, setAsset] = useState(props.initialAsset)

  const api = useApiPromise()
  const { createTransaction } = useStore()

  const form = useForm<{
    dest: string
    amount: string
  }>({})

  const isDesktop = useMedia(theme.viewport.gte.sm)
  const assetMeta = useAssetMeta(asset)

  const onSubmit = async (values: FormValues<typeof form>) => {
    if (assetMeta.data?.decimals == null) throw new Error("Missing asset meta")

    const amount = new BigNumber(values.amount).multipliedBy(
      BN_10.pow(assetMeta.data?.decimals?.toString()),
    )

    return await createTransaction({
      tx:
        asset === NATIVE_ASSET_ID
          ? api.tx.balances.transferKeepAlive(values.dest, amount.toFixed())
          : api.tx.tokens.transferKeepAlive(
              values.dest,
              asset,
              amount.toFixed(),
            ),
    })
  }

  return (
    <>
      <ModalMeta title={t("wallet.assets.transfer.title")} />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        sx={{
          flex: "column",
          justify: "space-between",
          pt: 26,
          height: "100%",
        }}
      >
        <div sx={{ flex: "column" }}>
          <Controller
            name="dest"
            control={form.control}
            render={({ field: { name, onChange, value } }) => {
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
                />
              )
            }}
          />

          <Controller
            name="amount"
            control={form.control}
            render={({ field: { name, value, onChange } }) => (
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
                onAssetChange={setAsset}
              />
            )}
          />
          <div
            sx={{
              mt: 18,
              flex: "row",
              justify: "space-between",
            }}
          >
            <Text fs={13} color="basic300">
              {t("wallet.assets.transfer.transaction_cost")}
            </Text>
            <div sx={{ flex: "row", align: "center", gap: 4 }}>
              {/*TODO: calculate the value of the transaction cost*/}
              <Text fs={14}>~12 BSX</Text>
              <GradientText fs={12} font="ChakraPetch">
                {"(2%)"}
              </GradientText>
            </div>
          </div>
        </div>
        <div>
          <Separator color="darkBlue401" sx={{ mt: 31 }} />
          <div sx={{ flex: "row", justify: "space-between", mt: 20 }}>
            <Button onClick={props.onClose}>
              {t("wallet.assets.transfer.cancel")}
            </Button>
            <Button type="submit" variant="primary">
              {t("wallet.assets.transfer.submit")}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}

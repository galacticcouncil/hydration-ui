import { u32 } from "@polkadot/types"
import { Button } from "components/Button/Button"
import { Modal } from "components/Modal/Modal"
import { PillSwitch } from "components/PillSwitch/PillSwitch"
import { Separator } from "components/Separator/Separator"
import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { FormValues } from "utils/helpers"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useAccountStore, useStore } from "state/store"

import {
  BASILISK_ADDRESS_PREFIX,
  NATIVE_ASSET_ID,
  useApiPromise,
} from "utils/api"
import BigNumber from "bignumber.js"
import { BN_10 } from "utils/constants"
import { useAssetMeta } from "api/assetMeta"
import { useTranslation } from "react-i18next"
import { WalletTransferAccountInput } from "./WalletTransferAccountInput"
import { safeConvertAddressSS58 } from "utils/formatting"

export function WalletTransferModal(props: {
  open: boolean
  onClose: () => void
  initialAsset: u32 | string
}) {
  const { t } = useTranslation()
  const [chain, setChain] = useState<"onchain" | "crosschain">("onchain")
  const [asset, setAsset] = useState(props.initialAsset)

  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { account } = useAccountStore()

  const form = useForm<{
    dest: string
    amount: string
  }>({})

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
    <Modal
      open={props.open}
      onClose={props.onClose}
      title={t("wallet.assets.transfer.title")}
      topContent={
        <div sx={{ flex: "column", align: "center", mb: 16 }}>
          <PillSwitch
            options={[
              {
                value: "onchain" as const,
                label: t("wallet.assets.transfer.switch.onchain"),
              },
              {
                value: "crosschain" as const,
                label: t("wallet.assets.transfer.switch.crosschain"),
              },
            ]}
            value={chain}
            onChange={setChain}
          />
        </div>
      }
    >
      <Spacer size={26} />

      <form onSubmit={form.handleSubmit(onSubmit)} sx={{ flex: "column" }}>
        <div sx={{ bg: "backgroundGray1000" }} css={{ borderRadius: 12 }}>
          <div sx={{ flex: "column", gap: 8, p: 20 }}>
            <Text fw={500}>{t("wallet.assets.transfer.from.label")}</Text>

            <WalletTransferAccountInput
              name="from"
              value={safeConvertAddressSS58(
                account?.address?.toString(),
                BASILISK_ADDRESS_PREFIX,
              )}
            />
          </div>

          <Separator color="backgroundGray900" />

          <div sx={{ flex: "column", gap: 8, p: 20 }}>
            <Text fw={500}>{t("wallet.assets.transfer.dest.label")}</Text>

            <Controller
              name="dest"
              control={form.control}
              render={({ field: { name, onChange, value } }) => {
                return (
                  <WalletTransferAccountInput
                    name={name}
                    value={value}
                    onChange={onChange}
                  />
                )
              }}
            />
          </div>
        </div>

        <Spacer size={10} />

        <Controller
          name="amount"
          control={form.control}
          render={({ field: { name, value, onChange } }) => (
            <WalletTransferAssetSelect
              title={t("wallet.assets.transfer.asset.label")}
              name={name}
              value={value}
              onChange={onChange}
              asset={asset}
              onAssetChange={setAsset}
            />
          )}
        />

        <Spacer size={20} />

        <div sx={{ flex: "row", justify: "space-between" }}>
          <Button onClick={props.onClose}>
            {t("wallet.assets.transfer.cancel")}
          </Button>
          <Button type="submit" variant="primary">
            {t("wallet.assets.transfer.submit")}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

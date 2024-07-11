import { InputBox } from "components/Input/InputBox"
import { FC } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { MemepadStep1Values } from "./MemepadForm.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import {
  ASSETHUB_ASSET_CREATION_DOT_COST,
  useAssetHubNativeBalance,
} from "api/externalAssetRegistry/assethub"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { undefinedNoop } from "utils/helpers"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"

type MemepadFormStep1Props = {
  form: UseFormReturn<MemepadStep1Values>
}

export const MemepadFormStep1: FC<MemepadFormStep1Props> = ({ form }) => {
  const { t } = useTranslation()

  const { account } = useAccount()

  const { data } = useAssetHubNativeBalance(account?.address)

  return (
    <form autoComplete="off">
      <div sx={{ flex: "column", gap: 8 }}>
        <input
          type="hidden"
          {...form.register("origin", { valueAsNumber: true })}
        />
        <input
          type="hidden"
          {...(form.register("decimals"), { valueAsNumber: true })}
        />
        <Controller
          name="name"
          control={form.control}
          render={({ field }) => (
            <InputBox
              label={t("memepad.form.name")}
              withLabel
              error={form.formState.errors.name?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="symbol"
          control={form.control}
          render={({ field }) => (
            <InputBox
              label={t("memepad.form.symbol")}
              withLabel
              error={form.formState.errors.symbol?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="deposit"
          control={form.control}
          render={({ field }) => (
            <InputBox
              label={t("memepad.form.deposit")}
              withLabel
              error={form.formState.errors.deposit?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="supply"
          control={form.control}
          render={({ field }) => (
            <InputBox
              label={t("memepad.form.supply")}
              withLabel
              error={form.formState.errors.supply?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="account"
          control={form.control}
          render={({ field }) => (
            <WalletTransferAccountInput
              disabled
              sx={{ p: 12 }}
              label={t("memepad.form.account")}
              css={{ pointerEvents: "none" }}
              {...field}
            />
          )}
        />
        <AssetSelect
          id="5"
          title={t("memepad.form.assetCreationCost")}
          withoutMaxBtn
          name="creation-cost"
          value={ASSETHUB_ASSET_CREATION_DOT_COST.toString()}
          balance={data?.balance}
          balanceLabel={t("balance")}
          onChange={undefinedNoop}
          disabled
        />
      </div>
    </form>
  )
}

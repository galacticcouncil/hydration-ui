import { InputBox } from "components/Input/InputBox"
import { FC } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { MemepadStep1Values } from "./MemepadForm.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAssetHubNativeBalance } from "api/externalAssetRegistry/assethub"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { undefinedNoop } from "utils/helpers"
import { AH_ASSET_CREATION_DOT_COST } from "sections/wallet/addToken/AddToken.utils"

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
              label={t("wallet.addToken.form.name")}
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
              label={t("wallet.addToken.form.symbol")}
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
              label={t("wallet.addToken.form.deposit")}
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
              label={t("wallet.addToken.form.supply")}
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
            <InputBox
              label={t("wallet.addToken.form.account")}
              disabled
              withLabel
              error={form.formState.errors.account?.message}
              {...field}
            />
          )}
        />
        <AssetSelect
          id="5"
          title="Asset creation cost"
          withoutMaxBtn
          name="dotBalance"
          value={AH_ASSET_CREATION_DOT_COST.toString()}
          balance={data?.balance}
          balanceLabel={t("balance")}
          onChange={undefinedNoop}
          disabled
        />
      </div>
    </form>
  )
}

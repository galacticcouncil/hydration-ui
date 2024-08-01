import { InputBox } from "components/Input/InputBox"
import { FC } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { MemepadStep1Values } from "./MemepadForm.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import {
  assethub,
  assethubNativeToken,
  useAssetHubNativeBalance,
  useAssetHubTokenBalance,
} from "api/external/assethub"
import { WalletTransferAccountInput } from "sections/wallet/transfer/WalletTransferAccountInput"
import { useMemepadFormContext } from "./MemepadFormContext"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"
import { SRowItem } from "sections/memepad/components/MemepadSummary"
import { Text } from "components/Typography/Text/Text"
import { useTokenBalance } from "api/balances"

const hydraUsdtAssetId = "10"

const ahUsdtToken = assethub.assetsData.get("usdt")

type MemepadFormStep1Props = {
  form: UseFormReturn<MemepadStep1Values>
}

export const MemepadFormStep1: FC<MemepadFormStep1Props> = ({ form }) => {
  const { t } = useTranslation()

  const { account } = useAccount()

  const { data: usdtBalance } = useTokenBalance(
    hydraUsdtAssetId,
    account?.address ?? "",
  )

  const { data: ahNativeBalance } = useAssetHubNativeBalance(account?.address)
  const { data: ahUsdtBalance } = useAssetHubTokenBalance(
    ahUsdtToken?.id?.toString() ?? "",
    account?.address ?? "",
  )

  const { summary } = useMemepadFormContext()

  const isCreated = !!summary?.id

  if (isCreated) {
    return (
      <MemepadSpinner
        isSuccess
        title={t("memepad.form.spinner.create.success.title")}
        description={t("memepad.form.spinner.create.success.description")}
      />
    )
  }

  return (
    <form autoComplete="off">
      <div sx={{ flex: "column", gap: 8 }}>
        <input
          type="hidden"
          {...form.register("origin", { valueAsNumber: true })}
        />
        <input
          type="hidden"
          {...form.register("decimals", { valueAsNumber: true })}
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

        <div>
          <SRowItem>
            <Text fs={14} color="basic400">
              Asset Hub DOT
            </Text>
            <Text fs={14}>
              {t("value.tokenWithSymbol", {
                value: ahNativeBalance?.balance,
                symbol: assethubNativeToken?.asset.originSymbol,
                fixedPointScale: assethubNativeToken.decimals,
              })}
            </Text>
          </SRowItem>
          <SRowItem>
            <Text fs={14} color="basic400">
              Asset Hub USDT
            </Text>
            <Text fs={14}>
              {t("value.tokenWithSymbol", {
                value: ahUsdtBalance?.balance,
                symbol: ahUsdtToken?.asset.originSymbol,
                fixedPointScale: ahUsdtToken?.decimals,
              })}
            </Text>
          </SRowItem>
          <SRowItem css={{ border: "none" }}>
            <Text fs={14} color="basic400">
              Hydration USDT
            </Text>
            <Text fs={14}>
              {t("value.tokenWithSymbol", {
                value: usdtBalance?.balance,
                symbol: ahUsdtToken?.asset.originSymbol,
                fixedPointScale: ahUsdtToken?.decimals,
              })}
            </Text>
          </SRowItem>
        </div>

        {/* <AssetSelect
          id="5"
          title={t("memepad.form.assetCreationCost")}
          withoutMaxBtn
          name="dot-creation-cost"
          value="10"
          balance={ahNativeBalance?.balance}
          balanceLabel={t("balance")}
          onChange={undefinedNoop}
          disabled
        />
        <AssetSelect
          id="10"
          title={t("memepad.form.assetCreationCost")}
          withoutMaxBtn
          name="usdt-creation-cost"
          value="10"
          balance={ahUsdtBalance?.balance}
          balanceLabel={t("balance")}
          onChange={undefinedNoop}
          disabled
        /> */}
      </div>
    </form>
  )
}

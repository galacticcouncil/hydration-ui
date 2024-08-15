import {
  assethubNativeToken,
  useAssetHubNativeBalance,
} from "api/external/assethub"
import { useSpotPrice } from "api/spotPrice"
import BN from "bignumber.js"
import { AssetSelect } from "components/AssetSelect/AssetSelect"
import { InputBox } from "components/Input/InputBox"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { FC } from "react"
import { Controller, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"
import { SRowItem } from "sections/memepad/components/MemepadSummary"
import { MemepadSupplySlider } from "sections/memepad/components/MemepadSupplySlider"
import { MemepadTokenPrice } from "sections/memepad/components/MemepadTokenPrice"
import { useMemepadFormContext } from "sections/memepad/form/MemepadFormContext"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_0 } from "utils/constants"
import {
  DOT_RELAY_CHAIN_ED,
  DOT_RELAY_FEE_BUFFER,
  HYDRA_USDT_ASSET_ID,
  MemepadFormValues,
  useMemepadDryRun,
} from "./MemepadForm.utils"
import Skeleton from "react-loading-skeleton"

type MemepadFormFieldsProps = {
  form: UseFormReturn<MemepadFormValues>
}

export const MemepadFormFields: FC<MemepadFormFieldsProps> = ({ form }) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const { step } = useMemepadFormContext()

  const { account } = useAccount()

  const symbol = form.watch("symbol")
  const supply = form.watch("supply")
  const xykPoolAssetId = form.watch("xykPoolAssetId")
  const xykPoolSupply = form.watch("xykPoolSupply")
  const allocatedSupply = form.watch("allocatedSupply")

  const { data: fees, isLoading: isFeesLoading } = useMemepadDryRun()
  const { data: spotPrice } = useSpotPrice(xykPoolAssetId, HYDRA_USDT_ASSET_ID)
  const { data: ahNativeBalance } = useAssetHubNativeBalance(account?.address)

  const dotBalance = ahNativeBalance?.balance ?? BN_0

  if (step === 1) {
    return (
      <MemepadSpinner
        isSuccess
        title={t("memepad.form.spinner.create.success.title")}
        description={t("memepad.form.spinner.create.success.description")}
      />
    )
  }

  if (step === 2) {
    return (
      <MemepadSpinner
        isSuccess
        title={t("memepad.form.spinner.register.success.title")}
        description={t("memepad.form.spinner.register.success.description")}
      />
    )
  }

  if (step === 3) {
    return (
      <MemepadSpinner
        isSuccess
        title={t("memepad.form.spinner.transfer.success.title")}
        description={t("memepad.form.spinner.transfer.success.description")}
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
          render={({ field, fieldState: { error } }) => (
            <InputBox
              label={t("memepad.form.name")}
              withLabel
              error={error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="symbol"
          control={form.control}
          render={({ field, fieldState: { error } }) => (
            <InputBox
              label={t("memepad.form.symbol")}
              withLabel
              error={error?.message}
              {...field}
            />
          )}
        />
        <Controller
          name="supply"
          control={form.control}
          render={({ field, fieldState: { error } }) => (
            <InputBox
              label={t("memepad.form.supply")}
              withLabel
              error={error?.message}
              {...field}
            />
          )}
        />

        <div
          sx={{ display: ["flex", "grid"], flexDirection: "column", gap: 8 }}
          css={{ gridTemplateColumns: "6fr 5fr" }}
        >
          <Controller
            name="allocatedSupply"
            control={form.control}
            render={({ field, fieldState: { isDirty, error } }) => (
              <MemepadSupplySlider
                label={t("memepad.form.allocatedSupply")}
                totalSupply={supply}
                symbol={symbol}
                onChange={(value) => field.onChange(value)}
                min={1}
                max={100}
                step={1}
                error={
                  isDirty && !!form.formState.touchedFields?.supply
                    ? error?.message
                    : undefined
                }
              />
            )}
          />
          <MemepadTokenPrice
            label={t("memepad.form.initialTokenPrice")}
            symbol={symbol}
            dotPrice={spotPrice?.spotPrice}
            xykPoolSupply={BN(xykPoolSupply)}
            allocatedSupply={BN(allocatedSupply)}
          />
        </div>

        <Controller
          name="xykPoolSupply"
          control={form.control}
          render={({ field, fieldState: { error } }) => (
            <div sx={{ flex: "column" }}>
              <AssetSelect
                id={xykPoolAssetId}
                title={t("memepad.form.xykPoolSupply", {
                  symbol: assets.getAsset(xykPoolAssetId)?.symbol,
                })}
                balance={dotBalance}
                withoutMaxBtn
                balanceLabel={t("memepad.form.balance.label.assethub")}
                error={error?.message}
                {...field}
              />
            </div>
          )}
        />

        <div>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.fee.creation")}:
            </Text>
            <Text fs={14}>
              {isFeesLoading ? (
                <Skeleton width={50} height={12} />
              ) : (
                t("value.tokenWithSymbol", {
                  value: BN(fees?.feeBuffer.amount.toString() ?? "0"),
                  symbol: fees?.feeBuffer.symbol,
                  fixedPointScale: fees?.feeBuffer.decimals,
                })
              )}
            </Text>
          </SRowItem>
          <SRowItem>
            <Text fs={14} color="basic400">
              {t("memepad.fee.transfer")}:
            </Text>
            <Text fs={14}>
              {t("value.tokenWithSymbol", {
                value: DOT_RELAY_CHAIN_ED + DOT_RELAY_FEE_BUFFER,
                symbol: assethubNativeToken?.asset.originSymbol,
              })}
            </Text>
          </SRowItem>
        </div>
      </div>
    </form>
  )
}

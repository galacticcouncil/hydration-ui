import { GradientText } from "components/Typography/GradientText/GradientText"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { FormValues } from "utils/helpers"
import BigNumber from "bignumber.js"
import { SummaryRow } from "components/Summary/SummaryRow"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { Text } from "components/Typography/Text/Text"
import { AssetSelectSkeleton } from "components/AssetSelect/AssetSelectSkeleton"
import Skeleton from "react-loading-skeleton"
import { UnstakeAssetSelect } from "./UnstakeAssetSelect"

const stakeTokenId = "0"

export const Unstake = ({ loading }: { loading: boolean }) => {
  const { t } = useTranslation()

  const { account } = useAccountStore()
  const form = useForm<{ amount: string }>()

  const onSubmit = async (values: FormValues<typeof form>) => {
    console.log("TODO: submitted", values)
  }

  return (
    <div sx={{ flex: "column" }}>
      <GradientText
        gradient="pinkLightBlue"
        fs={19}
        sx={{ width: "fit-content" }}
      >
        {t("staking.dashboard.form.unstake.title")}
      </GradientText>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
          minHeight: "100%",
        }}
      >
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
              maxBalance: (value) => {
                try {
                  if (false) return true
                } catch {}
                return t("liquidity.add.modal.validation.notEnoughBalance")
              },
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) =>
            loading ? (
              <AssetSelectSkeleton
                title={t("staking.dashboard.form.stake.inputTitle")}
                name={name}
                balanceLabel={t("staking.dashboard.form.unstake.balanceLabel")}
              />
            ) : (
              <UnstakeAssetSelect
                title={t("staking.dashboard.form.stake.inputTitle")}
                name={name}
                value={value}
                onChange={onChange}
                assetId={stakeTokenId}
                error={error?.message}
              />
            )
          }
        />
        <SummaryRow
          label={t("staking.dashboard.form.stake.transactionCost")}
          content={
            loading ? <Skeleton height={12} width={30} /> : <Text>TODO</Text>
          }
          /*content={t("value.percentage", {
            value: 0,
          })}*/
        />

        <Separator sx={{ mb: 12 }} />

        {account ? (
          <Button variant="blue" type="submit" disabled={loading}>
            {t("staking.dashboard.form.unstake.button")}
          </Button>
        ) : (
          <WalletConnectButton />
        )}
      </form>
    </div>
  )
}

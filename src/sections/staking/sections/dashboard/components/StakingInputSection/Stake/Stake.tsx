import { GradientText } from "components/Typography/GradientText/GradientText"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useAccountStore } from "state/store"
import { FormValues } from "utils/helpers"
import BigNumber from "bignumber.js"
import { SummaryRow } from "components/Summary/SummaryRow"
import { BN_10 } from "utils/constants"
import { useTokenBalance } from "api/balances"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { Text } from "components/Typography/Text/Text"

const stakeTokenId = "0"

export const Stake = () => {
  const { t } = useTranslation()

  const { account } = useAccountStore()
  const form = useForm<{ amount: string }>()

  const { data: assetBalance } = useTokenBalance(stakeTokenId, account?.address)

  const onSubmit = async (values: FormValues<typeof form>) => {
    console.log("TODO: submitted", values)
  }

  return (
    <div sx={{ flex: "column", gap: 12 }}>
      <GradientText
        gradient="pinkLightBlue"
        fs={19}
        sx={{ width: "fit-content" }}
      >
        {t("staking.dashboard.form.stake.title")}
      </GradientText>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
        sx={{
          flex: "column",
          justify: "space-between",
          gap: 16,
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
                  if (
                    assetBalance?.balance.gte(
                      BigNumber(value).multipliedBy(BN_10.pow(12)),
                    )
                  )
                    return true
                } catch {}
                return t("liquidity.add.modal.validation.notEnoughBalance")
              },
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <WalletTransferAssetSelect
              title={t("wallet.assets.transfer.asset.label_mob")}
              name={name}
              value={value}
              onChange={onChange}
              asset={stakeTokenId}
              error={error?.message}
            />
          )}
        />
        <SummaryRow
          label={t("staking.dashboard.form.stake.transactionCost")}
          content={<Text>TODO</Text>}
          /*content={t("value.percentage", {
            value: 0,
          })}*/
        />

        <Separator />

        {account ? (
          <Button variant="primary" type="submit">
            {t("staking.dashboard.form.stake.button")}
          </Button>
        ) : (
          <WalletConnectButton />
        )}
      </form>
    </div>
  )
}

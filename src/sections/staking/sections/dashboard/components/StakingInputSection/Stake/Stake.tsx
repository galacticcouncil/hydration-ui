import { GradientText } from "components/Typography/GradientText/GradientText"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useAccountStore, useStore } from "state/store"
import { FormValues } from "utils/helpers"
import BigNumber from "bignumber.js"
import { BN_10 } from "utils/constants"
import { useTokenBalance } from "api/balances"
import { Button } from "components/Button/Button"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { AssetSelectSkeleton } from "components/AssetSelect/AssetSelectSkeleton"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { getFixedPointAmount } from "utils/balance"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Spacer } from "components/Spacer/Spacer"

export const Stake = ({
  loading,
  stakingId,
  minStake,
}: {
  loading: boolean
  minStake?: BigNumber
  stakingId?: number
}) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const api = useApiPromise()
  const { createTransaction } = useStore()
  const { account } = useAccountStore()
  const form = useForm<{ amount: string }>()

  const { data: assetBalance } = useTokenBalance(
    loading ? undefined : NATIVE_ASSET_ID,
    account?.address,
  )

  const onSubmit = async (values: FormValues<typeof form>) => {
    const amount = getFixedPointAmount(values.amount, 12).toString()

    const isStakePosition = stakingId != null && false

    if (isStakePosition) {
      await createTransaction({
        tx: api.tx.staking.increaseStake(stakingId, amount),
      })
    } else {
      await createTransaction({ tx: api.tx.staking.stake(amount) })
    }

    await queryClient.refetchQueries({
      queryKey: [
        QUERY_KEYS.staking,
        QUERY_KEYS.circulatingSupply,
        QUERY_KEYS.stakingPosition(stakingId),
      ],
    })
  }

  return (
    <div sx={{ flex: "column" }}>
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
              minStake: (value) => {
                const minStakeValue = minStake?.shiftedBy(-12) ?? 0

                try {
                  if (!new BigNumber(value).lt(minStakeValue ?? 0)) return true
                } catch {}
                return t("staking.dashboard.form.stake.minStakeError", {
                  value: minStakeValue,
                  symbol: "HDX",
                })
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
                balanceLabel={t("selectAsset.balance.label")}
              />
            ) : (
              <WalletTransferAssetSelect
                title={t("staking.dashboard.form.stake.inputTitle")}
                name={name}
                value={value}
                onChange={onChange}
                asset={NATIVE_ASSET_ID}
                error={error?.message}
              />
            )
          }
        />

        <Spacer size={20} />

        {account ? (
          <Button variant="primary" type="submit" disabled={loading}>
            {t("staking.dashboard.form.stake.button")}
          </Button>
        ) : (
          <WalletConnectButton />
        )}
      </form>
    </div>
  )
}

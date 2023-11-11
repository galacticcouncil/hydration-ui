import { GradientText } from "components/Typography/GradientText/GradientText"
import { Controller, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { ToastMessage, useStore } from "state/store"
import { FormValues } from "utils/helpers"
import BigNumber from "bignumber.js"
import { BN_10 } from "utils/constants"
import { Button } from "components/Button/Button"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"
import { AssetSelectSkeleton } from "components/AssetSelect/AssetSelectSkeleton"
import { getFixedPointAmount } from "utils/balance"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Spacer } from "components/Spacer/Spacer"
import { TOAST_MESSAGES } from "state/toasts"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const Stake = ({
  loading,
  positionId,
  minStake,
  balance,
}: {
  loading: boolean
  minStake?: BigNumber
  positionId?: number
  balance: BigNumber
}) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { api, assets } = useRpcProvider()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const form = useForm<{ amount: string }>()

  const onSubmit = async (values: FormValues<typeof form>) => {
    const amount = getFixedPointAmount(values.amount, 12).toString()

    const isStakePosition = positionId != null
    let transaction

    const toast = TOAST_MESSAGES.reduce((memo, type) => {
      const msType = type === "onError" ? "onLoading" : type
      memo[type] = (
        <Trans
          t={t}
          i18nKey={`staking.toasts.${
            isStakePosition ? "increaseStake" : "stake"
          }.${msType}`}
          tOptions={{
            value: BigNumber(values.amount),
          }}
        >
          <span />
          <span className="highlight" />
        </Trans>
      )
      return memo
    }, {} as ToastMessage)

    if (isStakePosition) {
      transaction = await createTransaction(
        {
          tx: api.tx.staking.increaseStake(positionId, amount),
        },
        { toast },
      )
    } else {
      transaction = await createTransaction(
        {
          tx: api.tx.staking.stake(amount),
        },
        { toast },
      )
    }

    if (!transaction.isError) {
      form.reset()
    }

    await queryClient.invalidateQueries(QUERY_KEYS.stake(account?.address))
    await queryClient.invalidateQueries(QUERY_KEYS.circulatingSupply)
    await queryClient.invalidateQueries(
      QUERY_KEYS.tokenBalance(assets.native.id, account?.address),
    )
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
                  if (balance.gte(BigNumber(value).multipliedBy(BN_10.pow(12))))
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
                balance={balance}
                title={t("staking.dashboard.form.stake.inputTitle")}
                name={name}
                value={value}
                onChange={onChange}
                asset={assets.native.id}
                error={error?.message}
                withoutMaxBtn
              />
            )
          }
        />

        <Spacer size={20} />

        {account ? (
          <Button
            variant="primary"
            type="submit"
            disabled={loading || account?.isExternalWalletConnected}
          >
            {positionId == null
              ? t("staking.dashboard.form.stake.button")
              : t("staking.dashboard.form.restake.button")}
          </Button>
        ) : (
          <WalletConnectButton />
        )}
      </form>
    </div>
  )
}

import { GradientText } from "components/Typography/GradientText/GradientText"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { WalletTransferAssetSelect } from "sections/wallet/transfer/WalletTransferAssetSelect"
import { useStore } from "state/store"
import { FormValues } from "utils/helpers"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { AssetSelectSkeleton } from "components/AssetSelect/AssetSelectSkeleton"
import { scale } from "utils/balance"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Spacer } from "components/Spacer/Spacer"
import { createToastMessages } from "state/toasts"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { useProcessedVotesIdsQuery } from "api/staking"
import { useAssets } from "providers/assets"
import { useRefetchAccountAssets } from "api/deposits"
import { useEstimatedFees } from "api/transaction"
import { useCallback } from "react"
import { useIncreaseStake, useStakeValidation } from "./Stake.utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Summary } from "components/Summary/Summary"
import { useDebounce } from "react-use"
import { Text } from "components/Typography/Text/Text"

export const Stake = ({
  loading,
  positionId,
  balance,
  stakedBalance,
}: {
  loading: boolean
  positionId?: number
  balance: BigNumber
  stakedBalance?: BigNumber
}) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { native } = useAssets()
  const { api } = useRpcProvider()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const refetchAccountAssets = useRefetchAccountAssets()
  const { update, diffDays } = useIncreaseStake()

  const validation = useStakeValidation({
    availableBalance: balance,
    stakedBalance,
  })

  const form = useForm<{ amount: string }>({
    mode: "onChange",
    resolver: validation ? zodResolver(validation.zodSchema) : undefined,
  })

  const amount = form.watch("amount")

  useDebounce(
    () => {
      update(
        stakedBalance ? "value" : "stakeValue",
        amount ? scale(amount, native.decimals).toString() : undefined,
      )
    },
    500,
    [amount, stakedBalance],
  )

  const { data: votes } = useProcessedVotesIdsQuery()

  const getExtrinsic = useCallback(
    (amountHuman: string) => {
      const amount = scale(amountHuman, 12).toString()

      const isStakePosition = positionId != null

      if (!isStakePosition) {
        return api.tx.staking.stake(amount)
      }

      if (
        votes &&
        (votes.newProcessedVotesIds.length || votes.oldProcessedVotesIds.length)
      ) {
        return api.tx.utility.batchAll([
          ...votes.oldProcessedVotesIds.map((id) =>
            api.tx.democracy.removeVote(id),
          ),
          ...votes.newProcessedVotesIds.map(({ classId, id }) =>
            api.tx.convictionVoting.removeVote(classId || null, id),
          ),
          api.tx.staking.increaseStake(positionId, amount),
        ])
      }
      return api.tx.staking.increaseStake(positionId, amount)
    },
    [api.tx, positionId, votes],
  )

  const estimatedFees = useEstimatedFees(getExtrinsic("1"))

  const balanceMax =
    estimatedFees.accountCurrencyId === native.id
      ? balance
          .minus(estimatedFees.accountCurrencyFee)
          .minus(native.existentialDeposit)
      : balance

  const onSubmit = async (values: FormValues<typeof form>) => {
    const isStakePosition = positionId != null

    const toast = createToastMessages(
      `staking.toasts.${isStakePosition ? "increaseStake" : "stake"}`,
      {
        t,
        tOptions: { value: BigNumber(values.amount) },
        components: ["span", "span.highlight"],
      },
    )

    const transaction = await createTransaction(
      {
        tx: getExtrinsic(values.amount),
      },
      { toast },
    )

    if (!transaction.isError) {
      form.reset()
    }

    await queryClient.invalidateQueries(QUERY_KEYS.stake(account?.address))
    await queryClient.invalidateQueries(QUERY_KEYS.hdxSupply)
    refetchAccountAssets()
  }

  return (
    <div sx={{ flex: "column" }}>
      <GradientText
        gradient="pinkLightBlue"
        fs={19}
        sx={{ width: "fit-content", py: 16 }}
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
                asset={native.id}
                error={error?.message}
                balanceMax={balanceMax}
              />
            )
          }
        />

        {validation && (
          <Summary
            rows={[
              {
                label: t("staking.dashboard.form.stake.summary.minimum"),
                content: t("value.tokenWithSymbol", {
                  value: BigNumber(validation.value),
                  symbol: native.symbol,
                }),
              },
              ...(diffDays && diffDays !== "0"
                ? [
                    {
                      label: (
                        <Text color="brightBlue200" fs={14}>
                          {t(
                            "staking.dashboard.form.stake.summary.period.label",
                          )}
                        </Text>
                      ),
                      content: (
                        <Text color="brightBlue200" fs={14}>
                          {t(
                            "staking.dashboard.form.stake.summary.period.value",
                            {
                              value: diffDays,
                            },
                          )}
                        </Text>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}

        <Spacer size={20} />

        {account ? (
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !form.formState.isValid}
          >
            {positionId == null
              ? t("staking.dashboard.form.stake.button")
              : t("staking.dashboard.form.restake.button")}
          </Button>
        ) : (
          <Web3ConnectModalButton />
        )}
      </form>
    </div>
  )
}

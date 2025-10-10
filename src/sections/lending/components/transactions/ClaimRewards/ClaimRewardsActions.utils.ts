import { ProtocolAction } from "@aave/contract-helpers"
import { IAaveIncentivesControllerV2__factory } from "@aave/contract-helpers/src/incentive-controller-v2/typechain/IAaveIncentivesControllerV2__factory"
import { H160 } from "@galacticcouncil/sdk"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useBorrowGasEstimation } from "api/borrow"
import { useTransformEvmTxToExtrinsic } from "api/evm"
import { BigNumber as ethersBN } from "ethers"
import { useRpcProvider } from "providers/rpcProvider"
import { TFunction, useTranslation } from "react-i18next"
import { ClaimRewardsActionsProps } from "sections/lending/components/transactions/ClaimRewards/ClaimRewardsActions"
import { Reward } from "sections/lending/helpers/types"
import { useRootStore } from "sections/lending/store/root"
import { getFunctionDefsFromAbi } from "sections/lending/utils/utils"
import {
  useAccount,
  useEvmAccount,
} from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { QUERY_KEYS } from "utils/queryKeys"

export const useClaimMoneyMarketRewards = () => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const queryClient = useQueryClient()
  const { createTransaction } = useStore()
  const { isBound } = useEvmAccount()
  const { account } = useAccount()

  const transformTx = useTransformEvmTxToExtrinsic()
  const { mutateAsync: estimateGasLimit } = useBorrowGasEstimation()
  const claimRewards = useRootStore((state) => state.claimRewards)

  return useMutation({
    mutationFn: async ({
      isWrongNetwork,
      blocked,
      selectedReward,
      claimableUsd,
    }: ClaimRewardsActionsProps) => {
      const claim = await claimRewards({
        isWrongNetwork,
        blocked,
        selectedReward,
        claimableUsd,
      })

      const params = await claim
        ?.find((tx) => tx.txType === "REWARD_ACTION")
        ?.tx()

      if (!params) throw new Error("Claim rewards transaction not found")

      const tx = await estimateGasLimit({
        tx: {
          ...params,
          value: ethersBN.from("0"),
        },
        action: ProtocolAction.claimRewards,
      })

      if (!isBound) {
        return createTransaction(
          {
            tx: api.tx.utility.batchAll([
              api.tx.evmAccounts.bindEvmAddress(),
              api.tx.dispatcher.dispatchEvmCall(transformTx(tx)),
            ]),
          },
          {
            toast: getClaimRewardsToasts(t, selectedReward, claimableUsd),
            onSuccess: () => {
              if (account) {
                queryClient.refetchQueries(
                  QUERY_KEYS.evmAccountBinding(H160.fromSS58(account.address)),
                )
              }
            },
          },
        )
      }

      const abi = getFunctionDefsFromAbi(
        IAaveIncentivesControllerV2__factory.abi,
        selectedReward.symbol === "all" ? "claimAllRewards" : "claimRewards",
      )
      return createTransaction(
        {
          evmTx: {
            data: tx,
            abi,
          },
        },
        {
          toast: getClaimRewardsToasts(t, selectedReward, claimableUsd),
        },
      )
    },
  })
}

const getClaimRewardsToasts = (
  t: TFunction,
  selectedReward: Reward,
  claimableUsd: string,
) =>
  selectedReward?.symbol === "all"
    ? createToastMessages("lending.claimAllRewards.toast", {
        t,
        tOptions: {
          value: claimableUsd,
        },
        components: ["span.highlight"],
      })
    : createToastMessages("lending.claimRewards.toast", {
        t,
        tOptions: {
          symbol: selectedReward.symbol,
          value: selectedReward.balance,
        },
        components: ["span.highlight"],
      })

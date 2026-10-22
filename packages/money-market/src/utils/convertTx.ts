import { ProtocolAction } from "@aave/contract-helpers"
import { IAaveIncentivesControllerV2__factory } from "@aave/contract-helpers/src/incentive-controller-v2/typechain/IAaveIncentivesControllerV2__factory"
import { IPool__factory } from "@aave/contract-helpers/src/v3-pool-contract/typechain/IPool__factory"
import { HexString } from "@galacticcouncil/utils"
import { CallType } from "@galacticcouncil/xc-core"
import { PopulatedTransaction } from "ethers"

import { ExtendedEvmCall } from "@/types"
import { getFunctionDefsFromAbi } from "@/utils/utils"

const CLAIM_ALL_METHOD_HASH = "0xbb492bf5"
const CLAIM_METHOD_HASH = "0x236300dc"

const getAbiMethodByProtocolAction = (action: ProtocolAction) => {
  switch (action) {
    case ProtocolAction.switchBorrowRateMode:
      return "swapBorrowRateMode"
    case ProtocolAction.setUsageAsCollateral:
      return "setUserUseReserveAsCollateral"
    case ProtocolAction.setEModeUsage:
      return "setUserEMode"
    default:
      return action
  }
}

const getPoolTransactionAbi = (action?: ProtocolAction) => {
  if (!action) {
    return ""
  }

  return action
    ? getFunctionDefsFromAbi(
        IPool__factory.abi,
        getAbiMethodByProtocolAction(action),
      )
    : undefined
}

const getClaimTransactionAbi = (tx: PopulatedTransaction) => {
  const factory = IAaveIncentivesControllerV2__factory
  const isClaimAll = tx.data?.startsWith(CLAIM_ALL_METHOD_HASH)
  return isClaimAll
    ? getFunctionDefsFromAbi(factory.abi, "claimAllRewards")
    : getFunctionDefsFromAbi(factory.abi, "claimRewards")
}

export const convertPopulatedTransactionToEvmCall = (
  tx: PopulatedTransaction,
  action?: ProtocolAction,
) => {
  const isClaimTx =
    tx.data?.startsWith(CLAIM_ALL_METHOD_HASH) ||
    tx.data?.startsWith(CLAIM_METHOD_HASH)

  const abi = isClaimTx
    ? getClaimTransactionAbi(tx)
    : getPoolTransactionAbi(action)

  const evmCall: ExtendedEvmCall = {
    data: tx.data ?? "",
    from: tx.from ?? "",
    to: tx.to as HexString,
    type: CallType.Evm,
    abi,
    gasLimit: tx.gasLimit ? BigInt(tx.gasLimit.toString()) : 0n,
    maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas.toString()) : 0n,
    maxPriorityFeePerGas: tx.maxPriorityFeePerGas
      ? BigInt(tx.maxPriorityFeePerGas.toString())
      : 0n,
    dryRun: (() => {}) as ExtendedEvmCall["dryRun"],
  }

  return evmCall
}

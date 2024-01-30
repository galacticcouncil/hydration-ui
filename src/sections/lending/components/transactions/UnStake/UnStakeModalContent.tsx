import { Stake } from "@aave/contract-helpers"
import { normalize, valueToBigNumber } from "@aave/math-utils"

import { Typography } from "@mui/material"
import { parseUnits } from "ethers/lib/utils"
import React, { useRef, useState } from "react"
import { useGeneralStakeUiData } from "sections/lending/hooks/stake/useGeneralStakeUiData"
import { useUserStakeUiData } from "sections/lending/hooks/stake/useUserStakeUiData"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { useRootStore } from "sections/lending/store/root"
import { stakeConfig } from "sections/lending/ui-config/stakeConfig"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"

import { AssetInput } from "sections/lending/components/transactions/AssetInput"
import { TxErrorView } from "sections/lending/components/transactions/FlowCommons/Error"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import { TxModalTitle } from "sections/lending/components/transactions/FlowCommons/TxModalTitle"
import { GasStation } from "sections/lending/components/transactions/GasStation/GasStation"
import { ChangeNetworkWarning } from "sections/lending/components/transactions/Warnings/ChangeNetworkWarning"
import { UnStakeActions } from "./UnStakeActions"

export type UnStakeProps = {
  stakeAssetName: Stake
  icon: string
}

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const UnStakeModalContent = ({ stakeAssetName, icon }: UnStakeProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context()
  const { gasLimit, mainTxState: txState, txError } = useModalContext()
  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const currentNetworkConfig = useRootStore(
    (store) => store.currentNetworkConfig,
  )
  const currentChainId = useRootStore((store) => store.currentChainId)

  const { data: stakeUserResult } = useUserStakeUiData(
    currentMarketData,
    stakeAssetName,
  )
  const { data: stakeGeneralResult } = useGeneralStakeUiData(
    currentMarketData,
    stakeAssetName,
  )

  let stakeData
  if (stakeGeneralResult && Array.isArray(stakeGeneralResult.stakeData)) {
    ;[stakeData] = stakeGeneralResult.stakeData
  }

  let stakeUserData
  if (stakeUserResult && Array.isArray(stakeUserResult.stakeUserData)) {
    ;[stakeUserData] = stakeUserResult.stakeUserData
  }

  // states
  const [_amount, setAmount] = useState("")
  const amountRef = useRef<string>()

  // TODO does this need to change?
  const walletBalance = normalize(stakeUserData?.userCooldownAmount || "0", 18)

  const isMaxSelected = _amount === "-1"
  const amount = isMaxSelected ? walletBalance : _amount

  const handleChange = (value: string) => {
    const maxSelected = value === "-1"
    amountRef.current = maxSelected ? walletBalance : value
    setAmount(value)
  }

  // staking token usd value
  const amountInUsd =
    Number(amount) * Number(normalize(stakeData?.stakeTokenPriceUSD || 1, 18))

  // error handler
  let blockingError: ErrorType | undefined = undefined
  if (valueToBigNumber(amount).gt(walletBalance)) {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <span>Not enough staked balance</span>
      default:
        return null
    }
  }

  // is Network mismatched
  const stakingChain =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === stakeConfig.chainId
      ? currentChainId
      : stakeConfig.chainId
  const isWrongNetwork = connectedChainId !== stakingChain

  const networkConfig = getNetworkConfig(stakingChain)

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />
  }
  if (txState.success)
    return (
      <TxSuccessView
        action={<span>Unstaked</span>}
        amount={amountRef.current}
        symbol={icon}
      />
    )

  return (
    <>
      <TxModalTitle title="Unstake" symbol={icon} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={networkConfig.name}
          chainId={stakingChain}
        />
      )}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={icon}
        assets={[
          {
            balance: walletBalance,
            symbol: icon,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={walletBalance}
        balanceText={<span>Staking balance</span>}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <GasStation gasLimit={parseUnits(gasLimit || "0", "wei")} />

      {txError && <GasEstimationError txError={txError} />}

      <UnStakeActions
        sx={{ mt: "48px" }}
        amountToUnStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={icon}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  )
}

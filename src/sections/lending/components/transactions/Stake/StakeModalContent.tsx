import { Stake } from "@aave/contract-helpers"
import { normalize, valueToBigNumber } from "@aave/math-utils"

import { Typography } from "@mui/material"
import { useRef, useState } from "react"
import { useGeneralStakeUiData } from "sections/lending/hooks/stake/useGeneralStakeUiData"
import { useUserStakeUiData } from "sections/lending/hooks/stake/useUserStakeUiData"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { useRootStore } from "sections/lending/store/root"
import { stakeConfig } from "sections/lending/ui-config/stakeConfig"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"

import { CooldownWarning } from "sections/lending/components/Warnings/CooldownWarning"
import { AssetInput } from "sections/lending/ui/transactions/AssetInput"
import { TxErrorView } from "sections/lending/components/transactions/FlowCommons/Error"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsNumberLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { TxModalTitle } from "sections/lending/components/transactions/FlowCommons/TxModalTitle"
import { ChangeNetworkWarning } from "sections/lending/components/transactions/Warnings/ChangeNetworkWarning"
import { StakeActions } from "./StakeActions"

export type StakeProps = {
  stakeAssetName: Stake
  icon: string
}

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const StakeModalContent = ({ stakeAssetName, icon }: StakeProps) => {
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

  const walletBalance = normalize(
    stakeUserData?.underlyingTokenUserBalance || "0",
    18,
  )

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
        return <span>Not enough balance on your wallet</span>
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
        action={<span>Staked</span>}
        amount={amountRef.current}
        symbol={icon}
      />
    )

  return (
    <>
      <TxModalTitle title="Stake" symbol={icon} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={networkConfig.name}
          chainId={stakingChain}
        />
      )}

      <CooldownWarning />

      <AssetInput
        name="stake-amount"
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={icon}
        assets={[
          {
            balance: walletBalance.toString(),
            symbol: icon,
          },
        ]}
        isMaxSelected={isMaxSelected}
        maxValue={walletBalance.toString()}
        balanceText={<span>Wallet balance</span>}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<span>Staking APR</span>}
          value={Number(stakeData?.stakeApy || "0") / 10000}
          percent
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <StakeActions
        sx={{ mt: "48px" }}
        amountToStake={amount}
        isWrongNetwork={isWrongNetwork}
        symbol={icon}
        blocked={blockingError !== undefined}
        selectedToken={stakeAssetName}
      />
    </>
  )
}

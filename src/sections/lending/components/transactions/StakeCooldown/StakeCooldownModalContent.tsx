import { Stake } from "@aave/contract-helpers"
import { valueToBigNumber } from "@aave/math-utils"
import { ArrowDownIcon } from "@heroicons/react/outline"
import {
  Box,
  Checkbox,
  FormControlLabel,
  SvgIcon,
  Typography,
} from "@mui/material"
import { formatEther, parseUnits } from "ethers/lib/utils"
import React, { useState } from "react"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { Warning } from "sections/lending/components/primitives/Warning"
import { useGeneralStakeUiData } from "sections/lending/hooks/stake/useGeneralStakeUiData"
import { useUserStakeUiData } from "sections/lending/hooks/stake/useUserStakeUiData"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { useRootStore } from "sections/lending/store/root"
import { stakeConfig } from "sections/lending/ui-config/stakeConfig"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"

import { formattedTime, timeText } from "sections/lending/helpers/timeHelper"
import { Link } from "sections/lending/components/primitives/Link"
import { TxErrorView } from "sections/lending/components/transactions/FlowCommons/Error"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import { TxModalTitle } from "sections/lending/components/transactions/FlowCommons/TxModalTitle"
import { GasStation } from "sections/lending/components/transactions/GasStation/GasStation"
import { ChangeNetworkWarning } from "sections/lending/components/transactions/Warnings/ChangeNetworkWarning"
import { StakeCooldownActions } from "./StakeCooldownActions"

export type StakeCooldownProps = {
  stakeAssetName: Stake
}

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  ALREADY_ON_COOLDOWN,
}

export const StakeCooldownModalContent = ({
  stakeAssetName,
}: StakeCooldownProps) => {
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

  // states
  const [cooldownCheck, setCooldownCheck] = useState(false)

  let stakeData
  if (stakeGeneralResult && Array.isArray(stakeGeneralResult.stakeData)) {
    ;[stakeData] = stakeGeneralResult.stakeData
  }

  let stakeUserData
  if (stakeUserResult && Array.isArray(stakeUserResult.stakeUserData)) {
    ;[stakeUserData] = stakeUserResult.stakeUserData
  }

  // Cooldown logic
  const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0
  const stakeUnstakeWindow = stakeData?.stakeUnstakeWindow || 0

  const cooldownPercent = valueToBigNumber(stakeCooldownSeconds)
    .dividedBy(stakeCooldownSeconds + stakeUnstakeWindow)
    .multipliedBy(100)
    .toNumber()
  const unstakeWindowPercent = valueToBigNumber(stakeUnstakeWindow)
    .dividedBy(stakeCooldownSeconds + stakeUnstakeWindow)
    .multipliedBy(100)
    .toNumber()

  const cooldownLineWidth =
    cooldownPercent < 15 ? 15 : cooldownPercent > 85 ? 85 : cooldownPercent
  const unstakeWindowLineWidth =
    unstakeWindowPercent < 15
      ? 15
      : unstakeWindowPercent > 85
      ? 85
      : unstakeWindowPercent

  const stakedAmount = stakeUserData?.stakeTokenRedeemableAmount

  // error handler
  let blockingError: ErrorType | undefined = undefined
  if (stakedAmount === "0") {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <span>Nothing staked</span>
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
    return <TxSuccessView action={<span>Stake cooldown activated</span>} />

  const timeMessage = (time: number) => {
    return `${formattedTime(time)} ${timeText(time)}`
  }

  const handleOnCoolDownCheckBox = () => {
    setCooldownCheck(!cooldownCheck)
  }
  const amountToCooldown = formatEther(
    stakeUserData?.stakeTokenRedeemableAmount || 0,
  )
  return (
    <>
      <TxModalTitle title="Cooldown to unstake" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={networkConfig.name}
          chainId={stakingChain}
        />
      )}
      <Typography variant="description" sx={{ mb: 24 }}>
        <span>
          The cooldown period is {timeMessage(stakeCooldownSeconds)}. After{" "}
          {timeMessage(stakeCooldownSeconds)} of cooldown, you will enter
          unstake window of {timeMessage(stakeUnstakeWindow)}. You will continue
          receiving rewards during cooldown and unstake window.
        </span>{" "}
        <Link
          variant="description"
          href="https://docs.aave.com/faq/migration-and-staking"
          sx={{ textDecoration: "underline" }}
        >
          <span>Learn more</span>
        </Link>
        .
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          pt: "6px",
          pb: "30px",
        }}
      >
        <Typography variant="description" color="text.primary">
          <span>Amount to unstake</span>
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TokenIcon
            symbol={stakeAssetName}
            sx={{ mr: 4, width: 14, height: 14 }}
          />
          <FormattedNumber
            value={amountToCooldown}
            variant="secondary14"
            color="text.primary"
          />
        </Box>
      </Box>

      <Box mb={6}>
        <Box
          sx={{
            width: `${unstakeWindowLineWidth}%`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            ml: "auto",
          }}
        >
          <Typography variant="helperText" mb={1}>
            <span>You unstake here</span>
          </Typography>
          <SvgIcon sx={{ fontSize: "13px" }}>
            <ArrowDownIcon />
          </SvgIcon>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
          <Box
            sx={{
              height: "2px",
              width: `${cooldownLineWidth}%`,
              bgcolor: "error.main",
              position: "relative",
              "&:after": {
                content: "''",
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "error.main",
                width: "2px",
                height: "8px",
                borderRadius: "2px",
              },
            }}
          />
          <Box
            sx={{
              height: "2px",
              width: `${unstakeWindowLineWidth}%`,
              bgcolor: "success.main",
              position: "relative",
              "&:after, &:before": {
                content: "''",
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "success.main",
                width: "2px",
                height: "8px",
                borderRadius: "2px",
              },
              "&:before": {
                left: 0,
              },
              "&:after": {
                right: 0,
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography variant="helperText" mb={1}>
              <span>Cooldown period</span>
            </Typography>
            <Typography variant="subheader2" color="error.main">
              <span>{timeMessage(stakeCooldownSeconds)}</span>
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="helperText" mb={1}>
              <span>Unstake window</span>
            </Typography>
            <Typography variant="subheader2" color="success.main">
              <span>{timeMessage(stakeUnstakeWindow)}</span>
            </Typography>
          </Box>
        </Box>
      </Box>

      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}

      <Warning severity="error">
        <Typography variant="caption">
          <span>
            If you DO NOT unstake within {timeMessage(stakeUnstakeWindow)} of
            unstake window, you will need to activate cooldown process again.
          </span>
        </Typography>
      </Warning>

      <GasStation gasLimit={parseUnits(gasLimit || "0", "wei")} />

      <FormControlLabel
        sx={{ mt: 12 }}
        control={
          <Checkbox
            checked={cooldownCheck}
            onClick={handleOnCoolDownCheckBox}
            inputProps={{ "aria-label": "controlled" }}
            data-cy={`cooldownAcceptCheckbox`}
          />
        }
        label={
          <span>
            I understand how cooldown ({timeMessage(stakeCooldownSeconds)}) and
            unstaking ({timeMessage(stakeUnstakeWindow)}) work
          </span>
        }
      />

      {txError && <GasEstimationError txError={txError} />}

      <StakeCooldownActions
        sx={{ mt: "48px" }}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined || !cooldownCheck}
        selectedToken={stakeAssetName}
        amountToCooldown={amountToCooldown}
      />
    </>
  )
}

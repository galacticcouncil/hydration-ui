import { ProtocolAction } from "@aave/contract-helpers"

import { ToastsConfig } from "@/types"

export type ToastFnParams = {
  value: string
  state?: "on" | "off"
}

export enum CustomToastAction {
  supplyIsolated = "supplyIsolated",
}

type CreateToastsFn = (params: ToastFnParams) => ToastsConfig

const defaultToastFn: CreateToastsFn = () => ({
  submitted: "Submitted transaction...",
  success: "Transaction successful.",
})

export const TOAST_MESSAGES: Record<
  ProtocolAction | CustomToastAction,
  CreateToastsFn
> = {
  [ProtocolAction.default]: defaultToastFn,
  [ProtocolAction.supply]: ({ value }) => ({
    submitted: `Supplying ${value}...`,
    success: `Supplied ${value}.`,
  }),
  [CustomToastAction.supplyIsolated]: ({ value }) => ({
    submitted: `Supplying ${value} and entering isolated mode...`,
    success: `Supplied ${value} and entered isolated mode.`,
  }),
  [ProtocolAction.withdraw]: ({ value }) => ({
    submitted: `Withdrawing ${value}...`,
    success: `Withdrew ${value}.`,
  }),
  [ProtocolAction.borrow]: ({ value }) => ({
    submitted: `Borrowing ${value}...`,
    success: `Borrowed ${value}.`,
  }),
  [ProtocolAction.repay]: ({ value }) => ({
    submitted: `Repaying ${value}...`,
    success: `Repaid ${value}.`,
  }),
  [ProtocolAction.setUsageAsCollateral]: ({ value, state }) => {
    if (state === "on") {
      return {
        submitted: `Enabling ${value} as collateral...`,
        success: `Enabled ${value} as collateral.`,
      }
    }
    return {
      submitted: `Disabling ${value} as collateral...`,
      success: `Disabled ${value} as collateral.`,
    }
  },
  [ProtocolAction.setEModeUsage]: ({ value, state }) => {
    if (state === "on") {
      return {
        submitted: `Enabling ${value} E-Mode...`,
        success: `${value} E-Mode enabled.`,
      }
    }
    return {
      submitted: `Disabling ${value} E-Mode...`,
      success: `${value} E-Mode disabled.`,
    }
  },
  [ProtocolAction.claimRewards]: ({ value }) => ({
    submitted: `Claiming ${value}...`,
    success: `Claimed ${value}.`,
  }),
  // Bellow are AAVE v3 actions that are currently unsupported
  [ProtocolAction.deposit]: defaultToastFn,
  [ProtocolAction.liquidationCall]: defaultToastFn,
  [ProtocolAction.liquidationFlash]: defaultToastFn,
  [ProtocolAction.repayETH]: defaultToastFn,
  [ProtocolAction.repayWithATokens]: defaultToastFn,
  [ProtocolAction.swapCollateral]: defaultToastFn,
  [ProtocolAction.repayCollateral]: defaultToastFn,
  [ProtocolAction.withdrawETH]: defaultToastFn,
  [ProtocolAction.borrowETH]: defaultToastFn,
  [ProtocolAction.migrateV3]: defaultToastFn,
  [ProtocolAction.supplyWithPermit]: defaultToastFn,
  [ProtocolAction.repayWithPermit]: defaultToastFn,
  [ProtocolAction.stakeWithPermit]: defaultToastFn,
  [ProtocolAction.vote]: defaultToastFn,
  [ProtocolAction.approval]: defaultToastFn,
  [ProtocolAction.creditDelegationApproval]: defaultToastFn,
  [ProtocolAction.stake]: defaultToastFn,
  [ProtocolAction.stakeCooldown]: defaultToastFn,
  [ProtocolAction.unstake]: defaultToastFn,
  [ProtocolAction.switchBorrowRateMode]: defaultToastFn,
  [ProtocolAction.governanceDelegation]: defaultToastFn,
  [ProtocolAction.claimRewardsAndStake]: defaultToastFn,
  [ProtocolAction.withdrawAndSwitch]: defaultToastFn,
  [ProtocolAction.batchMetaDelegate]: defaultToastFn,
  [ProtocolAction.updateRepresentatives]: defaultToastFn,
}

export const createProtocolToastFn = (
  action: ProtocolAction | CustomToastAction,
) => TOAST_MESSAGES[action] || defaultToastFn

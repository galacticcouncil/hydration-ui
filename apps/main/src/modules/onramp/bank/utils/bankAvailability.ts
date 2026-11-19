import { ENV } from "@/config/env"

/**
 * Whether the bank flows may render (`VITE_BANK_FLOW_ENABLED`). Every way in
 * checks this (the method buttons, the Deposits nav child, the
 * /portfolio/deposits route, DepositPage/WithdrawPage, BankFlow and
 * BankPortfolio), so a direct URL or a stored page cannot open them when off.
 */
export const isBankFlowEnabled = () => ENV.VITE_BANK_FLOW_ENABLED

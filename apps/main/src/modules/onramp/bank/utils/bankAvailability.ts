import { ENV } from "@/config/env"

/**
 * Whether the bank flows may render. Not in production yet: every way in
 * checks this (the method buttons, the Deposits nav child, the
 * /portfolio/deposits route, DepositPage/WithdrawPage, BankFlow and
 * BankPortfolio), so a direct URL or a stored page cannot open them there.
 */
export const isBankFlowEnabled = () => ENV.VITE_ENV !== "production"

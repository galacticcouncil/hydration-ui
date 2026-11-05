import { RailStatus } from "./deposit.mock"

export type BankProviderHandoffState = "idle" | "away" | "returned"
export type BankProviderHandoffAction =
  | "launch"
  | "return"
  | "check"
  | "continue"
  | "blocked"

type BankProviderHandoffOptions = {
  state: BankProviderHandoffState
  status: RailStatus
  verified: boolean
}

export const getBankProviderHandoffAction = ({
  state,
  status,
  verified,
}: BankProviderHandoffOptions): BankProviderHandoffAction => {
  if (state === "away") return "return"
  if (status === "rejected" || status === "not offered in region")
    return "blocked"
  if (verified && status === "available") return "continue"
  if ((state === "returned" || verified) && status === "in review")
    return "check"
  return "launch"
}

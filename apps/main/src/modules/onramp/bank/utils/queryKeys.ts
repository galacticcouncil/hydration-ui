export const HBR_QUERY_KEY_PREFIX = "hbr"

/**
 * Every HBR key carries the session's H160 second, so one wallet's answers
 * are never shown for another wallet.
 */
const wallet = (h160: string) => [HBR_QUERY_KEY_PREFIX, h160.toLowerCase()]

export const hbrQueryKeys = {
  all: () => [HBR_QUERY_KEY_PREFIX],
  wallet,
  me: (h160: string) => [...wallet(h160), "me"],
  onboarding: (h160: string) => [...wallet(h160), "onboarding"],
  bankAccounts: (h160: string) => [...wallet(h160), "bank-accounts"],
  ramps: (h160: string) => [...wallet(h160), "ramps"],
  ramp: (h160: string, rampId: string) => [...wallet(h160), "ramps", rampId],
  onrampAccounts: (h160: string) => [...wallet(h160), "onramp-accounts"],
  deposits: (h160: string) => [...wallet(h160), "deposits"],
}

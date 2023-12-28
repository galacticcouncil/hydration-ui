import BN from "bignumber.js"

export const REFERRAL_CODE_MAX_LENGTH = 7
export const REFERRAL_CODE_REGEX = /^[a-zA-Z0-9]+$/

export const referralRewards: Record<
  number,
  { referrer: BN; user: BN; threshold: BN }
> = {
  0: { referrer: BN(5), user: BN(10), threshold: BN(0) },
  1: { referrer: BN(10), user: BN(11), threshold: BN(22000) },
  2: { referrer: BN(15), user: BN(12), threshold: BN(222000) },
  3: { referrer: BN(20), user: BN(13), threshold: BN(22000000) },
  4: { referrer: BN(25), user: BN(15), threshold: BN(222000000) },
}

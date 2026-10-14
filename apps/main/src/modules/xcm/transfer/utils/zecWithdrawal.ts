/**
 * NEAR account 1Click refunds a zcash withdrawal to, if its payout fails or
 * the claim lands after the quote's deadline: our multisig, which returns it
 * to the sender by hand.
 */
export const ONE_CLICK_REFUND_ACCOUNT = "hydration.sputnik-dao.near"

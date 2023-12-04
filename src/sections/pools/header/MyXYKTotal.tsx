import { useTokensBalances } from "api/balances"
import { useShareTokens } from "api/xyk"
import { useAccountStore } from "state/store"

export const MyXYKTotal = () => {
  const { account } = useAccountStore()
  const shareTokens = useShareTokens()
  const shareTokensId =
    shareTokens.data?.map((shareToken) => shareToken.shareTokenId) ?? []

  const shareTokensUserPositions = useTokensBalances(
    shareTokensId,
    account?.address,
  )

  return
}

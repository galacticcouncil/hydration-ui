import { useAccountAssets } from "api/deposits"

import { useAccount } from "sections/web3-connect/Web3Connect.utils"

import { prop } from "utils/rx"

import { useMemo } from "react"

export const useNewDepositAssets = (
  assetsBlacklist: ReadonlyArray<string>,
): Array<string> => {
  const { account } = useAccount()
  const { data: accountAssets } = useAccountAssets()

  return useMemo(() => {
    return account && accountAssets?.balances
      ? accountAssets.balances
          .map(prop("assetId"))
          .filter((id) => !assetsBlacklist.includes(id))
      : []
  }, [account, accountAssets?.balances, assetsBlacklist])
}

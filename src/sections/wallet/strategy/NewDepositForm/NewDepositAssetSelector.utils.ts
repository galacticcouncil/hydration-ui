import { useAccountAssets } from "api/deposits"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { prop } from "utils/rx"
import { useMemo } from "react"
import BigNumber from "bignumber.js"
import { DOT_ASSET_ID } from "utils/constants"
import { useAssets } from "providers/assets"

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

export const useNewDepositDefaultAssetId = () => {
  const { data: accountAssets } = useAccountAssets()
  const { getAsset } = useAssets()

  return useMemo(() => {
    if (!accountAssets) return

    const hasDotBalance = new BigNumber(
      accountAssets.accountAssetsMap.get(DOT_ASSET_ID)?.balance?.balance || "0",
    ).gt("0")

    if (hasDotBalance) return DOT_ASSET_ID

    const balances = accountAssets.balances?.filter(({ assetId }) => {
      const asset = getAsset(assetId)
      return asset && asset.isTradable && !asset.isErc20 && !asset.isExternal
    })

    const assetWithBalance = balances?.find(({ balance }) =>
      BigNumber(balance).gt("0"),
    )

    return assetWithBalance?.assetId ?? DOT_ASSET_ID
  }, [accountAssets, getAsset])
}

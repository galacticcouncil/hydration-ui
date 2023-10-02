import { u32 } from "@polkadot/types"
import { TAsset, useAcountAssets } from "api/assetDetails"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { Maybe } from "utils/helpers"
import { Text } from "components/Typography/Text/Text"
import { SAssetsModalHeader } from "./AssetsModal.styled"
import { AssetsModalRow } from "./AssetsModalRow"
import { AssetsModalRowSkeleton } from "./AssetsModalRowSkeleton"
import { useRpcProvider } from "providers/rpcProvider"
import BN from "bignumber.js"
import { TToken } from "api/assetDetails"

type Props = {
  allowedAssets?: Maybe<u32 | string>[]
  onSelect?: (asset: NonNullable<TAsset>) => void
  hideInactiveAssets?: boolean
  allAssets?: boolean
}

type TBalance = ReturnType<typeof useAcountAssets>[number]["balance"]

export const AssetsModalContent = ({
  allowedAssets,
  onSelect,
  hideInactiveAssets,
  allAssets,
}: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()

  const accountAssets = useAcountAssets(account?.address)

  const getAssetBalances = <T extends TAsset>(assets: T[]) => {
    return assets.reduce<{ asset: T; balance: TBalance }[]>((acc, asset) => {
      const balance = accountAssets.find(
        (accountAsset) => accountAsset.asset.id === asset.id,
      )?.balance ?? {
        accountId: account?.address ?? "",
        id: asset.id,
        balance: BN(0),
        total: BN(0),
        freeBalance: BN(0),
      }

      acc.push({ asset, balance })

      return acc
    }, [])
  }

  const tokens = allAssets
    ? getAssetBalances(assets.tokens)
    : accountAssets.filter(
        (accountAsset): accountAsset is { balance: TBalance; asset: TToken } =>
          accountAsset.asset.isToken,
      )

  const allowedTokens =
    allowedAssets != null
      ? tokens.filter(({ asset }) => allowedAssets.includes(asset.id))
      : tokens

  const notAllowedTokens =
    allowedAssets != null
      ? tokens.filter(({ asset }) => !allowedAssets.includes(asset.id))
      : []

  if (!allowedTokens.length)
    return (
      <>
        <SAssetsModalHeader>
          <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
            {t("selectAssets.asset")}
          </Text>
          <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
            {t("selectAssets.your_balance")}
          </Text>
        </SAssetsModalHeader>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <AssetsModalRowSkeleton key={n} />
        ))}
      </>
    )

  return (
    <>
      {!!allowedTokens?.length && (
        <>
          <SAssetsModalHeader>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("selectAssets.asset")}
            </Text>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("selectAssets.your_balance")}
            </Text>
          </SAssetsModalHeader>
          {allowedTokens.map(({ balance, asset }) => (
            <AssetsModalRow
              balance={balance.balance}
              key={asset.id}
              asset={asset}
              spotPriceId={asset.id}
              onClick={(assetData) => onSelect?.(assetData)}
            />
          ))}
        </>
      )}
      {!hideInactiveAssets && !!notAllowedTokens?.length && (
        <>
          <SAssetsModalHeader shadowed>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("selectAssets.asset_without_pair")}
            </Text>
          </SAssetsModalHeader>
          {notAllowedTokens.map(({ balance, asset }) => (
            <AssetsModalRow
              balance={balance.balance}
              key={asset.id}
              asset={asset}
              spotPriceId={asset.id}
            />
          ))}
        </>
      )}
    </>
  )
}

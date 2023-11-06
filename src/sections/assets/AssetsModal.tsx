import { u32 } from "@polkadot/types"
import { TAsset, useAcountAssets } from "api/assetDetails"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { Maybe } from "utils/helpers"
import { Text } from "components/Typography/Text/Text"
import {
  SAssetsModalHeader,
  SAssetsModalSearchWrapper,
} from "./AssetsModal.styled"
import { AssetsModalRow } from "./AssetsModalRow"
import { AssetsModalRowSkeleton } from "./AssetsModalRowSkeleton"
import { useRpcProvider } from "providers/rpcProvider"
import BN from "bignumber.js"
import { TBond } from "api/assetDetails"
import { TToken } from "api/assetDetails"
import { Input } from "components/Input/Input"
import { useState } from "react"
import IconSearch from "assets/icons/IconSearch.svg?react"

type Props = {
  allowedAssets?: Maybe<u32 | string>[]
  onSelect?: (asset: NonNullable<TAsset>) => void
  hideInactiveAssets?: boolean
  allAssets?: boolean
  withBonds?: boolean
}

type TBalance = ReturnType<typeof useAcountAssets>[number]["balance"]

const enabledBonds = import.meta.env.VITE_FF_BONDS_ENABLED === "true"

export const AssetsModalContent = ({
  allowedAssets,
  onSelect,
  hideInactiveAssets,
  allAssets,
  withBonds,
}: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const { account } = useAccountStore()
  const [search, setSearch] = useState("")

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
    ? getAssetBalances([...assets.tokens, ...assets.stableswap])
    : accountAssets.filter(
        (accountAsset): accountAsset is { balance: TBalance; asset: TToken } =>
          accountAsset.asset.isToken || accountAsset.asset.isStableSwap,
      )

  const bonds = allAssets
    ? getAssetBalances(assets.bonds)
    : accountAssets.filter(
        (accountAsset): accountAsset is { balance: TBalance; asset: TBond } =>
          accountAsset.asset.isBond,
      )

  const searchedTokens = tokens.filter((token) =>
    search
      ? token.asset.name.toLowerCase().includes(search.toLowerCase()) ||
        token.asset.symbol.toLowerCase().includes(search.toLowerCase())
      : true,
  )

  const searchedBonds = bonds.filter((token) =>
    search
      ? token.asset.name.toLowerCase().includes(search.toLowerCase()) ||
        token.asset.symbol.toLowerCase().includes(search.toLowerCase())
      : true,
  )

  const allowedTokens =
    allowedAssets != null
      ? searchedTokens.filter(({ asset }) => allowedAssets.includes(asset.id))
      : searchedTokens

  const notAllowedTokens =
    allowedAssets != null
      ? searchedTokens.filter(({ asset }) => !allowedAssets.includes(asset.id))
      : []

  if (!tokens.length)
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
      <SAssetsModalSearchWrapper sx={{ p: 12 }}>
        <IconSearch sx={{ mx: [0, 12] }} />
        <Input
          value={search}
          onChange={setSearch}
          name="search"
          label="x"
          placeholder={t("selectAssets.search")}
        />
      </SAssetsModalSearchWrapper>

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
      {enabledBonds && withBonds && searchedBonds.length && (
        <>
          <SAssetsModalHeader>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("bonds")}
            </Text>
            <Text color="basic700" fw={500} fs={12} tTransform="uppercase">
              {t("selectAssets.your_balance")}
            </Text>
          </SAssetsModalHeader>
          {searchedBonds.map(({ asset, balance }) => (
            <AssetsModalRow
              key={asset.id}
              asset={asset}
              balance={balance.balance}
              spotPriceId={asset.isPast ? asset.assetId : asset.id}
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

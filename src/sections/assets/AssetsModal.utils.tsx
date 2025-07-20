import { Modal } from "components/Modal/Modal"
import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "./AssetsModal"
import { TAsset, TBond, useAssets } from "providers/assets"
import BN from "bignumber.js"
import { useAccountBalances } from "api/deposits"
import { TBalance } from "api/balances"
import { useAssetsPrice } from "state/displayPrice"

interface useAssetsModalProps {
  onSelect?: (asset: NonNullable<TAsset>) => void
  allowedAssets?: string[]
  title?: string
  hideInactiveAssets?: boolean
  allAssets?: boolean
  confirmRequired?: boolean
  defaultSelectedAsssetId?: string
  withExternal?: boolean
}

export const useAssetsModal = ({
  onSelect,
  allowedAssets,
  title,
  hideInactiveAssets,
  allAssets,
  confirmRequired,
  defaultSelectedAsssetId,
  withExternal,
}: useAssetsModalProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleSelect = useCallback(
    (asset: NonNullable<TAsset>) => {
      setIsOpen(false)
      onSelect?.(asset)
    },
    [onSelect],
  )

  const modal = isOpen ? (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onBack={() => setIsOpen(false)}
      title={title || t("selectAsset.title")}
      headerVariant="GeistMono"
      noPadding
      disableCloseOutside
    >
      <AssetsModalContent
        onSelect={handleSelect}
        allowedAssets={allowedAssets}
        hideInactiveAssets={hideInactiveAssets}
        allAssets={allAssets}
        confirmRequired={confirmRequired}
        defaultSelectedAsssetId={defaultSelectedAsssetId}
        withExternal={withExternal}
      />
    </Modal>
  ) : null

  return {
    openModal,
    modal,
    isOpen,
  }
}

type TAssetSelector = {
  meta: TAsset
  balance: string
  displayValue: string
}

const getAssetBalances = (
  assets: TAsset[],
  assetsWithBalance: { meta: TAsset; balance: string; displayValue: string }[],
) =>
  assets.map((asset) => {
    const tokenWithBalance = assetsWithBalance.find(
      (token) => token.meta.id === asset.id,
    )

    return {
      meta: asset,
      balance: tokenWithBalance?.balance ?? "0",
      displayValue: tokenWithBalance?.displayValue ?? "0",
    }
  })

const getValidTokens = (
  assets: TAssetSelector[],
  allowedAssets?: string[],
  search?: string,
) => {
  return assets.reduce<{
    allowed: TAssetSelector[]
    notAllowed: TAssetSelector[]
  }>(
    (acc, token) => {
      if (
        search &&
        !token.meta.name.toLowerCase().includes(search.toLowerCase()) &&
        !token.meta.symbol.toLowerCase().includes(search.toLowerCase())
      ) {
        return acc
      }

      if (!allowedAssets) {
        acc.allowed.push(token)
        return acc
      } else {
        allowedAssets.includes(token.meta.id)
          ? acc.allowed.push(token)
          : acc.notAllowed.push(token)

        return acc
      }
    },

    { allowed: [], notAllowed: [] },
  )
}

export const useAssetsData = ({
  search,
  withExternal,
  withBonds,
  allAssets,
  allowedAssets,
  displayZeroBalance,
}: {
  search?: string
  withExternal?: boolean
  withBonds?: boolean
  allAssets?: boolean
  allowedAssets?: string[]
  displayZeroBalance?: boolean
}) => {
  const {
    external,
    stableswap,
    bonds: bondAssets,
    isBond,
    tokens: tokenAssets,
    erc20,
    getAssetWithFallback,
  } = useAssets()
  const { data } = useAccountBalances()
  const { accountAssetsMap } = data ?? {}

  const {
    tokensWithBalance,
    bondsWithBalance,
    tokensWithBalanceId,
    bondsWithBalanceId,
  } = useMemo(() => {
    const tokensWithBalance: { asset: TAsset; balance: TBalance }[] = []
    const bondsWithBalance: { asset: TAsset; balance: TBalance }[] = []
    const tokensWithBalanceId = []
    const bondsWithBalanceId = []

    if (accountAssetsMap) {
      for (const [, accountAsset] of accountAssetsMap) {
        if (accountAsset.balance) {
          if (
            accountAsset.asset.isToken ||
            accountAsset.asset.isStableSwap ||
            accountAsset.asset.isErc20 ||
            (withExternal
              ? accountAsset.asset.isExternal && !!accountAsset.asset.name
              : false)
          ) {
            tokensWithBalance.push({
              asset: accountAsset.asset,
              balance: accountAsset.balance,
            })
            tokensWithBalanceId.push(accountAsset.asset.id)
          } else if (isBond(accountAsset.asset)) {
            const meta = accountAsset.asset

            bondsWithBalance.push({
              asset: accountAsset.asset,
              balance: accountAsset.balance,
            })
            bondsWithBalanceId.push(
              !meta.isTradable ? meta.underlyingAssetId : meta.id,
            )
          }
        }
      }
    }

    return {
      tokensWithBalance,
      bondsWithBalance,
      tokensWithBalanceId,
      bondsWithBalanceId,
    }
  }, [accountAssetsMap, isBond, withExternal])

  const { getAssetPrice, isLoading } = useAssetsPrice([
    ...tokensWithBalanceId,
    ...(withBonds ? bondsWithBalanceId : []),
  ])

  const tokens = useMemo(() => {
    if (isLoading) return { allowed: [], notAllowed: [] }

    const tokensData = tokensWithBalance.map(
      ({ asset, balance: { transferable } }) => {
        const spotPrice = getAssetPrice(asset.id).price

        const displayValue = BN(transferable)
          .shiftedBy(-asset.decimals)
          .times(spotPrice)
          .toString()

        return { meta: asset, balance: transferable, displayValue }
      },
    )

    let assetsZeroBalance: TAsset[] = []

    if (allAssets) {
      assetsZeroBalance = [
        ...tokenAssets,
        ...stableswap,
        ...(withExternal ? external : []),
        ...erc20,
      ]
    } else if (displayZeroBalance && allowedAssets) {
      assetsZeroBalance = allowedAssets.map((asset) =>
        getAssetWithFallback(asset),
      )
    }

    const tokens = assetsZeroBalance.length
      ? getAssetBalances(assetsZeroBalance, tokensData)
      : tokensData

    return search || allowedAssets
      ? getValidTokens(tokens, allowedAssets, search)
      : { allowed: tokens, notAllowed: [] }
  }, [
    allAssets,
    allowedAssets,
    external,
    search,
    stableswap,
    tokenAssets,
    tokensWithBalance,
    withExternal,
    getAssetPrice,
    isLoading,
    erc20,
    displayZeroBalance,
    getAssetWithFallback,
  ])

  const bonds = useMemo(() => {
    if (isLoading) return { allowed: [], notAllowed: [] }
    const bondsData = bondsWithBalance.map(
      ({ asset, balance: { transferable } }) => {
        const meta = asset as TBond
        const id = !meta.isTradable ? meta.underlyingAssetId : meta.id
        const spotPrice = getAssetPrice(id).price

        const displayValue = BN(transferable)
          .shiftedBy(-asset.decimals)
          .times(spotPrice)
          .toString()

        return { meta: asset, balance: transferable, displayValue }
      },
    )
    const bonds = allAssets
      ? getAssetBalances(bondAssets, bondsData)
      : bondsData

    return search || allowedAssets
      ? getValidTokens(bonds, allowedAssets, search)
      : { allowed: bonds, notAllowed: [] }
  }, [
    allAssets,
    allowedAssets,
    bondAssets,
    bondsWithBalance,
    search,
    getAssetPrice,
    isLoading,
  ])

  return { tokens, bonds, isLoading }
}

import {
  Alert,
  Box,
  Button,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "@galacticcouncil/ui/components"
import { getChainAssetId, getChainId } from "@galacticcouncil/utils"
import { AnyChain } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { FC, memo, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetType, TAssetData } from "@/api/assets"
import { MultichainValuedBalance } from "@/api/portfolio"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { MyAssetsTable } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable"
import { MyAsset } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import { myAssetsMobileSorter } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.utils"
import { PortfolioChainHeader } from "@/modules/portfolio/overview/PortfolioChainHeader"
import { SPortfolioTableWrapper } from "@/modules/portfolio/overview/PortfolioOverview.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

type Props = {
  readonly chain: AnyChain
  readonly balances: ReadonlyArray<MultichainValuedBalance>
  readonly total: string
  readonly isLoading: boolean
  readonly isError: boolean
  readonly refetch: () => void
  readonly searchPhrase: string
  readonly sortingProps: SortingProps
  readonly showDepositAction?: boolean
}

export const PortfolioChainSection: FC<Props> = memo(
  ({
    chain,
    balances,
    total,
    isLoading,
    isError,
    refetch,
    searchPhrase,
    sortingProps,
    showDepositAction = true,
  }) => {
    const { t } = useTranslation(["wallet", "common"])
    const { getAsset } = useAssets()
    const { metadata } = useRpcProvider()
    const [open, setOpen] = useState<boolean | null>(null)

    const data = useMemo(
      () =>
        balances
          .map<MyAsset>(({ balance, assetId, displayValue }) => {
            const amount = toDecimal(balance.amount, balance.decimals)
            const chainId = getChainId(chain)
            const chainAssetId = getChainAssetId(chain, balance).toString()
            const externalIconSrc = chainId
              ? metadata.getAssetLogoSrc(
                  chainId,
                  chainAssetId,
                  chain.ecosystem,
                ) || undefined
              : undefined

            const registryAsset = assetId ? getAsset(assetId) : undefined
            const meta: TAssetData = registryAsset
              ? {
                  ...registryAsset,
                  iconSrc: registryAsset.iconSrc || externalIconSrc,
                  chainSrc: undefined,
                }
              : {
                  id: `${chain.key}-${balance.key}`,
                  existentialDeposit: "0",
                  symbol: balance.symbol,
                  decimals: balance.decimals,
                  name: balance.originSymbol,
                  isTradable: false,
                  isSufficient: false,
                  type: AssetType.Unknown as const,
                  iconSrc: externalIconSrc,
                }

            return {
              ...meta,
              origin: chain,
              xcAssetKey: balance.key,
              total: amount,
              totalDisplay: displayValue ?? undefined,
              transferable: amount,
              transferableDisplay: displayValue ?? undefined,
              canStake: false,
            }
          })
          .filter((asset) => Big(asset.total).gt(0))
          .sort(myAssetsMobileSorter),
      [balances, chain, getAsset, metadata],
    )

    const hasAssets = data.length > 0
    const defaultOpen = isError || (!isLoading && hasAssets)
    const isOpen = open ?? defaultOpen

    return (
      <CollapsibleRoot open={isOpen} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <PortfolioChainHeader
            isExpandable
            name={chain.name}
            chainId={getChainId(chain)}
            ecosystem={chain.ecosystem}
            totalDisplay={
              isError
                ? "—"
                : Big(total).gt(0)
                  ? t("common:currency", { value: total })
                  : undefined
            }
            isLoading={isLoading}
          />
        </CollapsibleTrigger>
        <CollapsibleContent
          forceMount={hasAssets || undefined}
          animationDurationMs={400}
          sx={{ overflow: "hidden" }}
        >
          <Box sx={{ minHeight: 0 }}>
            {isError ? (
              <Box p="m">
                <Alert
                  variant="error"
                  title={t("myAssets.otherChains.error.title", {
                    chain: chain.name,
                  })}
                  action={
                    <Button size="small" variant="tertiary" onClick={refetch}>
                      {t("myAssets.otherChains.error.retry")}
                    </Button>
                  }
                />
              </Box>
            ) : (
              <SPortfolioTableWrapper>
                <MyAssetsTable
                  isReadOnly
                  showDepositAction={showDepositAction}
                  data={data}
                  isLoading={isLoading}
                  searchPhrase={searchPhrase}
                  sortingProps={sortingProps}
                />
              </SPortfolioTableWrapper>
            )}
          </Box>
        </CollapsibleContent>
      </CollapsibleRoot>
    )
  },
)
PortfolioChainSection.displayName = "PortfolioChainSection"

import { CaretDown, Layers } from "@galacticcouncil/ui/assets/icons"
import {
  AssetButton,
  Box,
  Flex,
  Icon,
  LogoSkeleton,
  Paper,
  SearchInput,
  Skeleton,
  Text,
  ToggleGroupItem,
  Tooltip,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import * as Popover from "@radix-ui/react-popover"
import {
  CSSProperties,
  FC,
  PointerEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useTranslation } from "react-i18next"

import { useHydrationDisplayAssetId } from "@/api/xcm"
import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { ChainLogo } from "@/components/ChainLogo"
import { DepositAssetListSkeleton } from "@/modules/onramp/deposit/components/DepositAssetListSkeleton"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { useAssets } from "@/providers/assetsProvider"

import {
  SDepositQuickAssetDropdown,
  SDepositQuickAssetTrigger,
  SDepositQuickChainFilters,
} from "./DepositQuickAssetDropdown.styled"

type AssetNetworkPair = { asset: Asset; chain: AnyChain }
type DepositQuickAssetDropdownProps = {
  items: AssetNetworkPair[]
  selection: AssetNetworkPair | null
  disabled?: boolean
  isLoading?: boolean
  onSelect: (selection: AssetNetworkPair) => void
}

export const DepositQuickAssetDropdown: FC<DepositQuickAssetDropdownProps> = ({
  items,
  selection,
  disabled,
  isLoading = false,
  onSelect,
}) => {
  const { t } = useTranslation(["common", "onramp"])
  const [open, setOpen] = useState(false)
  const [chainKey, setChainKey] = useState("all")
  const [search, setSearch] = useState("")
  const searchRef = useRef<HTMLInputElement>(null)
  const keyboardOpen = useRef(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const [fieldWidth, setFieldWidth] = useState(0)
  const hoverOpen = useRef(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(closeTimer.current), [])
  useLayoutEffect(() => {
    const field = anchorRef.current?.closest("[data-asset-input]")
    if (!field) return
    const measure = () => setFieldWidth(field.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(field)
    return () => observer.disconnect()
  }, [])
  const getDisplayAssetId = useHydrationDisplayAssetId()
  const { getAsset } = useAssets()
  const chains = [
    ...new Map(items.map(({ chain }) => [chain.key, chain])).values(),
  ]
  const assets = useMemo(
    () =>
      items
        .map((item) => {
          const id = getDisplayAssetId(item.asset)
          return {
            ...item,
            key: `${item.chain.key}:${item.asset.key}`,
            name: (id && getAsset(id)?.name) || item.asset.originSymbol,
          }
        })
        .sort((a, b) =>
          a.asset.originSymbol.localeCompare(b.asset.originSymbol),
        ),
    [items, getDisplayAssetId, getAsset],
  )
  const query = search.trim().toLowerCase()
  const visibleAssets = assets.filter(
    ({ asset, chain, name }) =>
      (chainKey === "all" || chain.key === chainKey) &&
      `${asset.originSymbol} ${name} ${chain.name}`
        .toLowerCase()
        .includes(query),
  )
  const allChains = t("onramp:deposit.onchain.allChains")
  const changeOpen = (next: boolean) => {
    if (next && !open) {
      setSearch("")
      setChainKey(selection?.chain.key ?? "all")
    }
    setOpen(next)
  }
  const cancelClose = () => clearTimeout(closeTimer.current)
  const closeOnLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse" || !hoverOpen.current) return
    cancelClose()
    closeTimer.current = setTimeout(() => changeOpen(false), 150)
  }

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <Popover.Anchor asChild>
        <Box ref={anchorRef} width={selection ? undefined : "100%"}>
          <Popover.Trigger
            asChild
            onPointerEnter={(event) => {
              if (selection || disabled || event.pointerType !== "mouse") return
              cancelClose()
              if (!open) {
                hoverOpen.current = true
                keyboardOpen.current = false
                changeOpen(true)
              }
            }}
            onPointerLeave={closeOnLeave}
            onClick={(event) => {
              event.preventDefault()
              cancelClose()
              hoverOpen.current = false
              changeOpen(true)
              if (event.detail === 0 && open) searchRef.current?.focus()
            }}
            onPointerDown={() => {
              keyboardOpen.current = false
            }}
            onKeyDown={() => {
              keyboardOpen.current = true
            }}
          >
            {selection ? (
              <AssetButton
                aria-busy={isLoading}
                aria-label={t("onramp:deposit.quick.selectAssetNetwork")}
                isDisabled={disabled}
                asset={{
                  symbol: selection.asset.originSymbol,
                  icon: <XAssetLogo {...selection} showChainLogo={false} />,
                }}
              />
            ) : (
              <SDepositQuickAssetTrigger
                aria-busy={isLoading}
                variant="muted"
                outline
                size="medium"
                width="100%"
                iconEnd={CaretDown}
                aria-label={t("onramp:deposit.quick.selectAssetNetwork")}
                disabled={disabled}
              >
                <Flex as="span" align="center" gap="base" minWidth={0}>
                  <Text as="span" fs="p5" fw={500} truncate>
                    {isLoading ? (
                      <Skeleton width={180} height="1em" />
                    ) : (
                      t("onramp:deposit.quick.selectAssetNetwork")
                    )}
                  </Text>
                </Flex>
              </SDepositQuickAssetTrigger>
            )}
          </Popover.Trigger>
        </Box>
      </Popover.Anchor>
      <Popover.Portal>
        <SDepositQuickAssetDropdown
          style={
            fieldWidth
              ? ({
                  "--deposit-asset-dropdown-width": `${fieldWidth}px`,
                } as CSSProperties)
              : undefined
          }
          onPointerEnter={cancelClose}
          onPointerLeave={closeOnLeave}
          onPointerDown={() => {
            cancelClose()
            hoverOpen.current = false
          }}
          side="bottom"
          align="start"
          sideOffset={8}
          collisionPadding={16}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            if (keyboardOpen.current) searchRef.current?.focus()
          }}
          aria-label={t("onramp:deposit.quick.selectAssetNetwork")}
        >
          <Paper
            aria-busy={isLoading}
            borderRadius="l"
            p="base"
            display="flex"
            sx={{ flexDirection: "column" }}
            gap="base"
            height={pxToRem(400)}
            maxHeight="var(--radix-popover-content-available-height)"
            data-onramp-step="deposit-quick-asset-dropdown"
          >
            <Box flexShrink={0} sx={{ overflowX: "auto" }}>
              {isLoading ? (
                <Flex gap="base" p="s" aria-hidden>
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <LogoSkeleton key={index} size="small" />
                  ))}
                </Flex>
              ) : (
                <SDepositQuickChainFilters
                  type="single"
                  size="small"
                  aria-label={t("onramp:deposit.quick.network")}
                  value={chainKey}
                  onValueChange={(key) => setChainKey(key || "all")}
                >
                  <Tooltip text={allChains} size="small" asChild>
                    <ToggleGroupItem value="all" aria-label={allChains}>
                      <Icon component={Layers} size="m" />
                    </ToggleGroupItem>
                  </Tooltip>
                  {chains.map((chain) => (
                    <Tooltip
                      key={chain.key}
                      text={chain.name}
                      size="small"
                      asChild
                    >
                      <ToggleGroupItem
                        value={chain.key}
                        aria-label={chain.name}
                      >
                        <ChainLogo
                          ecosystem={chain.ecosystem}
                          chainId={getChainId(chain)}
                          size="small"
                          alt={chain.name}
                        />
                      </ToggleGroupItem>
                    </Tooltip>
                  ))}
                </SDepositQuickChainFilters>
              )}
            </Box>
            <SearchInput
              ref={searchRef}
              customSize="medium"
              variant="standalone"
              clearLabel={t("onramp:deposit.quick.clearSearch")}
              aria-label={t("search.placeholder.assets")}
              placeholder={t("search.placeholder.assets")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {isLoading ? (
              <DepositAssetListSkeleton count={5} showBalance={false} />
            ) : visibleAssets.length ? (
              <VirtualizedList
                items={visibleAssets}
                itemSize={50}
                getItemKey={(index) => visibleAssets[index]!.key}
                sx={{ flex: 1, minHeight: 0 }}
                renderItem={({ asset, chain, name }) => (
                  <AssetListItem
                    asset={asset}
                    chain={chain}
                    symbol={asset.originSymbol}
                    name={chainKey === "all" ? chain.name : name}
                    route={null}
                    isLoading={false}
                    isSelected={
                      selection?.asset.key === asset.key &&
                      selection.chain.key === chain.key
                    }
                    trailingElement={null}
                    onClick={() => {
                      onSelect({ asset, chain })
                      setOpen(false)
                    }}
                  />
                )}
              />
            ) : (
              <AssetSelectEmptyState />
            )}
          </Paper>
        </SDepositQuickAssetDropdown>
      </Popover.Portal>
    </Popover.Root>
  )
}

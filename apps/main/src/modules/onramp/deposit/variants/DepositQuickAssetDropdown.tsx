import { CaretDown, Layers } from "@galacticcouncil/ui/assets/icons"
import {
  AssetButton,
  Box,
  Flex,
  Icon,
  LogoSkeleton,
  Paper,
  SearchInput,
  Text,
  ToggleGroupItem,
  Tooltip,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
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
import { XAssetLogo } from "@/modules/xcm/transfer/components/XAssetLogo"
import { useAssets } from "@/providers/assetsProvider"

import { DepositChainFilterScroll } from "./DepositChainFilterScroll"
import {
  SDepositQuickAssetDropdown,
  SDepositQuickAssetTrigger,
  SDepositQuickChainFilters,
} from "./DepositQuickAssetDropdown.styled"
import { DepositQuickAssetGroupRow } from "./DepositQuickAssetGroupRow"
import {
  DepositAssetNetworkPair,
  DepositQuickAssetGroup,
  groupDepositAssetOptions,
} from "./DepositQuickAssetGroups"

type AssetNetworkPair = DepositAssetNetworkPair
type DepositQuickAssetDropdownProps = {
  items: AssetNetworkPair[]
  selection: AssetNetworkPair | null
  disabled?: boolean
  isLoading?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selection: AssetNetworkPair) => void
  onChooseNetwork: (sources: AssetNetworkPair[]) => void
}

export const DepositQuickAssetDropdown: FC<DepositQuickAssetDropdownProps> = ({
  items,
  selection,
  disabled,
  isLoading = false,
  open,
  onOpenChange: setOpen,
  onSelect,
  onChooseNetwork,
}) => {
  const { t } = useTranslation(["common", "onramp"])
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
  const visibleChainKey = chains.some(({ key }) => key === chainKey)
    ? chainKey
    : "all"
  const groups = useMemo(
    () =>
      groupDepositAssetOptions(
        items.map((item) => {
          const id = getDisplayAssetId(item.asset)
          return {
            ...item,
            name: (id && getAsset(id)?.name) || item.asset.originSymbol,
          }
        }),
        visibleChainKey,
        search,
      ),
    [items, getDisplayAssetId, getAsset, visibleChainKey, search],
  )
  const selectAsset = (group: DepositQuickAssetGroup) => {
    if (group.sources.length > 1) onChooseNetwork(group.sources)
    else onSelect(group.sources[0]!)
    setOpen(false)
  }
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
                aria-label={t("onramp:deposit.quick.selectAssetNetwork")}
                isDisabled={disabled}
                asset={{
                  symbol: selection.asset.originSymbol,
                  icon: <XAssetLogo {...selection} showChainLogo={false} />,
                }}
              />
            ) : (
              <SDepositQuickAssetTrigger
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
                    {t("onramp:deposit.quick.selectAssetNetwork")}
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
            <DepositChainFilterScroll>
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
                  value={visibleChainKey}
                  onValueChange={(key) => {
                    setChainKey(key || "all")
                  }}
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
            </DepositChainFilterScroll>
            <SearchInput
              ref={searchRef}
              customSize="medium"
              variant="standalone"
              clearLabel={t("onramp:deposit.quick.clearSearch")}
              aria-label={t("search.placeholder.assets")}
              placeholder={t("search.placeholder.assets")}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
              }}
            />
            {isLoading ? (
              <DepositAssetListSkeleton count={5} showBalance={false} />
            ) : groups.length ? (
              <VirtualizedList
                items={groups}
                itemSize={50}
                getItemKey={(index) => groups[index]!.key}
                sx={{ flex: 1, minHeight: 0 }}
                renderItem={(group) => (
                  <DepositQuickAssetGroupRow
                    group={group}
                    selection={selection}
                    onSelect={() => selectAsset(group)}
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

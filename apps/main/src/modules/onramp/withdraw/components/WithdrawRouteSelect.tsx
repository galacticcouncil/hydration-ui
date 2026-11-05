import { ChevronRight, Layers, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Input,
  Stack,
  Stepper,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { AssetSelectModalContent } from "@/components/AssetSelectModal"
import { ChainLogo } from "@/components/ChainLogo"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { DepositAssetOption } from "@/modules/onramp/deposit/variants/DepositAssetOption"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useWithdrawDestinationOptions } from "@/modules/onramp/withdraw/hooks/useWithdrawDestinationOptions"
import {
  WithdrawAssetSelection,
  WithdrawDestinationOption,
  WithdrawRecipient,
} from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import { getWithdrawRecipientRoutes } from "@/modules/onramp/withdraw/WithdrawRecipient.utils"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { useAssets } from "@/providers/assetsProvider"

type WithdrawRouteSelectProps = {
  onSelect: (option: WithdrawDestinationOption) => void
  onBack: () => void
  initialSelection?: WithdrawAssetSelection | null
  guided?: boolean
  destinationChainKey?: string | null
  recipient?: WithdrawRecipient
  sourceAssetKey?: string
  editing?: boolean
  embedded?: boolean
}

export const WithdrawRouteSelect: FC<WithdrawRouteSelectProps> = ({
  onSelect,
  onBack,
  initialSelection,
  guided = false,
  sourceAssetKey,
  destinationChainKey,
  recipient,
  editing = false,
  embedded = false,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const allOptions = useWithdrawDestinationOptions()
  const { account: source } = useAccount()
  const options = useMemo(
    () =>
      (recipient
        ? getWithdrawRecipientRoutes(
            allOptions,
            recipient,
            source?.rawAddress ?? "",
          )
        : allOptions
      ).filter(
        (option) =>
          !destinationChainKey ||
          option.destinationChainKey === destinationChainKey,
      ),
    [allOptions, destinationChainKey, recipient, source?.rawAddress],
  )
  const { getAsset } = useAssets()
  const [assetKey, setAssetKey] = useState(
    sourceAssetKey ??
      (editing ? null : initialSelection?.sourceAssetKey) ??
      null,
  )
  const { isMobile } = useBreakpoints()
  const [chainKey, setChainKey] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const groups = useMemo(() => {
    const grouped = new Map<string, WithdrawDestinationOption[]>()
    for (const option of options) {
      const group = grouped.get(option.sourceAssetKey)
      if (group) group.push(option)
      else grouped.set(option.sourceAssetKey, [option])
    }
    return [...grouped.values()]
      .map((routes) => ({
        asset: routes[0]!.sourceAsset,
        assetId: routes[0]!.assetId,
        routes,
      }))
      .sort((a, b) => a.asset.originSymbol.localeCompare(b.asset.originSymbol))
  }, [options])
  const selected = groups.find(({ asset }) => asset.key === assetKey)
  const setWalletContentWidth = useOnrampModal(
    (state) => state.setWalletContentWidth,
  )
  useEffect(() => {
    if (embedded || selected) return
    setWalletContentWidth(pxToRem(650))
    return () => setWalletContentWidth(null)
  }, [embedded, selected, setWalletContentWidth])
  const chainItems = [
    ...new Map(
      options.map((option) => [
        option.destinationChainKey,
        option.destinationChain,
      ]),
    ).values(),
  ].map((chain) => ({
    chain,
    assets: options
      .filter((option) => option.destinationChainKey === chain.key)
      .map((option) => option.sourceAsset),
  }))
  const visibleGroups = groups.filter(
    (group) =>
      !chainKey ||
      group.routes.some((route) => route.destinationChainKey === chainKey),
  )
  const selectingDestinationAsset =
    !!selected &&
    selected.routes.length > 1 &&
    new Set(selected.routes.map((route) => route.destinationChainKey)).size ===
      1
  const query = search.trim().toLowerCase()
  const routes =
    selected?.routes.filter(
      ({ destinationChain, destinationAsset }) =>
        (!chainKey || destinationChain.key === chainKey) &&
        `${destinationChain.name} ${destinationAsset.originSymbol}`
          .toLowerCase()
          .includes(query),
    ) ?? []
  const back = () => {
    if (sourceAssetKey || editing) {
      onBack()
      return
    }
    if (selected) {
      setAssetKey(null)
      setSearch("")
    } else onBack()
  }

  if (!selected)
    return (
      <>
        <SOnrampStepHeader
          title={t("withdraw.onchain.asset.title")}
          align="center"
          closable
          onBack={back}
        />
        <Grid
          columnTemplate={
            isMobile ? `${pxToRem(52)} minmax(0, 1fr)` : "9rem minmax(0, 1fr)"
          }
          gap={isMobile ? "base" : "l"}
          p="m"
          sx={{ minHeight: 0 }}
        >
          <Stack gap="base" justify="flex-start" minWidth={0}>
            <Text fs="p5" color={getToken("text.medium")}>
              {!isMobile && t("common:destination")}
            </Text>
            <Button
              variant={!chainKey ? "accent" : "transparent"}
              outline={!chainKey}
              onClick={() => setChainKey(null)}
              aria-label={t("deposit.onchain.allChains")}
            >
              {isMobile ? (
                <Icon component={Layers} size="m" />
              ) : (
                t("deposit.onchain.allChains")
              )}
            </Button>
            <ChainList
              items={chainItems}
              selectedChain={
                chainItems.find(({ chain }) => chain.key === chainKey)?.chain ??
                null
              }
              setSelectedChain={(chain) => setChainKey(chain?.key ?? null)}
            />
          </Stack>
          <Box
            sx={{
              minHeight: 0,
              overflowY: "auto",
              maxHeight: "min(500px, 65dvh)",
            }}
          >
            <AssetSelectModalContent
              searchInputVariant="standalone"
              height={450}
              selectedAssetId={initialSelection?.assetId}
              assets={visibleGroups.flatMap(({ assetId }) => {
                const asset = getAsset(assetId)
                return asset ? [asset] : []
              })}
              onSelect={(asset) => {
                const group = groups.find(({ assetId }) => assetId === asset.id)
                if (!group) return
                const matchingRoutes = group.routes.filter(
                  (route) =>
                    !chainKey || route.destinationChainKey === chainKey,
                )
                if (matchingRoutes.length === 1) onSelect(matchingRoutes[0]!)
                else setAssetKey(group.asset.key)
                setSearch("")
              }}
            />
          </Box>
        </Grid>
      </>
    )

  return (
    <>
      {embedded ? (
        <Button
          variant="muted"
          size="small"
          onClick={back}
          sx={{ alignSelf: "flex-start" }}
        >
          {t("common:back")}
        </Button>
      ) : (
        <SOnrampStepHeader
          title={t(
            selectingDestinationAsset
              ? "common:selectAsset"
              : selected
                ? "withdraw.guided.network.title"
                : "withdraw.onchain.asset.title",
          )}
          align="center"
          closable
          onBack={back}
        />
      )}
      <DepositScrollBody contained>
        <Stack
          data-onramp-step-body
          gap="l"
          justify="flex-start"
          data-onramp-step={
            selectingDestinationAsset
              ? "withdraw-route-destination-assets"
              : selected
                ? "withdraw-route-networks"
                : "withdraw-route-assets"
          }
        >
          {guided && (
            <Stepper
              compact
              steps={[
                t("withdraw.guided.step.asset"),
                t(
                  selectingDestinationAsset
                    ? "common:destination"
                    : "withdraw.guided.step.network",
                ),
                t("withdraw.guided.step.withdraw"),
              ]}
              activeStepIndex={selected ? 1 : 0}
            />
          )}
          <Stack gap="s" justify="flex-start">
            <Text
              as="h3"
              fs="h7"
              fw={500}
              font="primary"
              align={
                selected && !selectingDestinationAsset ? "center" : undefined
              }
            >
              {selectingDestinationAsset
                ? t("common:selectAsset")
                : selected
                  ? t("withdraw.guided.network.heading", {
                      symbol: selected.asset.originSymbol,
                    })
                  : t("withdraw.guided.asset.heading")}
            </Text>
            {(!selected || selectingDestinationAsset) && (
              <Text fs="p4" color={getToken("text.medium")}>
                {selectingDestinationAsset
                  ? t("deposit.v3.amount.receiveTo", {
                      chain: selected.routes[0]!.destinationChain.name,
                    })
                  : t(
                      selected
                        ? "withdraw.guided.network.description"
                        : "withdraw.entry.description",
                    )}
              </Text>
            )}
          </Stack>
          {(!selected || selectingDestinationAsset) && (
            <Input
              iconStart={Search}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("common:search.placeholder.assets")}
              aria-label={t("common:search.placeholder.assets")}
            />
          )}
          <Stack gap="s" justify="flex-start">
            {routes.map((option) =>
              selectingDestinationAsset ? (
                <DepositAssetOption
                  key={`${option.sourceAssetKey}:${option.destinationChainKey}:${option.destinationAssetKey}`}
                  asset={option.destinationAsset}
                  chain={option.destinationChain}
                  isSelected={
                    initialSelection?.sourceAssetKey ===
                      option.sourceAssetKey &&
                    initialSelection.destinationChainKey ===
                      option.destinationChainKey &&
                    initialSelection.destinationAssetKey ===
                      option.destinationAssetKey
                  }
                  onSelect={() => onSelect(option)}
                />
              ) : (
                <Button
                  key={`${option.sourceAssetKey}:${option.destinationChainKey}:${option.destinationAssetKey}`}
                  variant="ghost"
                  width="100%"
                  aria-pressed={
                    initialSelection?.sourceAssetKey ===
                      option.sourceAssetKey &&
                    initialSelection.destinationChainKey ===
                      option.destinationChainKey &&
                    initialSelection.destinationAssetKey ===
                      option.destinationAssetKey
                  }
                  onClick={() => onSelect(option)}
                  sx={{
                    height: "auto",
                    px: "m",
                    py: "m",
                    borderRadius: "m",
                    gridTemplateColumns: "minmax(0, 1fr)",
                  }}
                >
                  <Flex gap="m" align="center" width="100%">
                    <ChainLogo
                      ecosystem={option.destinationChain.ecosystem}
                      chainId={getChainId(option.destinationChain)}
                      alt={option.destinationChain.name}
                    />
                    <Stack gap="s" flex={1} align="start">
                      <Text fs="p3" fw={500}>
                        {option.destinationChain.name}
                      </Text>
                      {(selected.routes.filter(
                        ({ destinationChainKey }) =>
                          destinationChainKey === option.destinationChainKey,
                      ).length > 1 ||
                        selected.asset.originSymbol !==
                          option.destinationAsset.originSymbol) && (
                        <Text fs="p5" color={getToken("text.medium")}>
                          {option.destinationAsset.originSymbol}
                        </Text>
                      )}
                    </Stack>
                    <Icon component={ChevronRight} size="m" />
                  </Flex>
                </Button>
              ),
            )}
            {!routes.length && <AssetSelectEmptyState />}
          </Stack>
        </Stack>
      </DepositScrollBody>
    </>
  )
}

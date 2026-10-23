import { ChevronRight, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Input,
  Stack,
  Stepper,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getChainId, HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { ChainLogo } from "@/components/ChainLogo"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { DepositAssetOption } from "@/modules/onramp/deposit/variants/DepositAssetOption"
import { useWithdrawDestinationOptions } from "@/modules/onramp/withdraw/hooks/useWithdrawDestinationOptions"
import {
  WithdrawAssetSelection,
  WithdrawDestinationOption,
} from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import { useAssets } from "@/providers/assetsProvider"

type WithdrawRouteSelectProps = {
  onSelect: (option: WithdrawDestinationOption) => void
  onBack: () => void
  initialSelection?: WithdrawAssetSelection | null
  guided?: boolean
}

export const WithdrawRouteSelect: FC<WithdrawRouteSelectProps> = ({
  onSelect,
  onBack,
  initialSelection,
  guided = false,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const options = useWithdrawDestinationOptions()
  const { getAsset } = useAssets()
  const [assetKey, setAssetKey] = useState(
    initialSelection?.sourceAssetKey ?? null,
  )
  const [search, setSearch] = useState("")
  const hydration = chainsMap.get(HYDRATION_CHAIN_KEY)
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
  const query = search.trim().toLowerCase()
  const assets = groups.filter(({ asset, assetId }) => {
    const metadata = getAsset(assetId)
    return `${asset.originSymbol} ${metadata?.name ?? ""} ${metadata?.symbol ?? ""}`
      .toLowerCase()
      .includes(query)
  })
  const routes =
    selected?.routes.filter(({ destinationChain, destinationAsset }) =>
      `${destinationChain.name} ${destinationAsset.originSymbol}`
        .toLowerCase()
        .includes(query),
    ) ?? []
  const back = () => {
    if (selected) {
      setAssetKey(null)
      setSearch("")
    } else onBack()
  }

  return (
    <>
      <SOnrampStepHeader
        title={t(
          selected
            ? "withdraw.guided.network.title"
            : "withdraw.onchain.asset.title",
        )}
        align="center"
        closable
        onBack={back}
      />
      <DepositScrollBody contained>
        <Stack
          gap="l"
          justify="flex-start"
          data-onramp-step={
            selected ? "withdraw-route-networks" : "withdraw-route-assets"
          }
        >
          {guided && (
            <Stepper
              compact
              steps={[
                t("withdraw.guided.step.asset"),
                t("withdraw.guided.step.network"),
                t("withdraw.guided.step.withdraw"),
              ]}
              activeStepIndex={selected ? 1 : 0}
            />
          )}
          <Stack gap="s" justify="flex-start">
            <Text as="h3" fs="h7" fw={500}>
              {selected
                ? t("withdraw.guided.network.heading", {
                    symbol: selected.asset.originSymbol,
                  })
                : t("withdraw.guided.asset.heading")}
            </Text>
            <Text fs="p4" color={getToken("text.medium")}>
              {t(
                selected
                  ? "withdraw.guided.network.description"
                  : "withdraw.entry.description",
              )}
            </Text>
          </Stack>
          <Input
            iconStart={Search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t(
              selected
                ? "common:search.placeholder.chains"
                : "common:search.placeholder.assets",
            )}
            aria-label={t(
              selected
                ? "common:search.placeholder.chains"
                : "common:search.placeholder.assets",
            )}
          />
          <Stack gap="s" justify="flex-start">
            {selected
              ? routes.map((option) => (
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
                ))
              : hydration &&
                assets.map(({ asset }) => (
                  <DepositAssetOption
                    key={asset.key}
                    asset={asset}
                    chain={hydration}
                    onSelect={() => {
                      setAssetKey(asset.key)
                      setSearch("")
                    }}
                  />
                ))}
            {!(selected ? routes : assets).length && <AssetSelectEmptyState />}
          </Stack>
        </Stack>
      </DepositScrollBody>
    </>
  )
}

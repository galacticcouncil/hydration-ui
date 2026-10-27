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
import { getChainId } from "@galacticcouncil/utils"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { withHydrationDepositSource } from "@/modules/onramp/deposit/DepositLocalSource.utils"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"

import { DepositAssetOption } from "./DepositAssetOption"

export const DepositGuidedAsset: FC = () => {
  const { t } = useTranslation("onramp")
  const { sourceChainAssetPairs: crossChainPairs } = useXcmProvider()
  const sourceChainAssetPairs = withHydrationDepositSource(crossChainPairs)
  const { getValues, reset } = useFormContext<XcmFormValues>()
  const intent = useDepositJourneyStore((state) => state.assetIntent)
  const [assetKey, setAssetKey] = useState<string | null>(() =>
    intent &&
    sourceChainAssetPairs.filter(({ assets }) =>
      assets.some((asset) => asset.key === intent.assetKey),
    ).length > 1
      ? intent.assetKey
      : null,
  )
  const [search, setSearch] = useState("")
  const assets = [
    ...new Map(
      sourceChainAssetPairs.flatMap(({ chain, assets }) =>
        assets.map((asset) => [asset.key, { asset, chain }] as const),
      ),
    ).values(),
  ]
    .sort((a, b) => a.asset.originSymbol.localeCompare(b.asset.originSymbol))
    .map((item) => ({
      ...item,
      supportedNetworks: sourceChainAssetPairs
        .filter(({ assets }) =>
          assets.some((asset) => asset.key === item.asset.key),
        )
        .map(({ chain }) => chain),
    }))
  const selected = assets.find(({ asset }) => asset.key === assetKey)
  const networks = sourceChainAssetPairs.filter(({ assets }) =>
    assets.some((asset) => asset.key === selected?.asset.key),
  )
  const query = search.trim().toLowerCase()
  const visibleAssets = assets.filter(({ asset }) =>
    `${asset.originSymbol} ${asset.key}`.toLowerCase().includes(query),
  )
  const visibleNetworks = networks.filter(({ chain }) =>
    `${chain.name} ${chain.key}`.toLowerCase().includes(query),
  )
  const selectNetwork = (assetKey: string, chainKey: string) => {
    reset({
      ...getValues(),
      srcChain: null,
      srcAsset: null,
      srcAmount: "",
      destAsset: null,
      destAmount: "",
      bridgeProvider: null,
    })
    useDepositJourneyStore.getState().setAssetIntent({ assetKey, chainKey })
  }
  const back = () => {
    if (selected) {
      setAssetKey(null)
      setSearch("")
    } else useOnrampModal.getState().setModal("deposit")
  }
  return (
    <>
      <SDepositStepHeader
        title={t(
          selected
            ? "deposit.guided.networkTitle"
            : "deposit.guided.assetTitle",
        )}
        align="center"
        closable
        onBack={back}
      />
      <DepositScrollBody>
        <Stack
          data-onramp-step={
            selected ? "deposit-guided-network" : "deposit-guided-asset"
          }
          gap="l"
          justify="flex-start"
        >
          <Stepper
            compact
            steps={[
              t("deposit.guided.step.asset"),
              t("deposit.guided.step.network"),
              t("deposit.guided.step.deposit"),
            ]}
            activeStepIndex={selected ? 1 : 0}
          />
          <Stack gap="s" justify="flex-start">
            <Text as="h3" fs="h7" fw={500} font="primary">
              {selected
                ? t("deposit.guided.networkHeading", {
                    symbol: selected.asset.originSymbol,
                  })
                : t("deposit.guided.assetHeading")}
            </Text>
            <Text fs="p4" color={getToken("text.medium")}>
              {t(
                selected
                  ? "deposit.guided.networkDescription"
                  : "deposit.guided.assetDescription",
              )}
            </Text>
          </Stack>
          <Input
            iconStart={Search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t(
              selected
                ? "deposit.guided.searchNetworks"
                : "deposit.guided.searchAssets",
            )}
            aria-label={t(
              selected
                ? "deposit.guided.searchNetworks"
                : "deposit.guided.searchAssets",
            )}
          />
          <Stack gap="s" justify="flex-start">
            {selected
              ? visibleNetworks.map(({ chain }) => (
                  <Button
                    key={chain.key}
                    variant="ghost"
                    width="100%"
                    onClick={() => selectNetwork(selected.asset.key, chain.key)}
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
                        ecosystem={chain.ecosystem}
                        chainId={getChainId(chain)}
                      />
                      <Stack gap="s" flex={1} align="start">
                        <Text fs="p3" fw={500} color={getToken("text.high")}>
                          {chain.name}
                        </Text>
                      </Stack>
                      <Icon component={ChevronRight} size="m" />
                    </Flex>
                  </Button>
                ))
              : visibleAssets.map(({ asset, chain, supportedNetworks }) => (
                  <DepositAssetOption
                    key={asset.key}
                    asset={asset}
                    chain={chain}
                    supportedNetworks={supportedNetworks}
                    onSelect={() => {
                      if (supportedNetworks.length === 1) {
                        selectNetwork(asset.key, supportedNetworks[0]!.key)
                      } else {
                        setAssetKey(asset.key)
                        setSearch("")
                      }
                    }}
                  />
                ))}
            {!(selected ? visibleNetworks : visibleAssets).length && (
              <Text
                fs="p4"
                color={getToken("text.medium")}
                align="center"
                py="l"
              >
                {t("deposit.guided.emptySearch")}
              </Text>
            )}
          </Stack>
        </Stack>
      </DepositScrollBody>
    </>
  )
}

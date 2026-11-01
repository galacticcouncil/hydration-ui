import { Layers, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Grid,
  Icon,
  Input,
  ModalBody,
  ModalFooter,
  ScrollArea,
  Stack,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { DepositAssetListSkeleton } from "@/modules/onramp/deposit/components/DepositAssetListSkeleton"
import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { useDepositAccounts } from "@/modules/onramp/deposit/hooks/useDepositAccounts"
import { useDepositJourneyStore } from "@/modules/onramp/deposit/store/useDepositJourneyStore"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useAssets } from "@/providers/assetsProvider"

export const DepositAssetCatalog = () => {
  const { t } = useTranslation(["onramp", "common"])
  const { sourceChainAssetPairs } = useXcmProvider()
  const isLoading = useAssets().all.size === 0
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const accounts = useDepositAccounts()
  const { setValue } = useFormContext<XcmFormValues>()
  const intent = useDepositJourneyStore((state) => state.assetIntent)
  const [chainKey, setChainKey] = useState<string | null>(() =>
    isMobile ? (intent?.chainKey ?? null) : null,
  )
  const [mobileStep, setMobileStep] = useState<"chains" | "assets">("assets")
  const showChainScreen = isMobile && mobileStep === "chains"
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const chains = sourceChainAssetPairs.filter(
    ({ chain }) =>
      (isMobile && !showChainScreen) ||
      `${chain.name} ${chain.key}`
        .toLowerCase()
        .includes(chainSearch.trim().toLowerCase()),
  )
  const items = chains
    .filter(({ chain }) => !chainKey || chainKey === chain.key)
    .flatMap(({ chain, assets }) =>
      assets
        .filter((asset) =>
          `${asset.originSymbol} ${asset.key} ${chain.name}`
            .toLowerCase()
            .includes(assetSearch.trim().toLowerCase()),
        )
        .map((asset) => ({ asset, chain, key: `${chain.key}:${asset.key}` })),
    )
  return (
    <>
      <SDepositStepHeader
        title={t(
          isMobile
            ? showChainScreen
              ? "common:selectChain"
              : "common:selectAsset"
            : "deposit.catalog.title",
        )}
        description={isMobile ? undefined : t("deposit.catalog.description")}
        align="center"
        closable
        onBack={() => {
          if (isMobile && !showChainScreen) {
            setMobileStep("chains")
            return
          }
          useDepositJourneyStore.getState().leave()
          useOnrampStore.getState().paginateTo(OnrampScreen.MethodSelect)
          useOnrampModal.getState().setModal("deposit")
        }}
      />
      <ModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Grid
          data-onramp-step={`deposit-catalog-${showChainScreen ? "chains" : "assets"}`}
          columnTemplate={
            showChainScreen
              ? "minmax(0, 1fr)"
              : isMobile
                ? `${pxToRem(52)} minmax(0, 1fr)`
                : "9rem minmax(0, 1fr)"
          }
          gap={isMobile ? "base" : "l"}
          p={isMobile ? "base" : "m"}
          height={isMobile ? "100%" : pxToRem(450)}
          flex={1}
          sx={{ minHeight: 0 }}
        >
          <Stack
            gap="base"
            justify="flex-start"
            minWidth={0}
            sx={{ minHeight: 0 }}
          >
            {isMobile && !showChainScreen && (
              <Button
                variant="transparent"
                size="small"
                aria-label={t("common:selectChain")}
                onClick={() => setMobileStep("chains")}
                sx={{ px: 0 }}
              >
                {t("deposit.onchain.chains")}
              </Button>
            )}
            {(!isMobile || showChainScreen) && (
              <Input
                iconStart={Search}
                placeholder={t("deposit.onchain.search.chains")}
                aria-label={t("deposit.onchain.search.chains")}
                value={chainSearch}
                onChange={(event) => setChainSearch(event.target.value)}
              />
            )}
            <Box flex={1} sx={{ minHeight: 0 }}>
              <ScrollArea height="100%">
                <Button
                  variant={chainKey ? "transparent" : "accent"}
                  outline={!chainKey}
                  aria-label={t("deposit.onchain.allChains")}
                  borderRadius={isMobile ? "m" : undefined}
                  height={isMobile ? pxToRem(44) : undefined}
                  minWidth={isMobile ? pxToRem(44) : undefined}
                  width={showChainScreen ? "100%" : undefined}
                  onClick={() => {
                    setChainKey(null)
                    setMobileStep("assets")
                  }}
                >
                  {isMobile && !showChainScreen ? (
                    <Icon component={Layers} size="m" />
                  ) : (
                    t("deposit.onchain.allChains")
                  )}
                </Button>
                <ChainList
                  variant={showChainScreen ? "list" : "rail"}
                  items={chains}
                  selectedChain={
                    chains.find(({ chain }) => chain.key === chainKey)?.chain ??
                    null
                  }
                  setSelectedChain={(chain) => {
                    setChainKey(chain?.key ?? null)
                    setMobileStep("assets")
                  }}
                />
              </ScrollArea>
            </Box>
          </Stack>
          {!showChainScreen && (
            <Stack
              gap="base"
              justify="flex-start"
              minWidth={0}
              sx={{ minHeight: 0 }}
            >
              <Input
                iconStart={Search}
                placeholder={t("common:search.placeholder.assets")}
                aria-label={t("common:search.placeholder.assets")}
                value={assetSearch}
                onChange={(event) => setAssetSearch(event.target.value)}
              />
              <Text fs="p5" px="m" color={getToken("text.medium")}>
                {t("deposit.catalog.supported")}
              </Text>
              {isLoading ? (
                <DepositAssetListSkeleton count={5} showBalance={false} />
              ) : items.length ? (
                <VirtualizedList
                  items={items}
                  itemSize={60}
                  getItemKey={(index) => items[index]!.key}
                  sx={{ flex: 1, minHeight: 0 }}
                  renderItem={({ asset, chain }) => (
                    <AssetListItem
                      asset={asset}
                      chain={chain}
                      route={null}
                      symbol={asset.originSymbol}
                      name={chain.name}
                      isLoading={false}
                      isSelected={
                        intent?.chainKey === chain.key &&
                        intent?.assetKey === asset.key
                      }
                      onClick={() => {
                        setValue("srcChain", null)
                        setValue("srcAsset", null)
                        setValue("srcAmount", "")
                        setValue("destAmount", "")
                        setValue("destAsset", null)
                        setValue("bridgeProvider", null)
                        useDepositJourneyStore.getState().setAssetIntent({
                          chainKey: chain.key,
                          assetKey: asset.key,
                        })
                      }}
                    />
                  )}
                />
              ) : (
                <Text fs="p4" align="center" py="l">
                  {t("deposit.cex.search.empty")}
                </Text>
              )}
            </Stack>
          )}
        </Grid>
      </ModalBody>
      <ModalFooter>
        {accounts.length ? (
          <Button
            variant="muted"
            onClick={() => useDepositJourneyStore.getState().discoverAssets()}
          >
            {t("deposit.catalog.useBalances")}
          </Button>
        ) : (
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.catalog.balancesLater")}
          </Text>
        )}
      </ModalFooter>
    </>
  )
}

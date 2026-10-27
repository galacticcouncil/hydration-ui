import { Layers, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Button,
  Flex,
  Grid,
  Icon,
  Input,
  ModalBody,
  ScrollArea,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { isAnyEvmChain } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { AnyChain, ChainEcosystem } from "@galacticcouncil/xc-core"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { SDepositStepHeader } from "@/modules/onramp/deposit/components/DepositStepHeader.styled"
import { canUseDepositAccount } from "@/modules/onramp/deposit/DepositOnchain.utils"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { OnrampScreen } from "@/modules/onramp/types"
import { AssetList } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetList"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { ConnectChainTile } from "@/modules/xcm/transfer/components/ConnectButton/ConnectChainTile"
import { useResetAmounts } from "@/modules/xcm/transfer/hooks/useResetAmounts"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { getXcmFormDefaults } from "@/modules/xcm/transfer/utils/chain"

export const DepositOnchainAsset = () => {
  const { t } = useTranslation(["onramp", "common", "xcm"])
  const { account } = useAccount()
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const { sourceChainAssetPairs } = useXcmProvider()
  const showChainSelector = sourceChainAssetPairs.length !== 1
  const { getValues, setValue } = useFormContext<XcmFormValues>()
  const resetAmounts = useResetAmounts()
  const paginateTo = useOnrampStore((state) => state.paginateTo)
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [filter, setFilter] = useState("all")
  const [pendingChain, setPendingChain] = useState<AnyChain | null>(() => {
    const previous =
      getValues("srcChain") ?? getXcmFormDefaults(account).srcChain
    return (
      sourceChainAssetPairs.find(
        ({ chain }) =>
          chain.key === previous?.key && canUseDepositAccount(account, chain),
      )?.chain ??
      sourceChainAssetPairs.find(({ chain }) =>
        canUseDepositAccount(account, chain),
      )?.chain ??
      previous
    )
  })
  const [allChains, setAllChains] = useState(false)
  const [mobileStep, setMobileStep] = useState<"chains" | "assets">(() =>
    getValues("srcAsset") ? "assets" : "chains",
  )
  const showChainScreen =
    isMobile && showChainSelector && mobileStep === "chains"
  const filteredPairs = sourceChainAssetPairs.filter(({ chain }) => {
    if (!showChainSelector) return true
    const matchesEcosystem =
      filter === "all" ||
      (filter === "polkadot"
        ? chain.ecosystem === ChainEcosystem.Polkadot ||
          chain.ecosystem === ChainEcosystem.Kusama
        : isAnyEvmChain(chain))
    return (
      (isMobile || matchesEcosystem) &&
      (!isMobile || showChainScreen
        ? chain.name.toLowerCase().includes(chainSearch.trim().toLowerCase())
        : true)
    )
  })
  const visiblePairs =
    !showChainSelector || allChains
      ? filteredPairs
      : filteredPairs.filter(({ chain }) => chain.key === pendingChain?.key)

  return (
    <>
      <SDepositStepHeader
        title={t(
          isMobile
            ? showChainScreen
              ? "common:selectChain"
              : "common:selectAsset"
            : "deposit.onchain.asset.title",
        )}
        align="center"
        closable
        onBack={() => {
          if (isMobile && showChainSelector && !showChainScreen)
            setMobileStep("chains")
          else paginateTo(OnrampScreen.DepositOnchainWallet)
        }}
      />
      <ModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Grid
          data-onramp-step={`deposit-current-${showChainScreen ? "chains" : "assets"}`}
          columnTemplate={
            !showChainSelector || showChainScreen
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
          {showChainSelector && (
            <Stack
              gap="base"
              justify="flex-start"
              minWidth={0}
              sx={{ minHeight: 0 }}
            >
              {(!isMobile || showChainScreen) && (
                <Input
                  iconStart={Search}
                  placeholder={t("deposit.onchain.search.chains")}
                  aria-label={t("deposit.onchain.search.chains")}
                  value={chainSearch}
                  onChange={(event) => setChainSearch(event.target.value)}
                />
              )}
              {(!isMobile || showChainScreen) && (
                <Text fs="p4" color={getToken("text.medium")}>
                  {t("deposit.onchain.chains")}
                </Text>
              )}
              <Box flex={1} sx={{ minHeight: 0 }}>
                <ScrollArea height="100%" hideScrollbar>
                  <Button
                    variant={allChains ? "accent" : "transparent"}
                    outline={allChains}
                    aria-label={t("deposit.onchain.allChains")}
                    borderRadius={isMobile ? "m" : undefined}
                    height={isMobile ? pxToRem(44) : undefined}
                    minWidth={isMobile ? pxToRem(44) : undefined}
                    width={showChainScreen ? "100%" : undefined}
                    onClick={() => {
                      setAllChains(true)
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
                    items={filteredPairs}
                    selectedChain={allChains ? null : pendingChain}
                    setSelectedChain={(chain) => {
                      setAllChains(false)
                      setPendingChain(chain)
                      setMobileStep("assets")
                    }}
                  />
                </ScrollArea>
              </Box>
            </Stack>
          )}
          {!showChainScreen && (
            <Stack
              gap="m"
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
              {!isMobile && showChainSelector && (
                <Flex gap="base" wrap>
                  {(["all", "polkadot", "evm"] as const).map((value) => (
                    <Button
                      key={value}
                      variant={filter === value ? "secondary" : "muted"}
                      size="small"
                      minWidth={pxToRem(72)}
                      onClick={() => {
                        setFilter(value)
                        setAllChains(true)
                      }}
                    >
                      {t(`deposit.onchain.filter.${value}`)}
                    </Button>
                  ))}
                </Flex>
              )}
              <Flex justify="space-between" px="l">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("common:asset")}
                </Text>
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("common:balance")}
                </Text>
              </Flex>
              <Box flex={1} sx={{ minHeight: 0 }}>
                <ScrollArea height="100%" hideScrollbar>
                  <Stack gap="m" justify="flex-start">
                    {visiblePairs.map(({ chain, assets }) => {
                      const compatible = canUseDepositAccount(account, chain)
                      const items = assets
                        .filter((asset) =>
                          `${asset.originSymbol} ${asset.key}`
                            .toLowerCase()
                            .includes(assetSearch.trim().toLowerCase()),
                        )
                        .map((asset) => ({
                          asset,
                          route: null,
                          symbol: asset.originSymbol,
                          name: chain.name,
                        }))
                      return (
                        <Stack key={chain.key} gap="base" justify="flex-start">
                          {showChainSelector && allChains && (
                            <Text
                              px="l"
                              fs="p5"
                              color={getToken("text.medium")}
                            >
                              {chain.name}
                            </Text>
                          )}
                          {compatible ? (
                            items.length ? (
                              <AssetList
                                closeOnSelect={false}
                                items={items}
                                address={account.address}
                                selectedChain={chain}
                                selectedAsset={
                                  getValues("srcAsset") ?? undefined
                                }
                                setSelectedAsset={(asset) => {
                                  useOnrampModal
                                    .getState()
                                    .setWalletFirstAsset({
                                      chainKey: chain.key,
                                      assetKey: asset.key,
                                    })
                                  resetAmounts()
                                  setValue("srcChain", chain)
                                  setValue("srcAsset", asset)
                                  paginateTo(OnrampScreen.DepositOnchainForm)
                                }}
                              />
                            ) : (
                              <Text
                                align="center"
                                py="l"
                                fs="p5"
                                color={getToken("text.medium")}
                              >
                                {t("xcm:chainAssetSelect.emptyState.noAssets")}
                              </Text>
                            )
                          ) : (
                            <ConnectChainTile
                              layout="vertical"
                              chain={chain}
                              bg="transparent"
                              onConnect={() =>
                                paginateTo(OnrampScreen.DepositOnchainWallet)
                              }
                            />
                          )}
                        </Stack>
                      )
                    })}
                    {!visiblePairs.length && (
                      <Text
                        align="center"
                        py="l"
                        fs="p5"
                        color={getToken("text.medium")}
                      >
                        {t("xcm:chainAssetSelect.emptyState.noAssets")}
                      </Text>
                    )}
                  </Stack>
                </ScrollArea>
              </Box>
            </Stack>
          )}
        </Grid>
      </ModalBody>
    </>
  )
}

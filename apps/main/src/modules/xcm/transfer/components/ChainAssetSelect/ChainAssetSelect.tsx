import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  Flex,
  Grid,
  Input,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalRoot,
  ModalTrigger,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount, useWeb3ConnectModal } from "@galacticcouncil/web3-connect"
import { AnyChain, Asset, AssetRoute } from "@galacticcouncil/xc-core"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { map, pipe, zip } from "remeda"

import { AssetList } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetList"
import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { ConnectChainTile } from "@/modules/xcm/transfer/components/ConnectButton/ConnectChainTile"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  getWalletModeByChain,
  isAccountValidOnChain,
} from "@/modules/xcm/transfer/utils/chain"

export type ChainAssetPair = {
  chain: AnyChain
  assets: Asset[]
  routes: AssetRoute[]
}

export type ChainAssetSelection = {
  chain: AnyChain
  asset: Asset
}

export type ChainAssetSelectModalSelectionChange = {
  previousSelection: ChainAssetSelection | null
  newSelection: ChainAssetSelection
}

export type ChainAssetSelectModalProps = {
  type: "source" | "destination"
  address?: string
  disabled?: boolean
  chainAssetPairs: ChainAssetPair[]
  currentSelection: ChainAssetSelection | null
  selectedChain: AnyChain | null
  onAssetSelect: (selection: ChainAssetSelection) => void
}

export const ChainAssetSelectModal: React.FC<ChainAssetSelectModalProps> = (
  props,
) => {
  const { t } = useTranslation(["common", "xcm"])
  const { isMobile } = useBreakpoints()
  const Root = isMobile ? DrawerRoot : ModalRoot
  const Header = isMobile ? DrawerHeader : ModalHeader
  const Content = isMobile ? DrawerContent : ModalContent
  const Body = isMobile ? DrawerBody : ModalBody

  return (
    <Root>
      <ModalTrigger asChild>
        <ChainAssetSelectButton
          currentSelection={props.currentSelection}
          disabled={props.disabled}
        />
      </ModalTrigger>
      <Content onInteractOutside={(e) => e.preventDefault()}>
        <Header align="center" title={t("xcm:chainAssetSelect.modal.title")} />
        <Body scrollable={false} noPadding>
          <ChainAssetSelectContent {...props} />
        </Body>
      </Content>
    </Root>
  )
}

export const ChainAssetSelectContent: React.FC<ChainAssetSelectModalProps> = ({
  type,
  address = "",
  chainAssetPairs,
  currentSelection,
  selectedChain,
  onAssetSelect,
}) => {
  const { t } = useTranslation(["common", "xcm"])
  const { account } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const { registryChain } = useXcmProvider()
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [pendingChain, setPendingChain] = useState<AnyChain | null>(
    selectedChain ?? currentSelection?.chain ?? null,
  )

  const filteredChains = chainAssetPairs.filter(
    ({ chain }) =>
      chain.name.toLowerCase().includes(chainSearch.toLowerCase()) ||
      chain.key.toLowerCase().includes(chainSearch.toLowerCase()),
  )

  const selectedChainPair = useMemo(
    () =>
      chainAssetPairs.find(({ chain }) => chain.key === pendingChain?.key) ??
      null,
    [chainAssetPairs, pendingChain],
  )

  const availableAssetsWithRoutes = useMemo(() => {
    const assets = selectedChainPair?.assets ?? []
    const routes = selectedChainPair?.routes ?? []
    if (routes.length === 0) {
      return assets.map((asset) => ({ asset, route: null }))
    }
    return pipe(
      zip(routes, assets),
      map(([route, asset]) => ({ route, asset })),
    )
  }, [selectedChainPair])

  const filteredAssetsWithRoutes = availableAssetsWithRoutes.filter(
    ({ asset }) =>
      asset.originSymbol.toLowerCase().includes(assetSearch.toLowerCase()),
  )

  const isCompatibleWalletMode =
    type === "source"
      ? !!pendingChain && isAccountValidOnChain(account, pendingChain)
      : true

  return (
    <Grid columnTemplate={["64px 1fr", "180px 1fr"]}>
      <Box>
        <Box p={10} visibility={["hidden", "visible"]}>
          <Input
            placeholder={t("xcm:chainAssetSelect.search.chains")}
            iconStart={Search}
            value={chainSearch}
            onChange={(e) => setChainSearch(e.target.value)}
            customSize="large"
            autoComplete="off"
          />
        </Box>
        <ChainList
          items={filteredChains}
          selectedChain={pendingChain}
          setSelectedChain={setPendingChain}
        />
      </Box>
      <Flex direction="column">
        <Box p={10}>
          <Input
            placeholder={t("xcm:chainAssetSelect.search.assets")}
            iconStart={Search}
            value={assetSearch}
            onChange={(e) => setAssetSearch(e.target.value)}
            customSize="large"
            autoComplete="off"
          />
        </Box>
        {pendingChain && (
          <>
            {isCompatibleWalletMode ? (
              <AssetList
                registryChain={registryChain}
                items={filteredAssetsWithRoutes}
                address={address}
                selectedAsset={currentSelection?.asset}
                selectedChain={pendingChain}
                setSelectedAsset={(asset) => {
                  onAssetSelect({ chain: pendingChain, asset })
                }}
              />
            ) : (
              <ConnectChainTile
                p={10}
                chain={pendingChain}
                onConnect={() =>
                  toggle(getWalletModeByChain(pendingChain), {
                    title: t("xcm:connect.modal.title", {
                      chain: pendingChain.name,
                    }),
                    description: t("xcm:connect.modal.description", {
                      chain: pendingChain.name,
                    }),
                  })
                }
              />
            )}
          </>
        )}

        {!filteredAssetsWithRoutes.length && (
          <Flex flex={1} align="center" justify="center">
            <Text align="center" fs="p5" color={getToken("text.medium")}>
              {t("xcm:chainAssetSelect.emptyState.noAssets")}
            </Text>
          </Flex>
        )}
      </Flex>
    </Grid>
  )
}

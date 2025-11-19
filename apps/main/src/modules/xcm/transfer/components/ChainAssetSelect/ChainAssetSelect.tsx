import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
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
import { getToken } from "@galacticcouncil/ui/utils"
import {
  PROVIDERS_BY_WALLET_MODE,
  useAccount,
  useWeb3ConnectModal,
} from "@galacticcouncil/web3-connect"
import { AnyChain, Asset } from "@galacticcouncil/xcm-core"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetList } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetList"
import { ChainAssetSelectButton } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelectButton"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"
import { ConnectChainTile } from "@/modules/xcm/transfer/components/ConnectButton/ConnectChainTile"
import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"

export type ChainAssetPair = {
  chain: AnyChain
  assets: Asset[]
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
  const { type, disabled = false, currentSelection } = props

  const { t } = useTranslation(["common", "xcm"])

  return (
    <ModalRoot>
      <ModalTrigger asChild>
        <ChainAssetSelectButton
          currentSelection={currentSelection}
          disabled={disabled}
          type={type}
        />
      </ModalTrigger>
      <ModalContent onInteractOutside={(e) => e.preventDefault()}>
        <ModalHeader
          align="center"
          title={t("xcm:chainAssetSelect.modal.title")}
        />
        <ModalBody scrollable={false} noPadding>
          <ChainAssetSelectContent {...props} />
        </ModalBody>
      </ModalContent>
    </ModalRoot>
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
  const { account } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const { t } = useTranslation(["common", "xcm"])
  const [chainSearch, setChainSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [pendingChain, setPendingChain] = useState<AnyChain | null>(
    selectedChain ?? currentSelection?.chain ?? null,
  )

  // Filter chains based on search
  const filteredChains = chainAssetPairs.filter(
    ({ chain }) =>
      chain.name.toLowerCase().includes(chainSearch.toLowerCase()) ||
      chain.key.toLowerCase().includes(chainSearch.toLowerCase()),
  )

  // Get assets for the selected chain
  const selectedChainPair = useMemo(
    () =>
      chainAssetPairs.find(({ chain }) => chain.key === pendingChain?.key) ??
      null,
    [chainAssetPairs, pendingChain],
  )
  const availableAssets = useMemo(
    () => selectedChainPair?.assets ?? [],
    [selectedChainPair],
  )

  // Filter assets based on search
  const filteredAssets = availableAssets.filter((asset) =>
    asset.originSymbol.toLowerCase().includes(assetSearch.toLowerCase()),
  )

  const walletMode = pendingChain ? getWalletModeByChain(pendingChain) : null
  const walletModeProviders = walletMode
    ? PROVIDERS_BY_WALLET_MODE[walletMode]
    : []

  const isCompatibleWalletMode =
    type === "source"
      ? !!account && walletModeProviders.includes(account.provider)
      : true
  return (
    <Grid columnTemplate="180px 1fr">
      <Box>
        <Box p={10}>
          <Input
            placeholder={t("xcm:chainAssetSelect.search.chains")}
            iconStart={Search}
            value={chainSearch}
            onChange={(e) => setChainSearch(e.target.value)}
            customSize="large"
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
          />
        </Box>
        {pendingChain && (
          <>
            {isCompatibleWalletMode ? (
              <AssetList
                items={filteredAssets}
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

        {!filteredAssets.length && (
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

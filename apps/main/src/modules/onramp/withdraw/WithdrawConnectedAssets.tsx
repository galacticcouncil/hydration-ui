import { Layers, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
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
  Tooltip,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { DepositAssetListSkeleton } from "@/modules/onramp/deposit/components/DepositAssetListSkeleton"
import { WithdrawRouteSelect } from "@/modules/onramp/withdraw/components/WithdrawRouteSelect"
import { useWithdrawConnectedAssets } from "@/modules/onramp/withdraw/hooks/useWithdrawConnectedAssets"
import { WithdrawAssetSelection } from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"
import type { ChainAssetPair } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainAssetSelect"
import { ChainList } from "@/modules/xcm/transfer/components/ChainAssetSelect/ChainList"

type WithdrawConnectedAssetsProps = {
  onBack: () => void
  onSelect: (selection: WithdrawAssetSelection) => void
}

export const WithdrawConnectedAssets: FC<WithdrawConnectedAssetsProps> = ({
  onBack,
  onSelect,
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const data = useWithdrawConnectedAssets()
  const { isMobile } = useBreakpoints()
  const [chainKey, setChainKey] = useState<string | null>(null)
  const chains = new Map<string, Pick<ChainAssetPair, "chain" | "assets">>()
  for (const row of data.rows)
    for (const route of row.routes) {
      const pair = chains.get(route.destinationChainKey)
      if (pair) {
        if (!pair.assets.some((asset) => asset.key === row.asset.key))
          pair.assets.push(row.asset)
      } else
        chains.set(route.destinationChainKey, {
          chain: route.destinationChain,
          assets: [row.asset],
        })
    }
  const chainPairs = [...chains.values()]
  const selectedChain = chains.get(chainKey ?? "")?.chain ?? null
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const [search, setSearch] = useState("")
  const [assetKey, setAssetKey] = useState<string | null>(null)
  const query = search.trim().toLowerCase()
  const rows = data.rows
    .map((row) => ({
      ...row,
      routes: row.routes.filter(
        (route) => !chainKey || route.destinationChainKey === chainKey,
      ),
    }))
    .filter(
      (row) =>
        row.routes.length > 0 &&
        `${row.asset.originSymbol} ${row.name} ${row.source.account.name}`
          .toLowerCase()
          .includes(query),
    )

  if (assetKey)
    return (
      <WithdrawRouteSelect
        sourceAssetKey={assetKey}
        destinationChainKey={chainKey}
        onBack={() => setAssetKey(null)}
        onSelect={onSelect}
      />
    )

  return (
    <>
      <SOnrampStepHeader
        title={t("withdraw.connected.assets.title")}
        description={t("withdraw.connected.assets.description")}
        align="center"
        closable
        onBack={onBack}
      />
      <ModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Grid
          columnTemplate={
            isMobile ? `${pxToRem(52)} minmax(0, 1fr)` : "9rem minmax(0, 1fr)"
          }
          gap={isMobile ? "base" : "l"}
          px={["l", "xl"]}
          py="m"
          flex={1}
          height={pxToRem(450)}
          sx={{ minHeight: 0 }}
        >
          <Stack
            gap="base"
            justify="flex-start"
            minWidth={0}
            sx={{ minHeight: 0 }}
          >
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
              compact
              fillHeight
              items={chainPairs}
              selectedChain={selectedChain}
              setSelectedChain={(chain) => setChainKey(chain?.key ?? null)}
              getChainName={(chain) =>
                chain.name === "AssetHub Polkadot" ? "Assethub" : chain.name
              }
            />
          </Stack>
          <Stack
            p={0}
            gap="m"
            justify="flex-start"
            flex={1}
            sx={{ minHeight: 0 }}
          >
            <Input
              iconStart={Search}
              placeholder={t("common:search.placeholder.assets")}
              aria-label={t("common:search.placeholder.assets")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Flex justify="space-between" px="m">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("common:asset")}
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("common:balance")}
              </Text>
            </Flex>
            <Box flex={1} sx={{ minHeight: 0 }}>
              <ScrollArea height="100%" hideScrollbar aria-busy={data.scanning}>
                <Stack
                  gap="base"
                  justify="flex-start"
                  data-onramp-step="withdraw-connected-assets"
                >
                  {data.failed && (
                    <Alert
                      variant="warning"
                      description={t("deposit.flow.assets.partial")}
                    />
                  )}
                  {data.hydration && rows.length > 0 && (
                    <VirtualizedList
                      items={rows}
                      itemSize={50}
                      maxVisibleItems={8}
                      renderItem={(row) => (
                        <AssetListItem
                          asset={row.asset}
                          chain={data.hydration}
                          route={null}
                          symbol={row.asset.originSymbol}
                          symbolBadge={
                            <Flex gap="xs">
                              {[
                                ...new Map(
                                  row.routes.map((route) => [
                                    route.destinationChainKey,
                                    route.destinationChain,
                                  ]),
                                ).values(),
                              ].map((chain) => (
                                <Tooltip
                                  key={chain.key}
                                  text={chain.name}
                                  size="small"
                                  asChild
                                >
                                  <Flex>
                                    <ChainLogo
                                      ecosystem={chain.ecosystem}
                                      chainId={getChainId(chain)}
                                      size="extra-small"
                                      alt={chain.name}
                                    />
                                  </Flex>
                                </Tooltip>
                              ))}
                            </Flex>
                          }
                          name={`${row.name} · ${row.source.account.name}`}
                          balance={row.balance}
                          balanceDisplay={row.value}
                          isLoading={false}
                          isSelected={false}
                          onClick={() => {
                            setAccount(row.source.account)
                            if (row.routes.length === 1)
                              onSelect(row.routes[0]!)
                            else setAssetKey(row.asset.key)
                          }}
                        />
                      )}
                    />
                  )}
                  {data.scanning && (
                    <DepositAssetListSkeleton count={rows.length ? 2 : 3} />
                  )}
                  {!data.scanning && rows.length === 0 && (
                    <Stack gap="m" py="xl" align="center">
                      <Text
                        fs="p4"
                        color={getToken("text.medium")}
                        align="center"
                      >
                        {t(
                          query
                            ? "deposit.connected.noMatches"
                            : "withdraw.connected.assets.empty",
                        )}
                      </Text>
                      {!query && (
                        <Button
                          variant="secondary"
                          outline
                          size="small"
                          onClick={onBack}
                        >
                          {t("common:back")}
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>
              </ScrollArea>
            </Box>
          </Stack>
        </Grid>
      </ModalBody>
    </>
  )
}

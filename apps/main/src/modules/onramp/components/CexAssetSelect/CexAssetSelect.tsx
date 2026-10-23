import {
  Button,
  Flex,
  Grid,
  GridProps,
  Input,
  Separator,
  Stack,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { Search } from "lucide-react"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { ChainLogo } from "@/components/ChainLogo"
import { CEX_CONFIG, getCexConfigById } from "@/modules/onramp/config/cex"
import { AssetConfig, CexId } from "@/modules/onramp/types"
import { useAssets } from "@/providers/assetsProvider"

import {
  CexAssetSelectDirection,
  CexAssetSelectMobileStep,
  getCexAssetChainKeys,
  getCexAssetsForChain,
} from "./CexAssetSelect.utils"
import { CexAssetSelectRow } from "./CexAssetSelectRow"
import { CexSelectRow } from "./CexSelectRow"

const ASSET_ROW_HEIGHT = 60
const MOBILE_ASSET_ROW_HEIGHT = 72
const CEX_ROW_HEIGHT = 36
const MOBILE_CEX_ROW_HEIGHT = 56
const MAX_VISIBLE = 10

export type CexAssetSelectProps = GridProps & {
  activeCexId: CexId
  onAssetSelect: (asset: AssetConfig) => void
  onCexSelect: (id: CexId) => void
  mobileStep: CexAssetSelectMobileStep
  onMobileStepChange: (step: CexAssetSelectMobileStep) => void
  direction?: CexAssetSelectDirection
  searchable?: boolean
  initialChainKey?: string | null
}

export const CexAssetSelect: FC<CexAssetSelectProps> = ({
  activeCexId,
  onCexSelect,
  onAssetSelect,
  mobileStep,
  onMobileStepChange,
  direction = "deposit",
  searchable = false,
  initialChainKey = null,
  ...props
}) => {
  const { t } = useTranslation(["onramp", "common"])
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")
  const { getAssetWithFallback } = useAssets()
  const [exchangeSearch, setExchangeSearch] = useState("")
  const [assetSearch, setAssetSearch] = useState("")
  const [chainKey, setChainKey] = useState<string | null>(initialChainKey)
  const cex = getCexConfigById(activeCexId)

  if (!cex) return null

  const chainKeys = getCexAssetChainKeys(cex.assets, direction)
  const selectedChainKey =
    chainKey && chainKeys.includes(chainKey) ? chainKey : (chainKeys[0] ?? null)
  const chains = chainKeys.flatMap((key) => {
    const chain = chainsMap.get(key)
    return chain ? [chain] : []
  })
  const availableAssets = isMobile
    ? getCexAssetsForChain(cex.assets, direction, selectedChainKey)
    : cex.assets
  const exchangeQuery = exchangeSearch.trim().toLowerCase()
  const assetQuery = assetSearch.trim().toLowerCase()
  const exchanges = searchable
    ? CEX_CONFIG.filter(({ id }) =>
        String(t(`cex.${id}.title`))
          .toLowerCase()
          .includes(exchangeQuery),
      )
    : CEX_CONFIG
  const assets = searchable
    ? availableAssets.filter(({ assetId, data }) => {
        const asset = getAssetWithFallback(assetId)
        return [
          asset.symbol,
          asset.name,
          assetId,
          data.asset.originSymbol,
        ].some((value) => value.toLowerCase().includes(assetQuery))
      })
    : availableAssets

  const exchangeList = (
    <VirtualizedList
      items={exchanges}
      maxVisibleItems={isMobile ? undefined : MAX_VISIBLE}
      height={isMobile ? "100%" : undefined}
      itemSize={isMobile ? MOBILE_CEX_ROW_HEIGHT : CEX_ROW_HEIGHT}
      sx={{
        minHeight: isMobile ? 0 : CEX_ROW_HEIGHT * MAX_VISIBLE,
        flex: isMobile ? 1 : undefined,
        p: isMobile ? 0 : "s",
      }}
      renderItem={(cex, { key }) => (
        <CexSelectRow
          key={key}
          title={t(`cex.${cex.id}.title`)}
          logo={cex.logo}
          isActive={cex.id === activeCexId}
          mobile={isMobile}
          onClick={() => {
            onCexSelect(cex.id)
            if (isMobile) {
              setAssetSearch("")
              setChainKey(null)
              onMobileStepChange("assets")
            }
          }}
        />
      )}
    />
  )
  const assetList = (
    <VirtualizedList
      items={assets}
      maxVisibleItems={isMobile ? undefined : MAX_VISIBLE}
      height={isMobile ? "100%" : undefined}
      sx={{
        minHeight: isMobile ? 0 : ASSET_ROW_HEIGHT * 3,
        flex: isMobile ? 1 : undefined,
      }}
      itemSize={isMobile ? MOBILE_ASSET_ROW_HEIGHT : ASSET_ROW_HEIGHT}
      separated
      renderItem={(item, { key }) => (
        <CexAssetSelectRow
          key={key}
          onClick={() => onAssetSelect(item)}
          assetId={item.assetId}
          showBalance={isMobile}
        />
      )}
    />
  )
  const exchangePanel = searchable ? (
    <Stack
      gap={isMobile ? "m" : "s"}
      p={isMobile ? "m" : "s"}
      justify="flex-start"
      minWidth={0}
      height={isMobile ? "100%" : undefined}
      sx={isMobile ? { minHeight: 0 } : undefined}
    >
      <Input
        iconStart={Search}
        value={exchangeSearch}
        onChange={(event) => setExchangeSearch(event.target.value)}
        placeholder={t("deposit.cex.exchange.search")}
        aria-label={t("deposit.cex.exchange.search")}
      />
      {isMobile && (
        <Text fs="p4" color={getToken("text.medium")}>
          {t("deposit.cex.exchange.title")}
        </Text>
      )}
      {exchanges.length ? (
        exchangeList
      ) : (
        <Text p="m" fs="p4">
          {t("deposit.cex.search.empty")}
        </Text>
      )}
    </Stack>
  ) : (
    exchangeList
  )
  const assetPanel = searchable ? (
    <Stack
      gap={isMobile ? "m" : "s"}
      p={isMobile ? "m" : "s"}
      justify="flex-start"
      minWidth={0}
      height={isMobile ? "100%" : undefined}
      sx={isMobile ? { minHeight: 0 } : undefined}
    >
      <Input
        iconStart={Search}
        value={assetSearch}
        onChange={(event) => setAssetSearch(event.target.value)}
        placeholder={t("deposit.cex.asset.search")}
        aria-label={t("deposit.cex.asset.search")}
      />
      {isMobile && (
        <>
          <Flex gap="base" wrap role="group" aria-label={t("common:chain")}>
            {chains.map((chain) => (
              <Button
                key={chain.key}
                size="small"
                variant={
                  chain.key === selectedChainKey ? "secondary" : "tertiary"
                }
                aria-pressed={chain.key === selectedChainKey}
                onClick={() => setChainKey(chain.key)}
              >
                <ChainLogo
                  ecosystem={chain.ecosystem}
                  chainId={getChainId(chain)}
                  size="small"
                />
                {chain.name}
              </Button>
            ))}
          </Flex>
          <Stack gap="base">
            <Flex justify="space-between" px="m">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("common:asset")}
              </Text>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("common:balance")}
              </Text>
            </Flex>
            <Separator />
          </Stack>
        </>
      )}
      {assets.length ? (
        assetList
      ) : (
        <Text p="m" fs="p4">
          {t("deposit.cex.search.empty")}
        </Text>
      )}
    </Stack>
  ) : (
    assetList
  )

  return (
    <Grid
      data-onramp-step={
        isMobile
          ? mobileStep === "assets"
            ? "cex-assets"
            : "cex-exchanges"
          : "cex-picker"
      }
      columnTemplate={
        isMobile
          ? "minmax(0, 1fr)"
          : searchable
            ? `${pxToRem(200)} minmax(0, 1fr)`
            : "10.25rem 1fr"
      }
      gap={isMobile ? "0" : "l"}
      height={isMobile ? "100%" : undefined}
      sx={isMobile ? { flex: 1, minHeight: 0 } : undefined}
      {...props}
    >
      {(!isMobile || mobileStep === "exchanges") && exchangePanel}
      {(!isMobile || mobileStep === "assets") && assetPanel}
    </Grid>
  )
}

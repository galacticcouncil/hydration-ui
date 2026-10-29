import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  SearchInput,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { getChainId } from "@galacticcouncil/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetSelectEmptyState } from "@/components/AssetSelect/AssetSelectEmptyState"
import { ChainLogo } from "@/components/ChainLogo"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { DepositScrollBody } from "@/modules/onramp/deposit/preview/components/DepositScrollBody"
import { SAssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem.styled"

import { DepositAssetNetworkPair } from "./DepositQuickAssetGroups"

type DepositQuickNetworkSelectProps = {
  symbol: string
  items: DepositAssetNetworkPair[]
  onBack: () => void
  onSelect: (source: DepositAssetNetworkPair) => void
}

export const DepositQuickNetworkSelect: FC<DepositQuickNetworkSelectProps> = ({
  symbol,
  items,
  onBack,
  onSelect,
}) => {
  const { t } = useTranslation("onramp")
  const [search, setSearch] = useState("")
  const query = search.trim().toLowerCase()
  const visible = items.filter(({ chain }) =>
    `${chain.name} ${chain.key}`.toLowerCase().includes(query),
  )
  return (
    <>
      <SOnrampStepHeader
        title={t("deposit.guided.networkTitle")}
        description={t("deposit.guided.networkHeading", { symbol })}
        align="center"
        closable
        onBack={onBack}
      />
      <DepositScrollBody>
        <Stack gap="m" data-onramp-step="deposit-quick-network">
          <SearchInput
            customSize="medium"
            variant="standalone"
            clearLabel={t("deposit.quick.clearSearch")}
            aria-label={t("deposit.guided.searchNetworks")}
            placeholder={t("deposit.guided.searchNetworks")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Stack gap={0}>
            {visible.map((source) => (
              <SAssetListItem
                key={source.chain.key}
                as="button"
                aria-label={source.chain.name}
                data-deposit-network-option={source.chain.key}
                isSelected={false}
                sx={{ height: pxToRem(56) }}
                onClick={() => onSelect(source)}
              >
                <Flex gap="m" align="center">
                  <ChainLogo
                    ecosystem={source.chain.ecosystem}
                    chainId={getChainId(source.chain)}
                  />
                  <Text fs="p4">{source.chain.name}</Text>
                </Flex>
                <Icon component={ChevronRight} size="m" />
              </SAssetListItem>
            ))}
            {!visible.length && <AssetSelectEmptyState />}
          </Stack>
        </Stack>
      </DepositScrollBody>
    </>
  )
}

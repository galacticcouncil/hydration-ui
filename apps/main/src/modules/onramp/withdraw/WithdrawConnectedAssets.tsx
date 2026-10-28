import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Box,
  Button,
  Flex,
  Input,
  ModalBody,
  ScrollArea,
  Stack,
  Text,
  VirtualizedList,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { DepositAssetListSkeleton } from "@/modules/onramp/deposit/components/DepositAssetListSkeleton"
import { WithdrawRouteSelect } from "@/modules/onramp/withdraw/components/WithdrawRouteSelect"
import { useWithdrawConnectedAssets } from "@/modules/onramp/withdraw/hooks/useWithdrawConnectedAssets"
import { WithdrawAssetSelection } from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import { AssetListItem } from "@/modules/xcm/transfer/components/ChainAssetSelect/AssetListItem"

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
  const setAccount = useWeb3Connect((state) => state.setAccount)
  const [search, setSearch] = useState("")
  const [assetKey, setAssetKey] = useState<string | null>(null)
  const query = search.trim().toLowerCase()
  const rows = data.rows.filter((row) =>
    `${row.asset.originSymbol} ${row.name} ${row.source.account.name}`
      .toLowerCase()
      .includes(query),
  )

  if (assetKey)
    return (
      <WithdrawRouteSelect
        sourceAssetKey={assetKey}
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
        <Stack
          p="l"
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
                        name={`${row.name} · ${row.source.account.name}`}
                        balance={row.balance}
                        balanceDisplay={row.value}
                        isLoading={false}
                        isSelected={false}
                        onClick={() => {
                          setAccount(row.source.account)
                          if (row.routes.length === 1) onSelect(row.routes[0]!)
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
                        {t("deposit.connected.changeWallet")}
                      </Button>
                    )}
                  </Stack>
                )}
              </Stack>
            </ScrollArea>
          </Box>
        </Stack>
      </ModalBody>
    </>
  )
}

import { Search } from "@galacticcouncil/ui/assets/icons"
import NoFunds from "@galacticcouncil/ui/assets/images/NoFunds.png"
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
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState"
import { OnrampLocalStep } from "@/modules/onramp/components/OnrampLocalStep"
import { SOnrampStepHeader } from "@/modules/onramp/components/OnrampStepHeader.styled"
import { DepositAssetListSkeleton } from "@/modules/onramp/deposit/components/DepositAssetListSkeleton"
import { useOnrampModal } from "@/modules/onramp/store/useOnrampModal"
import { useWithdrawConnectedAssets } from "@/modules/onramp/withdraw/hooks/useWithdrawConnectedAssets"
import { WithdrawAssetSelection } from "@/modules/onramp/withdraw/WithdrawAssetSelect.utils"
import { WithdrawRecipientSelect } from "@/modules/onramp/withdraw/WithdrawRecipientSelect"
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
  const { isMobile } = useBreakpoints()
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
      <OnrampLocalStep stepKey={`withdraw-route:${assetKey}`}>
        <WithdrawRecipientSelect
          sourceAssetKey={assetKey}
          onBack={() => setAssetKey(null)}
          onSelect={onSelect}
        />
      </OnrampLocalStep>
    )

  const header = (
    <SOnrampStepHeader
      title={t("withdraw.connected.assets.title")}
      description={t("withdraw.connected.assets.description")}
      align="center"
      closable
      onBack={onBack}
    />
  )

  if (!data.scanning && !data.failed && data.rows.length === 0)
    return (
      <OnrampLocalStep stepKey="withdraw-empty">
        {header}
        <ModalBody
          scrollable={false}
          display="flex"
          sx={{ flex: 1, minHeight: pxToRem(450) }}
        >
          <Flex data-onramp-step-body flex={1} align="center" justify="center">
            <EmptyState
              image={NoFunds}
              header={t("withdraw.connected.assets.emptyTitle")}
              description={t("withdraw.connected.assets.empty")}
              action={
                <Button
                  variant="secondary"
                  onClick={() => useOnrampModal.getState().openDepositChoice()}
                >
                  {t("common:deposit")}
                </Button>
              }
            />
          </Flex>
        </ModalBody>
      </OnrampLocalStep>
    )

  return (
    <OnrampLocalStep stepKey="withdraw-assets">
      {header}
      <ModalBody
        noPadding
        scrollable={false}
        display="flex"
        sx={{ minHeight: 0 }}
      >
        <Stack
          data-onramp-step-body
          px={["l", "xl"]}
          py="m"
          gap="m"
          justify="flex-start"
          flex={1}
          height={pxToRem(450)}
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
                        showChainLogo={false}
                        showSourceChain
                        name={
                          isMobile
                            ? shortenAccountAddress(
                                row.source.account.displayAddress,
                                4,
                              )
                            : `${row.name} · ${row.source.account.name}`
                        }
                        balance={row.balance}
                        balanceDisplay={row.value}
                        isLoading={false}
                        isSelected={false}
                        onClick={() => {
                          setAccount(row.source.account)
                          setAssetKey(row.asset.key)
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
      </ModalBody>
    </OnrampLocalStep>
  )
}

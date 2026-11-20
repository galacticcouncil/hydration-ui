import { Box, Flex, Grid } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { pxToRem } from "@galacticcouncil/ui/utils"
import {
  SWalletManagementBody,
  SWalletManagementHeader,
} from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { DepositHoldingList } from "@/modules/onramp/deposit/onchain/components/DepositHoldingList"
import { DepositWalletList } from "@/modules/onramp/deposit/onchain/components/DepositWalletList"
import { DepositBalanceRow } from "@/modules/onramp/deposit/onchain/DepositDiscovery.utils"
import { useOnrampClosable } from "@/modules/onramp/hooks/useOnrampClosable"

export type DepositOnchainHoldingsProps = {
  onBack: () => void
  onSelect: (row: DepositBalanceRow) => void
}

// Same header, body and two-column grid as the connect wallet modal in account mode
export const DepositOnchainHoldings: React.FC<DepositOnchainHoldingsProps> = ({
  onBack,
  onSelect,
}) => {
  const { t } = useTranslation(["onramp"])
  const closable = useOnrampClosable()
  const { gte } = useBreakpoints()
  const isDesktop = gte("md")
  const [provider, setProvider] = useState<WalletProviderType | null>(null)

  return (
    <Flex direction="column">
      <SWalletManagementHeader
        title={t("deposit.onchain.title")}
        align="center"
        onBack={onBack}
        closable={closable}
      />
      <SWalletManagementBody noPadding scrollable={false}>
        <Grid
          columnTemplate={
            isDesktop ? `${pxToRem(200)} minmax(0, 1fr)` : "minmax(0, 1fr)"
          }
          rowTemplate={isDesktop ? undefined : "repeat(2, minmax(0, 1fr))"}
          gap={isDesktop ? "s" : "base"}
          sx={{
            minHeight: 0,
            // Fill the viewport below the page header, capped so the list stays scannable
            height: `clamp(${pxToRem(400)}, calc(100dvh - ${pxToRem(240)}), ${pxToRem(640)})`,
          }}
        >
          <DepositWalletList
            showConnectedOnly
            selectedProvider={provider}
            onSelectProvider={setProvider}
          />
          <Box minWidth={0} minHeight={0}>
            {/* Keyed so switching wallets starts with a clear search */}
            <DepositHoldingList
              key={provider ?? "all"}
              provider={provider}
              onSelect={onSelect}
            />
          </Box>
        </Grid>
      </SWalletManagementBody>
    </Flex>
  )
}

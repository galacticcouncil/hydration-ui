import {
  DataTable,
  Flex,
  Paper,
  TableContainer,
  Text,
} from "@galacticcouncil/ui/components"
import { Account } from "@galacticcouncil/web3-connect"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useMultichainColumns } from "@/modules/wallet/multichain/components/MultichainTable.columns"
import { useMultichainAssets } from "@/modules/wallet/multichain/useMultichainAssets"
import { XcmQueryParams } from "@/modules/xcm/transfer/utils/query"
import { MultichainChainKey } from "@/routes/wallet/multichain"

type Props = {
  chainKey: MultichainChainKey
  account: Account
  onTransfer: (params: XcmQueryParams) => void
}

const CHAIN_ECOSYSTEMS: Record<MultichainChainKey, ChainEcosystem> = {
  ethereum: ChainEcosystem.Ethereum,
  base: ChainEcosystem.Ethereum,
  solana: ChainEcosystem.Solana,
  sui: ChainEcosystem.Sui,
}

export const MultichainAssetList = ({
  chainKey,
  account,
  onTransfer,
}: Props) => {
  const { t } = useTranslation(["wallet"])
  const { rows, isLoading, isPriceLoading } = useMultichainAssets(
    chainKey,
    account,
  )

  const ecosystem = CHAIN_ECOSYSTEMS[chainKey]

  const tableData = useMemo(
    () => rows.map((row) => ({ ...row, ecosystem, isPriceLoading })),
    [rows, ecosystem, isPriceLoading],
  )

  const columns = useMultichainColumns(chainKey, onTransfer)

  return (
    <TableContainer as={Paper}>
      <DataTable
        isLoading={isLoading && rows.length === 0}
        data={tableData}
        columns={columns}
        emptyState={
          <Flex justify="center" sx={{ p: "xl" }}>
            <Text fs="p3" color="text.medium">
              {t("multichain.noAssets")}
            </Text>
          </Flex>
        }
      />
    </TableContainer>
  )
}

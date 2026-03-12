import {
  Amount,
  AssetLabel,
  Flex,
  Skeleton,
  TableRowAction,
} from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { ChainEcosystem } from "@galacticcouncil/xc-core"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { ExternalAssetLogo } from "@/components/ExternalAssetLogo"
import { XcmQueryParams } from "@/modules/xcm/transfer/utils/query"
import { MultichainAssetRow } from "@/modules/wallet/multichain/useMultichainAssets"
import { MultichainChainKey } from "@/routes/wallet/multichain"

type MultichainTableRow = MultichainAssetRow & {
  ecosystem: ChainEcosystem
  isPriceLoading: boolean
}

const columnHelper = createColumnHelper<MultichainTableRow>()

export const useMultichainColumns = (
  chainKey: MultichainChainKey,
  onTransfer: (params: XcmQueryParams) => void,
) => {
  const { t } = useTranslation(["wallet", "common"])

  return useMemo(
    () => [
      columnHelper.accessor("originSymbol", {
        id: "asset",
        header: t("common:asset"),
        cell: ({ row }) => (
          <Flex gap="base" align="center">
            <ExternalAssetLogo
              id={row.original.chainAssetId}
              chainId={row.original.chainId}
              ecosystem={row.original.ecosystem}
            />
            <AssetLabel symbol={row.original.originSymbol} />
          </Flex>
        ),
      }),
      columnHelper.accessor("amount", {
        id: "balance",
        header: t("common:balance"),
        meta: { sx: { textAlign: "right" } },
        cell: ({ row }) => {
          if (row.original.isPriceLoading && row.original.usdValue === 0) {
            return (
              <Flex direction="column" align="flex-end" gap="xs">
                <Skeleton width={80} height={14} />
                <Skeleton width={48} height={10} />
              </Flex>
            )
          }

          return (
            <Amount
              value={t("common:number", {
                value: row.original.amount,
                symbol: row.original.originSymbol,
              })}
              displayValue={
                row.original.usdValue > 0
                  ? t("common:currency", {
                      value: row.original.usdValue.toFixed(2),
                    })
                  : undefined
              }
            />
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: t("common:actions"),
        meta: { sx: { textAlign: "right" } },
        cell: ({ row }) => (
          <Flex justify="flex-end">
            <TableRowAction
              onClick={() =>
                onTransfer({
                  srcChain: chainKey,
                  srcAsset: row.original.key,
                  destChain: HYDRATION_CHAIN_KEY,
                  destAsset: row.original.key,
                })
              }
            >
              {t("multichain.transfer")}
            </TableRowAction>
          </Flex>
        ),
      }),
    ],
    [chainKey, onTransfer, t],
  )
}

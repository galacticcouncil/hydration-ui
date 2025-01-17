import { AssetLogo, Box, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"

import { TAssetStored } from "@/states/assetRegistry"

const columnHelper = createColumnHelper<TAssetStored>()

export const useWalletAssetsColumns = () => {
  return useMemo(() => {
    return [
      columnHelper.display({
        header: "Asset",
        cell: ({ row }) => {
          console.log({ row })
          return (
            <Flex align="center" gap={8}>
              {row.original.type !== "StableSwap" && (
                <AssetLogo
                  assetId={row.original.id}
                  src={`https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/${row.original.id}/icon.svg`}
                />
              )}
              <Box>
                <Text fw={600}>{row.original.symbol}</Text>
                <Text fs={12} color={getToken("text.low")}>
                  {row.original.name}
                </Text>
              </Box>
            </Flex>
          )
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
      }),
      columnHelper.accessor("symbol", {
        header: "Symbol",
      }),
      columnHelper.accessor("decimals", {
        header: "Decimals",
      }),
    ]
  }, [])
}

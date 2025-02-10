import { Box, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/Logo/Logo"
import { TAssetStored } from "@/states/assetRegistry"
import { useAssetsPrice } from "@/states/displayAsset"

const columnHelper = createColumnHelper<TAssetStored>()

const AssetPrice = ({ assetId }: { assetId: string }) => {
  const { t } = useTranslation()
  const price = useAssetsPrice([assetId])

  return (
    <Text>
      {t("number", {
        value: price[assetId].price,
      })}
    </Text>
  )
}

export const useWalletAssetsColumns = () => {
  return useMemo(() => {
    return [
      columnHelper.display({
        header: "Asset",
        cell: ({ row }) => (
          <Flex align="center" gap={8}>
            <Logo id={row.original.id} />
            <Box>
              <Text fw={600}>{row.original.symbol}</Text>
              <Text fs={12} color={getToken("text.low")}>
                {row.original.name}
              </Text>
            </Box>
          </Flex>
        ),
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
      columnHelper.display({
        header: "Price",
        cell: ({ row }) => <AssetPrice assetId={row.original.id} />,
      }),
    ]
  }, [])
}

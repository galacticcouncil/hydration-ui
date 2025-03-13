import { Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { AmountDisplay } from "@/components/AmountDisplay/AmountDisplay"
import { useAssets } from "@/providers/assetsProvider"
import { TAssetStored } from "@/states/assetRegistry"

const columnHelper = createColumnHelper<TAssetStored>()

export const useWalletAssetsColumns = () => {
  const { getAsset } = useAssets()
  const { t } = useTranslation(["wallet", "common"])

  return useMemo(() => {
    return [
      columnHelper.display({
        header: t("common:asset"),
        cell: ({ row }) => {
          const asset = getAsset(row.original.id)

          return asset && <AssetLabelFull asset={asset} />
        },
      }),
      columnHelper.display({
        header: t("assets.table.header.transferable"),
        cell: () => {
          return <AmountDisplay balance={12345678} />
        },
      }),
      columnHelper.display({
        header: t("assets.table.header.total"),
        cell: () => {
          return <AmountDisplay balance={12345678} />
        },
      }),
      columnHelper.display({
        header: t("assets.table.header.supplyBorrow"),
        cell: () => {
          return (
            <Text fs={13} color={getToken("text.high")}>
              {t("common:number", { value: 12345678 })} /{" "}
              {t("common:number", { value: 12345678 })}
            </Text>
          )
        },
      }),
      columnHelper.display({
        header: t("common:actions"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: () => {
          return (
            <Flex gap={8}>
              <Button type="button" variant="tertiary" outline>
                {t("common:send")}
              </Button>
              <Button type="button" variant="tertiary" outline>
                {t("common:trade")}
              </Button>
            </Flex>
          )
        },
      }),
    ]
  }, [getAsset, t])
}

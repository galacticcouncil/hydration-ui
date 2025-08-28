import { createColumnHelper } from "@tanstack/react-table"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Button } from "components/Button/Button"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { AssetNameColumn } from "sections/lending/ui/columns/AssetNameColumn"
import { CollateralColumn } from "sections/lending/ui/columns/CollateralColumn"
import { MoneyMarketAPYWrapper } from "sections/pools/stablepool/components/GigaIncentives"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getAssetIdFromAddress } from "utils/evm"

const columnHelper = createColumnHelper<ComputedReserveData>()

export const useSupplyGigaAssetsTableColumns = () => {
  const { t } = useTranslation()

  const { account } = useAccount()

  const { openGigaSupply } = useModalContext()

  return useMemo(
    () => [
      columnHelper.accessor("symbol", {
        header: t("lending.asset"),
        meta: {
          sx: {
            width: "40%",
          },
        },
        cell: ({ row }) => (
          <AssetNameColumn
            detailsAddress={row.original.underlyingAsset}
            symbol={row.original.symbol}
          />
        ),
      }),
      columnHelper.accessor("supplyAPY", {
        header: t("lending.apy"),
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          return (
            <MoneyMarketAPYWrapper
              type="supply"
              assetId={getAssetIdFromAddress(row.original.underlyingAsset)}
            />
          )
        },
      }),
      columnHelper.accessor("usageAsCollateralEnabled", {
        header: t("lending.supply.table.canBeCollateral"),
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { isIsolated, usageAsCollateralEnabled } = row.original
          return (
            <CollateralColumn
              isIsolated={isIsolated}
              usageAsCollateralEnabled={usageAsCollateralEnabled}
            />
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        meta: {
          sx: {
            textAlign: "end",
          },
        },
        cell: ({ row }) => {
          return (
            <div sx={{ flex: "row", align: "center", justify: "end" }}>
              <Button
                sx={{ py: 4 }}
                onClick={(e) => {
                  e.stopPropagation()
                  openGigaSupply(row.original.underlyingAsset)
                }}
                size="micro"
                disabled={!account}
              >
                {t("lending.supply")}
              </Button>

              <ChevronRight sx={{ color: "iconGray", mr: -8 }} />
            </div>
          )
        },
      }),
    ],
    [account, openGigaSupply, t],
  )
}

import {
  Box,
  DataTable,
  Modal,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, memo, useMemo, useState } from "react"

import { SearchEmptyState } from "@/components/EmptyState"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { AssetDetailExpanded } from "@/modules/portfolio/overview/MyAssets/AssetDetailExpanded"
import { AssetDetailMobileModal } from "@/modules/portfolio/overview/MyAssets/AssetDetailMobileModal"
import { AssetDetailNativeMobileModal } from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModal"
import { ExpandedNativeRow } from "@/modules/portfolio/overview/MyAssets/ExpandedNativeRow"
import {
  AssetDetailModal,
  MyAsset,
  useMyAssetsColumns,
} from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import { StrategyAssetMobileModal } from "@/modules/portfolio/overview/MyAssets/StrategyAssetMobileModal"
import { MyStrategiesDetails } from "@/modules/portfolio/overview/MyStrategies/MyStrategiesDetails"
import { TransferPositionModal } from "@/modules/portfolio/overview/Transfer/TransferPositionModal"
import { ShareTransferModal } from "@/modules/strategies/propeller/components/ShareTransferModal"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly data: Array<MyAsset>
  readonly isLoading: boolean
  readonly searchPhrase: string
  readonly sortingProps: SortingProps
  readonly isReadOnly?: boolean
  readonly showDepositAction?: boolean
}

export const MyAssetsTable: FC<Props> = memo(
  ({
    data,
    isLoading,
    searchPhrase,
    sortingProps,
    isReadOnly = false,
    showDepositAction = true,
  }) => {
    const { isMobile, isTablet, isLaptop } = useBreakpoints()
    const { native } = useAssets()

    const useCompactColumns = isMobile || (isReadOnly && (isTablet || isLaptop))

    const strategyPositions = useMemo(
      () =>
        data.flatMap((asset) =>
          asset.strategyPosition ? [asset.strategyPosition] : [],
        ),
      [data],
    )

    const columns = useMyAssetsColumns(
      !isLoading && data.length === 0,
      isReadOnly,
      showDepositAction,
      strategyPositions,
    )

    const [isDetailOpen, setIsDetailOpen] = useState<{
      type: AssetDetailModal | null
      detail: MyAsset
    } | null>(null)

    return (
      <TableContainer>
        <DataTable
          isLoading={isLoading}
          {...sortingProps}
          globalFilter={searchPhrase}
          globalFilterFn={(row) =>
            row.original.symbol
              .toLowerCase()
              .includes(searchPhrase.toLowerCase()) ||
            row.original.name.toLowerCase().includes(searchPhrase.toLowerCase())
          }
          data={data}
          columns={columns}
          emptyState={
            searchPhrase ? (
              <SearchEmptyState searchPhrase={searchPhrase} />
            ) : undefined
          }
          size="small"
          fixedLayout
          expandable={!isMobile && !isReadOnly}
          hideExpandColumn
          renderSubComponent={(asset) =>
            asset.strategyPosition ? (
              <Box p="m">
                <MyStrategiesDetails
                  position={asset.strategyPosition}
                  showMainMetrics
                />
              </Box>
            ) : asset.id === native.id ? (
              <ExpandedNativeRow asset={asset} />
            ) : (
              <AssetDetailExpanded asset={asset} />
            )
          }
          onRowClick={
            !isReadOnly || useCompactColumns
              ? (asset) => setIsDetailOpen({ type: null, detail: asset })
              : undefined
          }
        />
        <Modal
          variant="popup"
          open={
            !!isDetailOpen &&
            !(
              isDetailOpen.type === "transfer" &&
              !!isDetailOpen.detail.strategyPosition
            )
          }
          onOpenChange={() =>
            setIsDetailOpen(
              !isDetailOpen?.type ? null : { ...isDetailOpen, type: null },
            )
          }
        >
          {isDetailOpen?.type === null && (
            <>
              {isDetailOpen.detail.strategyPosition ? (
                <StrategyAssetMobileModal
                  asset={isDetailOpen.detail}
                  position={isDetailOpen.detail.strategyPosition}
                  onTransfer={() =>
                    setIsDetailOpen({ ...isDetailOpen, type: "transfer" })
                  }
                />
              ) : isDetailOpen.detail.id === native.id && !isReadOnly ? (
                <AssetDetailNativeMobileModal
                  asset={isDetailOpen.detail}
                  onModalOpen={(type) =>
                    setIsDetailOpen({ ...isDetailOpen, type })
                  }
                />
              ) : (
                <AssetDetailMobileModal
                  asset={isDetailOpen.detail}
                  isReadOnly={isReadOnly}
                  showDepositAction={showDepositAction}
                  onModalOpen={(type) =>
                    setIsDetailOpen({ ...isDetailOpen, type })
                  }
                />
              )}
            </>
          )}
          {isDetailOpen?.type === "transfer" &&
            !isDetailOpen.detail.strategyPosition && (
              <TransferPositionModal
                assetId={isDetailOpen.detail.id}
                onClose={() => setIsDetailOpen({ ...isDetailOpen, type: null })}
              />
            )}
        </Modal>
        {isDetailOpen?.type === "transfer" &&
          isDetailOpen.detail.strategyPosition && (
            <ShareTransferModal
              positions={strategyPositions}
              positionId={isDetailOpen.detail.strategyPosition.id}
              symbol={isDetailOpen.detail.symbol}
              balance={
                isDetailOpen.detail.strategyPosition.strategy === "juicer"
                  ? isDetailOpen.detail.strategyPosition.underlyingAmount
                  : isDetailOpen.detail.strategyPosition.shareAmount
              }
              shareBalance={isDetailOpen.detail.strategyPosition.shareAmount}
              isJuicer={
                isDetailOpen.detail.strategyPosition.strategy === "juicer"
              }
              assetId={isDetailOpen.detail.strategyPosition.assetId}
              open
              onClose={() => setIsDetailOpen({ ...isDetailOpen, type: null })}
            />
          )}
      </TableContainer>
    )
  },
)
MyAssetsTable.displayName = "MyAssetsTable"

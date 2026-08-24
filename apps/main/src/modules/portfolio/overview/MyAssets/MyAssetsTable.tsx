import {
  DataTable,
  Modal,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, memo, useState } from "react"

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
import { TransferPositionModal } from "@/modules/portfolio/overview/Transfer/TransferPositionModal"
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
    const { isMobile } = useBreakpoints()
    const { native } = useAssets()

    const columns = useMyAssetsColumns(
      !isLoading && data.length === 0,
      isReadOnly,
      showDepositAction,
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
          renderSubComponent={(asset) =>
            asset.id === native.id ? (
              <ExpandedNativeRow asset={asset} />
            ) : (
              <AssetDetailExpanded asset={asset} />
            )
          }
          onRowClick={
            isReadOnly
              ? undefined
              : (asset) => setIsDetailOpen({ type: null, detail: asset })
          }
        />
        <Modal
          variant="popup"
          open={!!isDetailOpen}
          onOpenChange={() =>
            setIsDetailOpen(
              !isDetailOpen?.type ? null : { ...isDetailOpen, type: null },
            )
          }
        >
          {isDetailOpen?.type === null && (
            <>
              {isDetailOpen.detail.id === native.id ? (
                <AssetDetailNativeMobileModal
                  asset={isDetailOpen.detail}
                  onModalOpen={(type) =>
                    setIsDetailOpen({ ...isDetailOpen, type })
                  }
                />
              ) : (
                <AssetDetailMobileModal
                  asset={isDetailOpen.detail}
                  onModalOpen={(type) =>
                    setIsDetailOpen({ ...isDetailOpen, type })
                  }
                />
              )}
            </>
          )}
          {isDetailOpen?.type === "transfer" && (
            <TransferPositionModal
              assetId={isDetailOpen.detail.id}
              onClose={() => setIsDetailOpen({ ...isDetailOpen, type: null })}
            />
          )}
        </Modal>
      </TableContainer>
    )
  },
)
MyAssetsTable.displayName = "MyAssetsTable"

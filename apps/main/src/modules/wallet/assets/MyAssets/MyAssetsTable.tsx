import {
  DataTable,
  Modal,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, useState } from "react"

import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { AssetDetailExpanded } from "@/modules/wallet/assets/MyAssets/AssetDetailExpanded"
import { AssetDetailMobileModal } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModal"
import { AssetDetailNativeMobileModal } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal"
import { ExpandedNativeRow } from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow"
import {
  AssetDetailModal,
  MyAsset,
  useMyAssetsColumns,
} from "@/modules/wallet/assets/MyAssets/MyAssetsTable.columns"
import { TransferPositionModal } from "@/modules/wallet/assets/Transfer/TransferPositionModal"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly data: Array<MyAsset>
  readonly isLoading: boolean
  readonly searchPhrase: string
  readonly sortingProps: SortingProps
}

export const MyAssetsTable: FC<Props> = ({
  data,
  isLoading,
  searchPhrase,
  sortingProps,
}) => {
  const { isMobile } = useBreakpoints()
  const { native } = useAssets()

  const columns = useMyAssetsColumns(!isLoading && data.length === 0)

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
        size="small"
        expandable={!isMobile}
        renderSubComponent={(asset) =>
          asset.id === native.id ? (
            <ExpandedNativeRow asset={asset} />
          ) : (
            <AssetDetailExpanded asset={asset} />
          )
        }
        onRowClick={(asset) => setIsDetailOpen({ type: null, detail: asset })}
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
}

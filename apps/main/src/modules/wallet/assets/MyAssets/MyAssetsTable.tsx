import {
  DataTable,
  DataTableRef,
  Modal,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC, Ref, useState } from "react"

import { AssetDetailExpanded } from "@/modules/wallet/assets/MyAssets/AssetDetailExpanded"
import { AssetDetailMobileModal } from "@/modules/wallet/assets/MyAssets/AssetDetailMobileModal"
import { AssetDetailNativeMobileModal } from "@/modules/wallet/assets/MyAssets/AssetDetailNativeMobileModal"
import { ExpandedNativeRow } from "@/modules/wallet/assets/MyAssets/ExpandedNativeRow"
import { MyAssetsEmptyState } from "@/modules/wallet/assets/MyAssets/MyAssetsEmptyState"
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
  readonly ref?: Ref<DataTableRef>
}

export const MyAssetsTable: FC<Props> = ({
  data,
  isLoading,
  searchPhrase,
  ref,
}) => {
  const { isMobile } = useBreakpoints()
  const { native } = useAssets()

  const columns = useMyAssetsColumns(!isLoading && data.length === 0)

  const [isDetailOpen, setIsDetailOpen] = useState<{
    type: AssetDetailModal | null
    detail: MyAsset
  } | null>(null)

  return (
    <TableContainer as={Paper}>
      <DataTable
        ref={ref}
        isLoading={isLoading}
        paginated
        pageSize={10}
        globalFilter={searchPhrase}
        globalFilterFn={(row) =>
          row.original.symbol
            .toLowerCase()
            .includes(searchPhrase.toLowerCase()) ||
          row.original.name.toLowerCase().includes(searchPhrase.toLowerCase())
        }
        data={data}
        columns={columns}
        expandable={!isMobile}
        renderSubComponent={(asset) =>
          asset.id === native.id ? (
            <ExpandedNativeRow asset={asset} />
          ) : (
            <AssetDetailExpanded asset={asset} />
          )
        }
        emptyState={<MyAssetsEmptyState />}
        onRowClick={(asset) => setIsDetailOpen({ type: null, detail: asset })}
      />
      <Modal
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

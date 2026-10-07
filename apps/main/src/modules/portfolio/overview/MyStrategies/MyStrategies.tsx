import NoPositions from "@galacticcouncil/ui/assets/images/NoPositions.png"
import {
  Alert,
  Box,
  Button,
  DataTable,
  Modal,
  ModalHeader,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Link } from "@tanstack/react-router"
import { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState, SearchEmptyState } from "@/components/EmptyState"
import { LINKS } from "@/config/navigation"
import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import {
  SAssetDetailMobileSeparator,
  SAssetDetailModalBody,
} from "@/modules/portfolio/overview/MyAssets/AssetDetailNativeMobileModal.styled"
import {
  StrategyPositionActions,
  StrategyPositionLabel,
  StrategyPositionValue,
  useMyStrategiesColumns,
} from "@/modules/portfolio/overview/MyStrategies/MyStrategies.columns"
import {
  StrategyPosition,
  useMyBilPositions,
  useMyJuicerPositions,
} from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { MyStrategiesDetails } from "@/modules/portfolio/overview/MyStrategies/MyStrategiesDetails"
import { BilStrategyProvider } from "@/modules/strategies/bil/context/BilStrategyContext"
import { ShareTransferModal } from "@/modules/strategies/propeller/components/ShareTransferModal"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  searchPhrase: string
  paginationProps: PaginationProps
  sortingProps: SortingProps
}

type PositionsResult = {
  data: StrategyPosition[]
  isLoading: boolean
  isError: boolean
}

const EMPTY_POSITIONS: PositionsResult = {
  data: [],
  isLoading: false,
  isError: false,
}

type DataProps = {
  children: (result: PositionsResult) => ReactNode
}

const JuicerPositions = ({ children }: DataProps) =>
  children(useMyJuicerPositions())

const BilPositions = ({ children }: DataProps) => children(useMyBilPositions())

// Mount only enabled strategies, so unsupported RPC environments never read them.
const EnabledBilPositions = ({
  enabled,
  children,
}: DataProps & { enabled: boolean }) =>
  enabled ? (
    <BilStrategyProvider>
      <BilPositions>{children}</BilPositions>
    </BilStrategyProvider>
  ) : (
    children(EMPTY_POSITIONS)
  )

export const MyStrategies = (props: Props) => {
  const { featureFlags, isReady } = useRpcProvider()
  const renderPositions = (juicer: PositionsResult) => (
    <EnabledBilPositions enabled={isReady && featureFlags.bilEnabled}>
      {(bil) => (
        <MyStrategiesTable
          {...props}
          data={[...juicer.data, ...bil.data]}
          isLoading={!isReady || juicer.isLoading || bil.isLoading}
          isError={juicer.isError || bil.isError}
        />
      )}
    </EnabledBilPositions>
  )

  return isReady && featureFlags.propellerEnabled ? (
    <JuicerPositions>{renderPositions}</JuicerPositions>
  ) : (
    renderPositions(EMPTY_POSITIONS)
  )
}

const MyStrategiesTable = ({
  data,
  isLoading,
  isError,
  searchPhrase,
  paginationProps,
  sortingProps,
}: Props & PositionsResult) => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()
  const [transferring, setTransferring] = useState<StrategyPosition | null>(
    null,
  )
  const [selected, setSelected] = useState<StrategyPosition | null>(null)
  const columns = useMyStrategiesColumns(setTransferring, setSelected)
  const detail = selected
    ? (data.find((position) => position.id === selected.id) ?? selected)
    : null

  return (
    <TableContainer>
      {isError && !isLoading && (
        <Box p="m">
          <Alert variant="warning" description={t("myStrategies.readFailed")} />
        </Box>
      )}
      <DataTable
        key={isMobile ? "mobile" : "desktop"}
        data={data}
        columns={columns}
        size="small"
        paginated
        {...paginationProps}
        {...sortingProps}
        isLoading={isLoading}
        globalFilter={searchPhrase}
        globalFilterFn={(row) =>
          [row.original.symbol, row.original.name, row.original.strategy]
            .join(" ")
            .toLowerCase()
            .includes(searchPhrase.toLowerCase())
        }
        expandable={isMobile ? false : "single"}
        getIsExpandable={() => true}
        renderSubComponent={(position) => (
          <Box p="m">
            <MyStrategiesDetails position={position} />
          </Box>
        )}
        emptyState={
          isError ? null : searchPhrase ? (
            <SearchEmptyState searchPhrase={searchPhrase} />
          ) : (
            <EmptyState
              image={NoPositions}
              header={t("myStrategies.emptyState.header")}
              description={t("myStrategies.emptyState.description")}
              action={
                <Button variant="secondary" asChild>
                  <Link to={LINKS.strategies}>
                    {t("myStrategies.emptyState.cta")}
                  </Link>
                </Button>
              }
            />
          )
        }
        onRowClick={isMobile ? setSelected : undefined}
      />
      <Modal
        variant="popup"
        open={!!detail && isMobile && !transferring}
        onOpenChange={() => setSelected(null)}
      >
        {detail && (
          <>
            <ModalHeader
              title={detail.symbol}
              customTitle={<StrategyPositionLabel position={detail} />}
            />
            <SAssetDetailModalBody>
              <StrategyPositionValue position={detail} withLabel />
              <SAssetDetailMobileSeparator />
              <MyStrategiesDetails position={detail} showMainMetrics />
              <StrategyPositionActions
                position={detail}
                mobile
                onTransfer={setTransferring}
              />
            </SAssetDetailModalBody>
          </>
        )}
      </Modal>
      {transferring && (
        <ShareTransferModal
          positionId={transferring.id}
          symbol={transferring.symbol}
          balance={
            transferring.strategy === "juicer"
              ? transferring.underlyingAmount
              : transferring.shareAmount
          }
          isJuicer={transferring.strategy === "juicer"}
          assetId={transferring.assetId}
          open
          onClose={() => setTransferring(null)}
        />
      )}
    </TableContainer>
  )
}

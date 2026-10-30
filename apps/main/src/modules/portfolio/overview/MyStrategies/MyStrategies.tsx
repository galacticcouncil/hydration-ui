import NoPositions from "@galacticcouncil/ui/assets/images/NoPositions.png"
import {
  Alert,
  Box,
  Button,
  DataTable,
  Modal,
  ModalHeader,
  Separator,
  TableContainer,
  Text,
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
import { MyBondsTable } from "@/modules/portfolio/overview/MyBonds/MyBondsTable"
import { useMyBondsTableData } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.data"
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
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  searchPhrase: string
  paginationProps: PaginationProps
  sortingProps: SortingProps
}

type StrategiesProps = Props & {
  bondsPaginationProps: PaginationProps
  bondsSortingProps: SortingProps
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

// Reuse the gated reads for the combined Assets experiment, without changing
// wallet balance accounting or mounting unsupported strategy contracts.
export const MyStrategiesPositions = ({ children }: DataProps) => {
  const { featureFlags, isReady } = useRpcProvider()
  const renderPositions = (juicer: PositionsResult) => (
    <EnabledBilPositions enabled={isReady && featureFlags.bilEnabled}>
      {(bil) =>
        children({
          data: [...juicer.data, ...bil.data],
          isLoading: !isReady || juicer.isLoading || bil.isLoading,
          isError: juicer.isError || bil.isError,
        })
      }
    </EnabledBilPositions>
  )

  return isReady && featureFlags.propellerEnabled ? (
    <JuicerPositions>{renderPositions}</JuicerPositions>
  ) : (
    renderPositions(EMPTY_POSITIONS)
  )
}

export const MyStrategies = ({
  bondsPaginationProps,
  bondsSortingProps,
  ...props
}: StrategiesProps) => {
  const { t } = useTranslation("wallet")
  const { featureFlags, isReady } = useRpcProvider()
  const { data: bonds, isLoading: isBondsLoading } = useMyBondsTableData()
  const showBonds = isBondsLoading || bonds.length > 0
  const renderPositions = (juicer: PositionsResult) => (
    <EnabledBilPositions enabled={isReady && featureFlags.bilEnabled}>
      {(bil) => (
        <MyStrategiesTable
          {...props}
          data={[...juicer.data, ...bil.data]}
          isLoading={!isReady || juicer.isLoading || bil.isLoading}
          isError={juicer.isError || bil.isError}
          hideEmpty={showBonds}
        />
      )}
    </EnabledBilPositions>
  )

  return (
    <>
      {isReady && featureFlags.propellerEnabled ? (
        <JuicerPositions>{renderPositions}</JuicerPositions>
      ) : (
        renderPositions(EMPTY_POSITIONS)
      )}
      {showBonds && (
        <Box>
          <Separator />
          <Box px="m" py="s">
            <Text fs="p6" fw={600}>
              {t("myAssets.tabs.bonds")}
            </Text>
          </Box>
          <Separator />
          <MyBondsTable
            data={bonds}
            isLoading={isBondsLoading}
            searchPhrase={props.searchPhrase}
            paginationProps={bondsPaginationProps}
            sortingProps={bondsSortingProps}
          />
        </Box>
      )}
    </>
  )
}

const MyStrategiesTable = ({
  data,
  isLoading,
  isError,
  searchPhrase,
  paginationProps,
  sortingProps,
  hideEmpty,
}: Props & PositionsResult & { hideEmpty: boolean }) => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()
  const [selected, setSelected] = useState<StrategyPosition | null>(null)
  const columns = useMyStrategiesColumns(setSelected)
  const detail = selected
    ? (data.find((position) => position.id === selected.id) ?? selected)
    : null

  if (hideEmpty && !isLoading && !isError && data.length === 0) {
    return null
  }

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
          [
            row.original.symbol,
            row.original.name,
            row.original.underlyingSymbol,
            row.original.strategy,
          ]
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
        open={!!detail && isMobile}
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
              <StrategyPositionActions position={detail} mobile />
            </SAssetDetailModalBody>
          </>
        )}
      </Modal>
    </TableContainer>
  )
}

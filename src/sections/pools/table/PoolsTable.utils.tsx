import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import {
  TPool,
  TXYKPool,
  isXYKPoolType,
  useStableSwapReserves,
} from "sections/pools/PoolsPage.utils"
import { TFarmAprData } from "api/farms"
import { GlobalFarmRowMulti } from "sections/pools/farms/components/globalFarm/GlobalFarmRowMulti"
import { Button, ButtonTransparent } from "components/Button/Button"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import ManageIcon from "assets/icons/IconEdit.svg?react"
import { BN_0, BN_NAN, GETH_ERC20_ASSET_ID } from "utils/constants"
import Skeleton from "react-loading-skeleton"
import BN from "bignumber.js"
import { CellSkeleton } from "components/Skeleton/CellSkeleton"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"
import { SStablepoolBadge } from "sections/pools/pool/Pool.styled"
import { LazyMotion, domAnimation } from "framer-motion"
import { useAssets } from "providers/assets"
import {
  defaultPaginationState,
  useTablePagination,
} from "components/Table/TablePagination"
import { PoolContext } from "sections/pools/pool/Pool"
import { TransferModal } from "sections/pools/stablepool/transfer/TransferModal"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"
import { MoneyMarketAPY } from "sections/pools/stablepool/components/GigaIncentives"

const NonClickableContainer = ({
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div
      onClick={(e) => {
        if (isDesktop) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      sx={{ width: "fit-content", px: 8 }}
      css={{ cursor: "text" }}
      {...rest}
    >
      {children}
    </div>
  )
}

const AssetTableName = ({ pool }: { pool: TPool | TXYKPool }) => {
  const { meta: asset, farms, fee, totalFee, isStablePool } = pool

  const isDesktop = useMedia(theme.viewport.gte.md)
  const isFarmsVisible = !isDesktop || asset.isShareToken

  return (
    <NonClickableContainer sx={{ flex: "row", gap: 8, align: "center" }}>
      <MultipleAssetLogo size={26} iconId={asset.iconId} />
      <div sx={{ flex: "column", width: "100%", gap: [0, 4] }}>
        <div sx={{ flex: "row", gap: 4, width: "fit-content" }}>
          <Text
            fs={14}
            lh={16}
            color="white"
            font="GeistSemiBold"
            css={{ whiteSpace: "nowrap" }}
          >
            {asset.symbol}
          </Text>
          {isStablePool && (
            <div css={{ position: "relative" }}>
              <LazyMotion features={domAnimation}>
                <SStablepoolBadge
                  whileHover={{ width: "unset" }}
                  css={{
                    width: 14,
                    overflow: "hidden",
                    position: "absolute",
                  }}
                  transition={{
                    type: "spring",
                    mass: 1,
                    stiffness: 300,
                    damping: 20,
                    duration: 0.2,
                  }}
                />
              </LazyMotion>
            </div>
          )}
        </div>

        {isStablePool && (
          <Text
            fs={11}
            color="white"
            css={{ opacity: 0.61, whiteSpace: "nowrap" }}
          >
            {asset.name}
          </Text>
        )}
        {!!farms?.length && isFarmsVisible && (
          <GlobalFarmRowMulti
            fontSize={11}
            iconSize={11}
            assetFee={asset.isShareToken ? undefined : fee}
            totalFee={asset.isShareToken ? undefined : totalFee}
            farms={farms}
            withAprSuffix
          />
        )}
      </div>
    </NonClickableContainer>
  )
}

const AddLiquidityButton: React.FC<{
  pool: TPool | TXYKPool
}> = ({ pool }) => {
  const { t } = useTranslation()
  const { native } = useAssets()
  const [open, setOpen] = useState(false)
  const farms = pool.farms

  if (native.id === pool.id) return null

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setOpen(true)
  }

  const styles = {
    height: 26,
    padding: "6px 8px",
    width: 88,
    "& > span": {
      fontSize: 12,
      gap: 4,
      alignItems: "center",
    },
  }

  return (
    <>
      {farms.length > 0 ? (
        <Button variant="primary" size="small" css={styles} onClick={onClick}>
          {t("liquidity.asset.actions.joinFarms")}
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="small"
          css={[
            styles,
            {
              borderColor: `rgba(${theme.rgbColors.brightBlue300}, 0.4)`,
            },
          ]}
          onClick={onClick}
        >
          {t("liquidity.asset.actions.joinPool")}
        </Button>
      )}
      {open &&
        (!isXYKPoolType(pool) && pool.isStablePool ? (
          <StablePoolModalWrapper pool={pool} onClose={() => setOpen(false)} />
        ) : (
          <LiquidityModalWrapper pool={pool} onClose={() => setOpen(false)} />
        ))}
    </>
  )
}

const LiquidityModalWrapper: React.FC<{
  pool: TPool | TXYKPool
  onClose: () => void
}> = ({ pool, onClose }) => {
  if (!pool) return null

  return (
    <PoolContext.Provider
      value={{
        pool,
        isXYK: isXYKPoolType(pool),
      }}
    >
      <AddLiquidity isOpen onClose={onClose} />
    </PoolContext.Provider>
  )
}

const StablePoolModalWrapper = ({
  pool,
  onClose,
}: {
  pool: TPool
  onClose: () => void
}) => {
  const stablepoolDetails = useStableSwapReserves(pool.poolId)

  const initialAssetId = (() => {
    if (!pool.isGETH) {
      return undefined
    }

    const hasGethBalance = new BN(pool.balance?.transferable || "0").gt(0)

    return hasGethBalance ? GETH_ERC20_ASSET_ID : undefined
  })()

  return (
    <PoolContext.Provider
      value={{
        pool: { ...pool, ...stablepoolDetails.data },
        isXYK: false,
      }}
    >
      <TransferModal
        onClose={onClose}
        farms={pool.farms}
        disabledOmnipool={!pool.isGETH}
        skipOptions={pool.isGETH}
        initialAssetId={initialAssetId}
      />
    </PoolContext.Provider>
  )
}

const ManageLiquidityButton: React.FC<{
  pool: TPool | TXYKPool
  onRowSelect: (id: string) => void
}> = ({ pool, onRowSelect }) => {
  const { t } = useTranslation()

  const isXykPool = isXYKPoolType(pool)

  const userStablePoolBalance = pool.isStablePool
    ? pool.balance?.transferable ?? "0"
    : "0"

  let positionsAmount: BN = BN_0

  if (isXykPool) {
    positionsAmount = BN(pool.miningPositions.length).plus(
      pool.shareTokenIssuance?.myPoolShare?.gt(0) ? 1 : 0,
    )
  } else {
    positionsAmount = BN(pool.omnipoolPositions.length)
      .plus(pool.miningPositions.length)
      .plus(BN(userStablePoolBalance).gt(0) ? 1 : 0)
  }

  const isPositions = positionsAmount.gt(0)

  const onClick = () => onRowSelect(pool.id)

  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
      }}
      css={{ position: "relative" }}
    >
      <Button
        size="small"
        css={{
          borderColor: `rgba(${theme.rgbColors.brightBlue300}, 0.4)`,
          height: 26,
          padding: "6px 8px",
          width: 88,
          "& > span": {
            fontSize: 12,
            gap: 4,
            alignItems: "center",
          },
        }}
        onClick={onClick}
      >
        {isPositions ? <Icon icon={<ManageIcon />} size={12} /> : null}
        {isPositions ? t("manage") : t("details")}
      </Button>
      {isPositions && (
        <Text
          fs={9}
          css={{
            position: "absolute",
            bottom: "-14px",
            whiteSpace: "nowrap",
            width: "100%",
            textAlign: "center",
          }}
          color="whiteish500"
        >
          {t("liquidity.asset.actions.myPositions.amount", {
            count: positionsAmount.toNumber(),
          })}
        </Text>
      )}
    </div>
  )
}

const APY = ({
  assetId,
  fee,
  isLoading,
  totalFee,
  farms,
}: {
  assetId: string
  fee: BN
  isLoading: boolean
  totalFee: BN
  farms?: TFarmAprData[]
}) => {
  const { t } = useTranslation()
  const { native } = useAssets()

  if (isLoading) {
    return <CellSkeleton />
  }

  if (farms?.length)
    return (
      <GlobalFarmRowMulti assetFee={fee} farms={farms} totalFee={totalFee} />
    )

  return (
    <Text color="white" fs={14}>
      {assetId === native.id
        ? "--"
        : t("value.percentage", { value: totalFee })}
    </Text>
  )
}

export const usePoolTable = (
  data: TPool[] | TXYKPool[],
  isXyk: boolean,
  onRowSelect: (id: string) => void,
  paginated?: boolean,
) => {
  const { t } = useTranslation()

  const { accessor, display } = createColumnHelper<TPool | TXYKPool>()
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useTablePagination()

  const isTablet = useMedia(theme.viewport.gte.sm)
  const isDesktop = useMedia(theme.viewport.gte.md)

  const columnVisibility: VisibilityState = {
    name: true,
    spotPrice: isDesktop,
    volume: true,
    tvlDisplay: isTablet,
    apy: isDesktop,
    actions: isTablet,
  }

  const columns = useMemo(
    () => [
      accessor("name", {
        id: "name",
        header: t("liquidity.table.header.poolAsset"),
        sortingFn: (a, b) => a.original.symbol.localeCompare(b.original.symbol),
        cell: ({ row }) => <AssetTableName pool={row.original} />,
      }),
      ...(!isXyk
        ? [
            accessor("spotPrice", {
              id: "spotPrice",
              header: t("liquidity.table.header.price"),
              sortingFn: (a, b) =>
                BN(a.original.spotPrice ?? 1).gt(b.original.spotPrice ?? 1)
                  ? 1
                  : -1,
              cell: ({ row }) => (
                <NonClickableContainer>
                  <Text color="white" fs={14}>
                    <DisplayValue
                      value={
                        row.original.spotPrice
                          ? BN(row.original.spotPrice)
                          : BN_NAN
                      }
                      type="token"
                    />
                  </Text>
                </NonClickableContainer>
              ),
            }),
          ]
        : []),
      accessor("id", {
        id: "volume",
        header: t("liquidity.table.header.volume"),
        sortingFn: (a, b) =>
          BN(a.original.volume ?? 0).gt(b.original.volume ?? 0) ? 1 : -1,
        cell: ({ row }) => {
          const pool = row.original
          const isInvalid = isXYKPoolType(pool) && pool.isInvalid

          if (pool.isVolumeLoading) return <Skeleton width={60} height={18} />
          return (
            <NonClickableContainer
              sx={{
                flex: "row",
                gap: 4,
                align: "center",
                ml: ["auto", "unset"],
              }}
            >
              <Text color="white" fs={14}>
                <DisplayValue
                  value={isInvalid || !pool.volume ? BN_NAN : BN(pool.volume)}
                />
              </Text>

              {isInvalid && (
                <InfoTooltip text={t("liquidity.table.invalidPool.tooltip")}>
                  <SInfoIcon />
                </InfoTooltip>
              )}

              <ButtonTransparent sx={{ display: ["inherit", "none"] }}>
                <Icon
                  sx={{ color: "darkBlue300" }}
                  icon={<ChevronRightIcon />}
                />
              </ButtonTransparent>
            </NonClickableContainer>
          )
        },
      }),
      accessor("tvlDisplay", {
        id: "tvlDisplay",
        header: t("liquidity.table.header.tvl"),
        size: 220,
        sortingFn: (a, b) =>
          a.original.tvlDisplay.gt(b.original.tvlDisplay) ? 1 : -1,
        cell: ({ row }) => {
          const isInvalid =
            isXYKPoolType(row.original) && row.original.isInvalid
          return (
            <NonClickableContainer
              sx={{
                flex: "row",
                gap: 4,
              }}
            >
              <Text color="white" fs={14}>
                <DisplayValue
                  value={isInvalid ? BN_NAN : row.original.tvlDisplay}
                />
              </Text>
              {isInvalid && (
                <InfoTooltip text={t("liquidity.table.invalidPool.tooltip")}>
                  <SInfoIcon />
                </InfoTooltip>
              )}
            </NonClickableContainer>
          )
        },
      }),
      ...(!isXyk
        ? [
            accessor("totalFee", {
              id: "apy",
              sortingFn: (a, b) =>
                a.original.totalFee.gt(b.original.totalFee) ? 1 : -1,
              //@ts-ignore
              header: (
                <div
                  sx={{
                    flex: "row",
                    align: "center",
                    gap: 4,
                  }}
                >
                  {t("stats.overview.table.assets.header.apy")}
                  <InfoTooltip
                    text={t("stats.overview.table.assets.header.apy.desc")}
                  >
                    <SInfoIcon />
                  </InfoTooltip>
                </div>
              ),
              cell: ({ row }) =>
                !isXYKPoolType(row.original) ? (
                  <NonClickableContainer>
                    {row.original.isGDOT || row.original.isGETH ? (
                      <MoneyMarketAPY
                        type="supply"
                        assetId={row.original.poolId}
                        withFarms
                      />
                    ) : (
                      <APY
                        assetId={row.original.id}
                        fee={row.original.fee}
                        isLoading={row.original.isFeeLoading}
                        totalFee={row.original.totalFee}
                        farms={row.original.farms}
                      />
                    )}
                  </NonClickableContainer>
                ) : null,
            }),
          ]
        : []),
      display({
        id: "actions",
        cell: ({ row }) => (
          <div
            sx={{
              flex: "row",
              gap: 8,
              align: "center",
              justify: "end",
            }}
          >
            <AddLiquidityButton pool={row.original} />
            <ManageLiquidityButton
              pool={row.original}
              onRowSelect={onRowSelect}
            />
          </div>
        ),
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isDesktop],
  )

  return useReactTable({
    data,
    columns,
    state: { sorting, columnVisibility, pagination },
    onSortingChange: (data) => {
      setSorting(data)
      paginated && setPagination(defaultPaginationState)
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    ...(paginated
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          onPaginationChange: setPagination,
          autoResetPageIndex: false,
        }
      : {}),
  })
}

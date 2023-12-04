import {
  SortingState,
  VisibilityState,
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useRpcProvider } from "providers/rpcProvider"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import {
  TPool,
  TXYKPool,
  derivePoolAccount,
  isXYKPoolType,
} from "sections/pools/PoolsPage.utils"
import { useFarms } from "api/farms"
import { GlobalFarmRowMulti } from "sections/pools/farms/components/globalFarm/GlobalFarmRowMulti"
import { Button, ButtonTransparent } from "components/Button/Button"
import ChevronRightIcon from "assets/icons/ChevronRight.svg?react"
import PlusIcon from "assets/icons/PlusIcon.svg?react"
import { BN_0, BN_1, BN_MILL } from "utils/constants"
import { useVolume } from "api/volume"
import Skeleton from "react-loading-skeleton"
import { useXYKPoolTradeVolumes } from "sections/pools/pool/details/PoolDetails.utils"
import {
  Page,
  TransferModal,
} from "sections/pools/stablepool/transfer/TransferModal"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"
import { useAccountBalances } from "api/accountBalances"
import { useStableswapPool } from "api/stableswap"
import { normalizeBigNumber } from "utils/balance"
import { useAccountStore } from "state/store"

const AssetTableName = ({ id }: { id: string }) => {
  const { assets } = useRpcProvider()
  const asset = assets.getAsset(id)

  const farms = useFarms([id])

  const iconIds =
    assets.isStableSwap(asset) || assets.isShareToken(asset)
      ? asset.assets
      : asset.id

  return (
    <div>
      <div sx={{ flex: "row", gap: 8, align: "center" }}>
        {typeof iconIds === "string" ? (
          <Icon
            size={26}
            icon={<AssetLogo id={iconIds} />}
            css={{ flex: "1 0 auto" }}
          />
        ) : (
          <MultipleIcons
            size={26}
            icons={iconIds.map((asset) => ({
              icon: <AssetLogo id={asset} />,
            }))}
          />
        )}

        <div sx={{ flex: "column", width: "100%", gap: [0, 4] }}>
          <Text fs={14} lh={16} fw={700} color="white">
            {asset.symbol}
          </Text>
          {farms.data?.length ? (
            <GlobalFarmRowMulti farms={farms.data} />
          ) : null}
        </div>
      </div>
    </div>
  )
}

const Volume = ({
  assetId,
  poolAddress,
}: {
  assetId: string
  poolAddress?: string
}) => {
  const volumeOmnipool = useVolume(poolAddress ? undefined : assetId)
  const xykVolume = useXYKPoolTradeVolumes(poolAddress ? [poolAddress] : [])

  const volume =
    volumeOmnipool.data?.volume ?? xykVolume.data?.[0]?.volume ?? BN_0

  if (volumeOmnipool.isInitialLoading || xykVolume.isLoading)
    return <Skeleton width={60} height={18} />

  return (
    <div
      sx={{
        flex: "row",
        gap: 4,
        align: "center",
        justify: ["end", "start"],
        minWidth: [110, "auto"],
      }}
    >
      <Text color="white" fs={14}>
        <DisplayValue value={volume} />
      </Text>

      <ButtonTransparent sx={{ display: ["inherit", "none"] }}>
        <Icon sx={{ color: "darkBlue300" }} icon={<ChevronRightIcon />} />
      </ButtonTransparent>
    </div>
  )
}

const AddLiqduidityButton = ({ pool }: { pool: TPool | TXYKPool }) => {
  const { account } = useAccountStore()
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const [addLiquidityPool, setAddLiquidityPool] = useState<
    TPool | TXYKPool | undefined
  >(undefined)

  const [addLiquidityStablepool, setLiquidityStablepool] = useState<Page>()

  const isXykPool = isXYKPoolType(pool)

  const assetMeta = assets.getAsset(pool.id)
  const isStablePool = assets.isStableSwap(assetMeta)

  const poolAccountAddress = derivePoolAccount(assetMeta.id)

  const stablePoolBalance = useAccountBalances(
    isStablePool ? poolAccountAddress : undefined,
  )

  const stablepool = useStableswapPool(isStablePool ? assetMeta.id : undefined)

  const reserves = isStablePool
    ? (stablePoolBalance.data?.balances ?? []).map((balance) => {
        const id = balance.id.toString()
        const meta = assets.getAsset(id)

        return {
          asset_id: Number(id),
          decimals: meta.decimals,
          amount: balance.freeBalance.toString(),
        }
      })
    : []

  return (
    <>
      <Button
        size="small"
        disabled={!pool.canAddLiquidity || account?.isExternalWalletConnected}
        css={{
          height: 26,
          padding: "6px 8px",
          "& > span": {
            fontSize: 12,
            gap: 2,
            alignItems: "center",
          },
        }}
        onClick={() =>
          isStablePool
            ? setLiquidityStablepool(Page.OPTIONS)
            : setAddLiquidityPool(pool)
        }
      >
        <Icon icon={<PlusIcon />} size={12} />
        {t("add")}
      </Button>
      {addLiquidityPool && (
        <AddLiquidity
          isOpen
          onClose={() => setAddLiquidityPool(undefined)}
          pool={addLiquidityPool}
        />
      )}
      {addLiquidityStablepool !== undefined && !isXykPool && (
        <TransferModal
          pool={{
            ...pool,
            isStablePool,
            reserves,
            stablepoolFee: stablepool.data?.fee
              ? normalizeBigNumber(stablepool.data.fee).div(BN_MILL)
              : undefined,
          }}
          isOpen
          defaultPage={addLiquidityStablepool}
          onClose={() => setLiquidityStablepool(undefined)}
        />
      )}
    </>
  )
}

export const usePoolTable = (data: TPool[] | TXYKPool[], isXyk: boolean) => {
  const { t } = useTranslation()

  const { accessor, display } = createColumnHelper<TPool | TXYKPool>()
  const [sorting, setSorting] = useState<SortingState>([])

  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility: VisibilityState = {
    name: true,
    spotPrice: isDesktop,
    tvlDisplay: isDesktop,
    fee: isDesktop,
    volumeDisplay: true,
    actions: isDesktop,
  }

  const columns = useMemo(
    () => [
      accessor("name", {
        id: "name",
        header: t("liquidity.table.header.poolAsset"),
        sortingFn: (a, b) => a.original.name.localeCompare(b.original.name),
        cell: ({ row }) => <AssetTableName id={row.original.id} />,
      }),
      isXyk
        ? accessor("fee", {
            id: "fee",
            header: t("fee"),
            sortingFn: (a, b) => (a.original.fee.gt(b.original.fee) ? 1 : -1),
            cell: ({ row }) => (
              <Text color="white" fs={14}>
                {t("value.percentage", { value: row.original.fee })}
              </Text>
            ),
          })
        : accessor("spotPrice", {
            id: "spotPrice",
            header: t("liquidity.table.header.price"),
            sortingFn: (a, b) =>
              (a.original.spotPrice ?? BN_1).gt(b.original.spotPrice ?? 1)
                ? 1
                : -1,
            cell: ({ row }) => (
              <Text color="white" fs={14}>
                <DisplayValue value={row.original.spotPrice} type="token" />
              </Text>
            ),
          }),

      accessor("tvlDisplay", {
        id: "tvlDisplay",
        header: t("liquidity.table.header.tvl"),
        size: 250,
        sortingFn: (a, b) =>
          a.original.tvlDisplay.gt(b.original.tvlDisplay) ? 1 : -1,
        cell: ({ row }) => (
          <Text color="white" fs={14}>
            <DisplayValue value={row.original.tvlDisplay} />
          </Text>
        ),
      }),
      accessor("id", {
        id: "volumeDisplay",
        header: t("liquidity.table.header.volume"),
        cell: ({ row }) => {
          const pool = row.original
          const isXyk = isXYKPoolType(pool)

          return (
            <Volume
              assetId={pool.id}
              poolAddress={isXyk ? pool.poolAddress : undefined}
            />
          )
        },
      }),
      display({
        id: "actions",
        cell: ({ row }) => (
          <div
            sx={{
              flex: "row",
              gap: 4,
              align: "center",
              justify: ["end", "start"],
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          >
            <AddLiqduidityButton pool={row.original} />
            <ButtonTransparent>
              <Icon sx={{ color: "darkBlue300" }} icon={<ChevronRightIcon />} />
            </ButtonTransparent>
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
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
}

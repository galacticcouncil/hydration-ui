import {
  ChevronRight,
  CupSoda,
  Ellipsis,
  Plus,
  Trash,
} from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Box,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  Icon,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  AssetLabelFull,
  AssetLabelXYK,
} from "@/components/AssetLabelFull/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"

import {
  BalanceTableData,
  IsolatedPositionTableData,
  OmnipoolPositionTableData,
} from "./PositionsTable.utils"

const omnipoolColumnHelper = createColumnHelper<
  OmnipoolPositionTableData | BalanceTableData
>()
const balanceColumnHelper = createColumnHelper<BalanceTableData>()
const isolatedColumnHelper = createColumnHelper<IsolatedPositionTableData>()

export const isOmnipoolPosition = (
  row: OmnipoolPositionTableData | BalanceTableData,
): row is OmnipoolPositionTableData => {
  return "meta" in row && "data" in row
}

export const getOmnipoolPositionsTableColumns = (
  isMobile: boolean,
  isFarms: boolean,
) => ({
  position: !isMobile,
  initialAmount: !isMobile,
  currentValue: true,
  joinedFarms: !isMobile || isFarms,
  actions: true,
})

export const getBalanceTableColumns = (isMobile: boolean) => ({
  ["meta_name"]: !isMobile,
  totalValue: true,
  actions: true,
})

export const getIsolatedPositionsTableColumns = (
  isMobile: boolean,
  isFarms: boolean,
) => ({
  position: !isMobile,
  amount: true,
  joinedFarms: !isMobile || isFarms,
  actions: true,
})

export const useOmnipoolPositionsTableColumns = (isFarms: boolean) => {
  const { t } = useTranslation(["common", "liquidity"])
  const format = useFormatOmnipoolPositionData()
  const { isMobile } = useBreakpoints()

  return useMemo(
    () => [
      omnipoolColumnHelper.display({
        id: "position",
        size: 175,
        meta: {
          sxFn: (original) =>
            !isOmnipoolPosition(original)
              ? {
                  // it needs to be overridden because of the issue for sticky column
                  p: "0px !important",
                }
              : {},
        },
        header: t("position"),
        cell: ({ row: { original } }) =>
          isOmnipoolPosition(original) ? (
            <AssetLabelFull asset={original.meta} withName={false} />
          ) : (
            <Box
              height={66}
              py={24}
              px={18}
              sx={{
                borderLeft: `2px solid`,
                borderColor: getToken("buttons.primary.high.rest"),
              }}
            >
              <Text
                fs="p5"
                fw={500}
                color={getToken("text.high")}
                sx={{ whiteSpace: "nowrap" }}
              >
                {original.label}
              </Text>
            </Box>
          ),
      }),
      omnipoolColumnHelper.display({
        id: "initialAmount",
        header: t("liquidity:liquidity.positions.header.initialAmount"),
        cell: ({ row: { original } }) =>
          isOmnipoolPosition(original) ? (
            <Amount
              value={t("currency", {
                value: original.data.initialValueHuman,
                symbol: original.data.meta.symbol,
              })}
              displayValue={t("currency", {
                value: original.data.initialDisplay,
              })}
            />
          ) : (
            "-"
          ),
      }),
      omnipoolColumnHelper.display({
        id: "currentValue",
        header: t("liquidity:liquidity.positions.header.currentValue"),
        cell: ({ row: { original } }) =>
          isOmnipoolPosition(original) ? (
            <Amount
              value={format(original.data)}
              displayValue={t("currency", {
                value: original.data.currentTotalDisplay,
              })}
            />
          ) : (
            <Amount
              value={t("currency", {
                value: original.value,
                symbol: "Shares",
              })}
              displayValue={t("currency", {
                value: original.valueDisplay,
              })}
            />
          ),
      }),
      omnipoolColumnHelper.accessor("joinedFarms", {
        id: "joinedFarms",
        header: t("liquidity:liquidity.positions.header.joinedFarms"),
        meta: {
          visibility: isFarms,
        },
        enableSorting: false,
        size: 100,
        cell: ({ row: { original } }) =>
          isOmnipoolPosition(original) && original.joinedFarms.length ? (
            <Flex
              direction={isMobile ? "column" : "row"}
              align="center"
              gap={getTokenPx("containers.paddings.quint")}
            >
              <AssetLogo
                id={original.joinedFarms.map(({ farm }) =>
                  farm.rewardCurrency.toString(),
                )}
              />
              <Text fs="p6" color={getToken("text.tint.secondary")}>
                {original.aprsByRewardAsset
                  .map((apr) => t("common:percent", { value: apr.totalApr }))
                  .join(" + ")}
              </Text>
            </Flex>
          ) : null,
      }),
      omnipoolColumnHelper.display({
        id: "actions",
        header: t("liquidity:liquidity.positions.header.actions"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row: { original } }) => {
          const isOmnipool = isOmnipoolPosition(original)
          const canJoinFarms =
            isOmnipool && !original.isJoinedAllFarms && original.canJoinFarms
          const isJoinedFarms = isOmnipool && !!original.joinedFarms.length

          if (isMobile) {
            return (
              <Flex align="center" gap={4} justify="flex-end">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <Button variant="tertiary" outline>
                      <Icon component={Ellipsis} size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {canJoinFarms && (
                      <DropdownMenuItem asChild>
                        <MenuSelectionItem
                          variant="filterLink"
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          <MenuItemIcon component={CupSoda} />
                          <MenuItemLabel>
                            <Link
                              to="/liquidity/$id/join"
                              params={{
                                id: original.poolId,
                              }}
                              search={{
                                positionId: original.positionId,
                              }}
                              sx={{ textDecoration: "none" }}
                            >
                              {t("liquidity:joinFarms")}
                            </Link>
                          </MenuItemLabel>
                        </MenuSelectionItem>
                      </DropdownMenuItem>
                    )}
                    {!isOmnipool && (
                      <DropdownMenuItem asChild>
                        <MenuSelectionItem
                          variant="filterLink"
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          <MenuItemIcon component={Plus} />
                          <MenuItemLabel>
                            <Link
                              to="/liquidity/$id/add"
                              params={{
                                id: original.poolId,
                              }}
                              sx={{ textDecoration: "none" }}
                            >
                              {t("liquidity:moveToOmnipool")}
                            </Link>
                          </MenuItemLabel>
                        </MenuSelectionItem>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <MenuSelectionItem
                        variant="filterLink"
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                      >
                        <MenuItemIcon component={Trash} />
                        <MenuItemLabel>
                          <Link
                            to="/liquidity/$id/remove"
                            params={{
                              id: original.poolId,
                            }}
                            search={{
                              positionId: isOmnipool ? original.positionId : "",
                              stableswapId: original.stableswapId,
                            }}
                            sx={{ textDecoration: "none" }}
                          >
                            {t("remove")}
                          </Link>
                        </MenuItemLabel>
                      </MenuSelectionItem>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {(canJoinFarms || isJoinedFarms) && (
                  <Icon
                    component={ChevronRight}
                    size={18}
                    color={getToken("text.low")}
                  />
                )}
              </Flex>
            )
          }

          return (
            <Flex
              gap={getTokenPx("containers.paddings.tertiary")}
              justify="end"
              align="center"
            >
              {canJoinFarms && (
                <Button variant="secondary" asChild>
                  <Link
                    to="/liquidity/$id/join"
                    params={{
                      id: original.poolId,
                    }}
                    search={{
                      positionId: original.positionId,
                    }}
                  >
                    <CupSoda />
                    {t("liquidity:joinFarms")}
                  </Link>
                </Button>
              )}
              {!isOmnipool && (
                <Button
                  variant="secondary"
                  asChild
                  disabled={!original.canAddLiquidity}
                >
                  <Link
                    to="/liquidity/$id/add"
                    params={{
                      id: original.poolId,
                    }}
                  >
                    <Plus />
                    {t("liquidity:moveToOmnipool")}
                  </Link>
                </Button>
              )}
              <Button
                variant="tertiary"
                outline
                sx={{ flexShrink: 0 }}
                asChild
                disabled={!original.canRemoveLiquidity}
              >
                <Link
                  to="/liquidity/$id/remove"
                  params={{
                    id: original.poolId,
                  }}
                  search={{
                    positionId: isOmnipool ? original.positionId : "",
                    stableswapId: original.stableswapId,
                  }}
                >
                  <Trash />
                  {t("remove")}
                </Link>
              </Button>

              {(canJoinFarms || isJoinedFarms) && (
                <Icon
                  size={16}
                  component={ChevronRight}
                  sx={{ justifySelf: "flex-end" }}
                />
              )}
            </Flex>
          )
        },
      }),
    ],
    [t, isFarms, format, isMobile],
  )
}

export const useBalanceTableColumns = () => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isMobile } = useBreakpoints()

  return useMemo(
    () => [
      balanceColumnHelper.display({
        id: "meta_name",
        size: 175,
        header: t("position"),
        cell: ({ row: { original } }) => (
          <AssetLabelFull asset={original.meta} withName={false} />
        ),
      }),
      balanceColumnHelper.display({
        id: "totalValue",
        header: t("totalValue"),
        cell: ({
          row: {
            original: { value, valueDisplay, meta },
          },
        }) => (
          <Amount
            value={t("currency", {
              value: value,
              symbol: meta.symbol,
            })}
            displayValue={t("currency", {
              value: valueDisplay,
            })}
          />
        ),
      }),
      balanceColumnHelper.display({
        id: "actions",
        header: t("liquidity:liquidity.positions.header.actions"),
        size: 320,
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({
          row: {
            original: { isStablepoolInOmnipool, poolId, stableswapId },
          },
        }) => {
          if (isMobile) {
            return (
              <Flex align="center" gap={4} justify="flex-end">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <Button variant="tertiary" outline>
                      <Icon component={Ellipsis} size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {isStablepoolInOmnipool && (
                      <DropdownMenuItem asChild>
                        <MenuSelectionItem
                          variant="filterLink"
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          <MenuItemIcon component={Plus} />
                          <MenuItemLabel>
                            <Link
                              to="/liquidity/$id/add"
                              params={{
                                id: poolId,
                              }}
                              search={{
                                erc20Id: poolId,
                                stableswapId: stableswapId,
                                split: false,
                              }}
                              sx={{ textDecoration: "none" }}
                            >
                              {t("liquidity:moveToOmnipool")}
                            </Link>
                          </MenuItemLabel>
                        </MenuSelectionItem>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <MenuSelectionItem
                        variant="filterLink"
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                      >
                        <MenuItemIcon component={Trash} />
                        <MenuItemLabel>
                          <Link
                            to="/liquidity/$id/remove"
                            params={{
                              id: poolId,
                            }}
                            search={{
                              erc20Id: poolId,
                              stableswapId: stableswapId,
                            }}
                            sx={{ textDecoration: "none" }}
                          >
                            {t("remove")}
                          </Link>
                        </MenuItemLabel>
                      </MenuSelectionItem>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Flex>
            )
          }

          return (
            <Flex gap={12} align="center" justify="end">
              {isStablepoolInOmnipool && (
                <Button variant="secondary" asChild>
                  <Link
                    to="/liquidity/$id/add"
                    params={{
                      id: poolId,
                    }}
                    search={{
                      erc20Id: poolId,
                      stableswapId: stableswapId,
                      split: false,
                    }}
                  >
                    <Plus />
                    {t("liquidity:moveToOmnipool")}
                  </Link>
                </Button>
              )}
              <Button variant="tertiary" outline asChild>
                <Link
                  to="/liquidity/$id/remove"
                  params={{
                    id: poolId,
                  }}
                  search={{
                    erc20Id: poolId,
                    stableswapId: stableswapId,
                  }}
                >
                  <Trash />
                  {t("remove")}
                </Link>
              </Button>
            </Flex>
          )
        },
      }),
    ],
    [t, isMobile],
  )
}

export const useIsolatedPositionsTableColumns = (isFarms: boolean) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isMobile } = useBreakpoints()

  return useMemo(
    () => [
      isolatedColumnHelper.display({
        id: "position",
        size: 250,
        meta: {
          sxFn: (original) =>
            !original.position
              ? {
                  // it needs to be overridden because of the issue for sticky column
                  p: "0px !important",
                }
              : {},
        },
        header: t("position"),
        cell: ({ row: { original } }) =>
          original.position ? (
            <AssetLabelXYK
              iconIds={original.meta.iconId}
              symbol={original.meta.symbol}
            />
          ) : (
            <Box
              height={66}
              py={20}
              px={18}
              sx={{
                borderLeft: `2px solid`,
                borderColor: getToken("buttons.primary.high.rest"),
              }}
            >
              <AssetLabelXYK
                iconIds={original.meta.iconId}
                symbol={original.meta.symbol}
              />
            </Box>
          ),
      }),
      isolatedColumnHelper.display({
        id: "amount",
        header: t("liquidity:liquidity.positions.header.amount"),
        cell: ({ row: { original } }) => (
          <Amount
            value={t("currency", {
              value: original.shareTokens,
              symbol: "Shares",
            })}
            displayValue={t("currency", {
              value: original.shareTokensDisplay,
            })}
          />
        ),
      }),
      isolatedColumnHelper.accessor("joinedFarms", {
        id: "joinedFarms",
        header: t("liquidity:liquidity.positions.header.joinedFarms"),
        size: 150,
        meta: {
          visibility: isFarms,
        },
        enableSorting: false,
        cell: ({
          row: {
            original: { joinedFarms, aprsByRewardAsset },
          },
        }) =>
          joinedFarms.length ? (
            <Flex
              direction={isMobile ? "column" : "row"}
              align="center"
              gap={getTokenPx("containers.paddings.quint")}
            >
              <AssetLogo
                id={joinedFarms.map(({ farm }) =>
                  farm.rewardCurrency.toString(),
                )}
              />
              <Text fs="p6" color={getToken("text.tint.secondary")}>
                {aprsByRewardAsset
                  .map((apr) => t("common:percent", { value: apr.totalApr }))
                  .join(" + ")}
              </Text>
            </Flex>
          ) : null,
      }),
      isolatedColumnHelper.display({
        id: "actions",
        header: t("liquidity:liquidity.positions.header.actions"),
        size: 300,
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({
          row: {
            original: {
              poolId,
              positionId,
              shareTokenId,
              farmsToJoin,
              canJoinFarms,
            },
          },
        }) => {
          if (isMobile) {
            return (
              <Flex align="center" gap={4} justify="flex-end">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <Button variant="tertiary" outline>
                      <Icon component={Ellipsis} size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {!!farmsToJoin.length && !positionId && canJoinFarms && (
                      <DropdownMenuItem asChild>
                        <MenuSelectionItem
                          variant="filterLink"
                          onClick={(e) => {
                            e.preventDefault()
                          }}
                        >
                          <MenuItemIcon component={Plus} />
                          <MenuItemLabel>
                            <Link
                              to="/liquidity/$id/join"
                              params={{
                                id: poolId,
                              }}
                              sx={{ textDecoration: "none" }}
                            >
                              {t("liquidity:joinFarms")}
                            </Link>
                          </MenuItemLabel>
                        </MenuSelectionItem>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <MenuSelectionItem
                        variant="filterLink"
                        onClick={(e) => {
                          e.preventDefault()
                        }}
                      >
                        <MenuItemIcon component={Trash} />
                        <MenuItemLabel>
                          <Link
                            to="/liquidity/$id/remove"
                            params={{
                              id: poolId,
                            }}
                            search={{
                              positionId,
                              shareTokenId: !positionId
                                ? shareTokenId
                                : undefined,
                            }}
                            sx={{ textDecoration: "none" }}
                          >
                            {t("remove")}
                          </Link>
                        </MenuItemLabel>
                      </MenuSelectionItem>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Flex>
            )
          }

          return (
            <Flex gap={12} align="center" justify="end">
              {!!farmsToJoin.length && !positionId && canJoinFarms && (
                <Button variant="secondary" asChild>
                  <Link
                    to="/liquidity/$id/join"
                    params={{
                      id: poolId,
                    }}
                  >
                    <Plus />
                    {t("liquidity:joinFarms")}
                  </Link>
                </Button>
              )}
              <Button variant="tertiary" outline asChild>
                <Link
                  to="/liquidity/$id/remove"
                  params={{
                    id: poolId,
                  }}
                  search={{
                    positionId,
                    shareTokenId: !positionId ? shareTokenId : undefined,
                  }}
                >
                  <Trash />
                  {t("remove")}
                </Link>
              </Button>
            </Flex>
          )
        },
      }),
    ],
    [t, isFarms, isMobile],
  )
}

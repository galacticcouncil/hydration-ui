import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { LiquidityPosition } from "./LiquidityPosition"
import LiquidityIcon from "assets/icons/WaterRippleIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { TPoolFullData } from "sections/pools/PoolsPage.utils"
import { Button, ButtonTransparent } from "components/Button/Button"
import TrashIcon from "assets/icons/IconRemove.svg?react"
import { RemoveLiquidity } from "sections/pools/modals/RemoveLiquidity/RemoveLiquidity"
import { useMemo, useState } from "react"
import { useRefetchAccountNFTPositions } from "api/deposits"
import { SPoolDetailsContainer } from "sections/pools/pool/details/PoolDetails.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { BN_0 } from "utils/constants"
import { Separator } from "components/Separator/Separator"
import { SShadow, SWrapperContainer } from "./LiquidityPosition.styled"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { theme } from "theme"
import { useMedia } from "react-use"

export const LiquidityPositionWrapper = ({ pool }: { pool: TPoolFullData }) => {
  const { t } = useTranslation()
  const {
    assets: { hub },
  } = useRpcProvider()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [openRemove, setOpenRemove] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const refetchPositions = useRefetchAccountNFTPositions()

  const positions = pool.omnipoolNftPositions
  const positionsNumber = positions.length

  const total = useMemo(() => {
    if (positionsNumber) {
      return positions.reduce(
        (acc, position) => {
          const newValues = {
            value: acc.value.plus(position.valueShifted),
            hub: acc.hub.plus(position.lrnaShifted),
            display: acc.display.plus(position.valueDisplay),
          }
          return newValues
        },
        { value: BN_0, hub: BN_0, display: BN_0 },
      )
    }
    return { value: BN_0, hub: BN_0, display: BN_0 }
  }, [positions, positionsNumber])

  if (!positionsNumber) return null

  const withAnimation = positionsNumber > 1
  const isHubValue = total.hub.gt(0)

  const maxHeight = (isDesktop ? 178 : 208) * positionsNumber

  return (
    <SPoolDetailsContainer
      sx={{ pb: withAnimation ? [0, 0] : "initial" }}
      css={{ background: "transparent" }}
    >
      <div
        sx={{ flex: "row", justify: "space-between", align: "center", mb: 12 }}
      >
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Icon size={18} sx={{ color: "pink600" }} icon={<LiquidityIcon />} />
          <Text fs={[16, 16]} color="pink600">
            {t("liquidity.asset.liquidityPositions.title")}
          </Text>
        </div>

        <Button
          variant="error"
          size="compact"
          onClick={() => setOpenRemove(true)}
        >
          <Icon size={12} icon={<TrashIcon />} />
          {t("liquidity.pool.positions.removeAll.btn")}
        </Button>
      </div>

      <div
        sx={{ flex: "row", justify: "space-between", align: "center", py: 12 }}
      >
        <div sx={{ flex: "column", gap: 2 }}>
          <Text color="basic400" fs={[12, 13]} sx={{ mb: 2 }}>
            {t("liquidity.pool.positions.liq")}
          </Text>
          <Text color="white" fs={[14, 16]}>
            {t(isHubValue ? "value.tokenWithHub" : "value.tokenWithSymbol", {
              value: total.value,
              symbol: pool.symbol,
              hub: total.hub,
              hubSymbol: hub.symbol,
            })}
          </Text>
          <Text color="basic500" fs={12}>
            {t("value.usd", { amount: total.display })}
          </Text>
        </div>

        <Separator
          orientation="vertical"
          color="white"
          opacity={0.06}
          sx={{ height: 45 }}
        />

        <div sx={{ flex: "column", gap: 2 }}>
          <Text color="basic400" fs={[12, 13]} sx={{ mb: 2 }}>
            {t("liquidity.pool.positions.liq.number")}
          </Text>
          <Text color="white" fs={[14, 16]}>
            {positionsNumber}
          </Text>
        </div>
      </div>

      {withAnimation && (
        <ButtonTransparent onClick={() => setCollapsed(!collapsed)}>
          <Text fs={14} font="GeistMono" tTransform="uppercase">
            {t(`liquidity.pool.positions.${collapsed ? "hide" : "show"}.btn`, {
              number: positionsNumber,
            })}
          </Text>
          <Icon
            icon={<ChevronDownIcon />}
            sx={{ color: "brightBlue300" }}
            css={{
              transform: collapsed ? "rotate(180deg)" : undefined,
              transition: theme.transitions.default,
            }}
          />
        </ButtonTransparent>
      )}

      <SWrapperContainer
        animate={
          withAnimation
            ? {
                height: collapsed
                  ? maxHeight
                  : positionsNumber * (isDesktop ? 30 : 25),
              }
            : { height: "auto" }
        }
      >
        {positions.map((position, i) => (
          <LiquidityPosition
            key={`${i}-${position.assetId}`}
            position={position}
            index={i + 1}
            onSuccess={refetchPositions}
            pool={pool}
            collapsed={collapsed}
            withAnimation={withAnimation}
          />
        ))}
        <SShadow
          css={{
            display: withAnimation && !collapsed ? "block" : "none",
          }}
        />
      </SWrapperContainer>
      {openRemove && (
        <RemoveLiquidity
          pool={pool}
          position={positions}
          isOpen
          onClose={() => setOpenRemove(false)}
          onSuccess={refetchPositions}
        />
      )}
    </SPoolDetailsContainer>
  )
}

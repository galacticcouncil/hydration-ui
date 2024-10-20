import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { TPoolFullData, TXYKPool } from "sections/pools/PoolsPage.utils"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { XYKPosition } from "sections/pools/pool/xykPosition/XYKPosition"
import { StablepoolPosition } from "sections/pools/stablepool/positions/StablepoolPosition"
import { BN_0 } from "utils/constants"
import { ReactElement, useState } from "react"
import { ButtonTransparent } from "components/Button/Button"
import { theme } from "theme"
import { Icon } from "components/Icon/Icon"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import {
  SPositionContainer,
  SShadow,
  SWrapperContainer,
} from "./MyPositions.styled"
import { LazyMotion, domAnimation } from "framer-motion"
import { usePoolData } from "sections/pools/pool/Pool"

export const MyPositions = () => {
  const { t } = useTranslation()
  const { pool } = usePoolData() as { pool: TPoolFullData }

  const stablepoolAmount = pool.balance?.freeBalance ?? BN_0
  const isPositions = pool.isPositions

  return (
    <>
      {isPositions && (
        <Text
          fs={18}
          font="GeistMono"
          tTransform="uppercase"
          sx={{ px: 30, pt: 12 }}
        >
          {t("liquidity.pool.positions.title")}
        </Text>
      )}

      {pool.isStablePool && <StablepoolPosition amount={stablepoolAmount} />}
      <LiquidityPositionWrapper />
      <FarmingPositionWrapper />
    </>
  )
}

export const MyXYKPositions = () => {
  const { t } = useTranslation()
  const pool = usePoolData().pool as TXYKPool

  if (
    !pool.shareTokenIssuance?.myPoolShare?.gt(0) &&
    !pool.miningPositions.length
  )
    return null

  return (
    <>
      <Text
        fs={18}
        font="GeistMono"
        tTransform="uppercase"
        sx={{ px: 30, pt: 12 }}
      >
        {t("liquidity.pool.positions.title")}
      </Text>

      <XYKPosition pool={pool} />
      <FarmingPositionWrapper />
    </>
  )
}

export const CollapsedPositionsList = ({
  positions,
}: {
  positions: { element: ReactElement; moveTo: number; height: number }[]
}) => {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const positionsNumber = positions.length
  const isCollapsing = positionsNumber > 1

  return (
    <div
      sx={{
        flex: "column",
        gap: 16,
        pb: collapsed || !isCollapsing ? [12, 30] : 0,
      }}
    >
      {isCollapsing && (
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
      <LazyMotion features={domAnimation}>
        <SWrapperContainer
          initial={{ height: positionsNumber * 20 }}
          animate={
            isCollapsing
              ? {
                  height: collapsed ? "auto" : positionsNumber * 20 + 20,
                }
              : { height: "auto" }
          }
        >
          {positions.map((position, index) => {
            return (
              <SPositionContainer
                key={index + position.height}
                initial={{ top: -position.moveTo }}
                animate={{
                  top: collapsed ? "auto" : -position.moveTo,
                }}
                css={
                  isCollapsing
                    ? {
                        position: "relative",
                        pointerEvents: !collapsed ? "none" : "initial",
                      }
                    : undefined
                }
                sx={{ height: position.height }}
              >
                {position.element}
              </SPositionContainer>
            )
          })}

          <SShadow
            css={{
              display: isCollapsing && !collapsed ? "block" : "none",
            }}
          />
        </SWrapperContainer>
      </LazyMotion>
    </div>
  )
}

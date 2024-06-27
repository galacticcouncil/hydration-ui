import { useTokenBalance } from "api/balances"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { TPoolFullData, TXYKPoolFullData } from "sections/pools/PoolsPage.utils"
import { FarmingPositionWrapper } from "sections/pools/farms/FarmingPositionWrapper"
import { LiquidityPositionWrapper } from "sections/pools/pool/positions/LiquidityPositionWrapper"
import { XYKPosition } from "sections/pools/pool/xykPosition/XYKPosition"
import { StablepoolPosition } from "sections/pools/stablepool/positions/StablepoolPosition"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
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

export const MyPositions = ({ pool }: { pool: TPoolFullData }) => {
  const { assets } = useRpcProvider()
  const { account } = useAccount()
  const { t } = useTranslation()
  const meta = assets.getAsset(pool.id)

  const stablepoolBalance = useTokenBalance(
    pool.isStablePool ? pool.id : undefined,
    account?.address,
  )

  const spotPrice = pool.spotPrice
  const stablepoolAmount = stablepoolBalance.data?.freeBalance ?? BN_0
  const stablepoolAmountPrice = spotPrice
    ? stablepoolAmount.shiftedBy(-meta.decimals).multipliedBy(spotPrice)
    : BN_0

  if (
    !pool.miningNftPositions.length &&
    !pool.omnipoolNftPositions.length &&
    !stablepoolBalance.data?.freeBalance.gt(0)
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

      {pool.isStablePool && (
        <StablepoolPosition
          pool={pool}
          amount={stablepoolAmount}
          amountPrice={stablepoolAmountPrice}
        />
      )}
      <LiquidityPositionWrapper pool={pool} />
      <FarmingPositionWrapper pool={pool} />
    </>
  )
}

export const MyXYKPositions = ({ pool }: { pool: TXYKPoolFullData }) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", gap: 12, bg: "gray" }}>
      <Text
        fs={18}
        font="GeistMono"
        tTransform="uppercase"
        sx={{ px: 30, pt: 12 }}
      >
        {t("liquidity.pool.positions.title")}
      </Text>

      <XYKPosition pool={pool} />
      <FarmingPositionWrapper pool={pool} />
    </div>
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
    <div sx={{ flex: "column", gap: 16, pb: collapsed ? [12, 30] : 0 }}>
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
      <SWrapperContainer
        animate={
          isCollapsing
            ? {
                height: collapsed ? "auto" : positionsNumber * 30,
              }
            : { height: "auto" }
        }
      >
        {positions.map((position, index) => {
          return (
            <SPositionContainer
              key={index + position.height}
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
    </div>
  )
}

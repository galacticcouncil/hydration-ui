import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { FarmingPosition } from "./position/FarmingPosition"
import { Icon } from "components/Icon/Icon"
import FPIcon from "assets/icons/PoolsAndFarms.svg?react"
import { ClaimRewardsCard } from "./components/claimableCard/ClaimRewardsCard"
import { TPoolFullData, TXYKPoolFullData } from "sections/pools/PoolsPage.utils"
import { Button, ButtonTransparent } from "components/Button/Button"
import ExitIcon from "assets/icons/Exit.svg?react"
import { useFarmExitAllMutation } from "utils/farms/exit"
import { TOAST_MESSAGES } from "state/toasts"
import { ToastMessage } from "state/store"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { SPoolDetailsContainer } from "sections/pools/pool/details/PoolDetails.styled"
import {
  SShadow,
  SWrapperContainer,
} from "sections/pools/pool/positions/LiquidityPosition.styled"
import { useMemo, useState } from "react"
import { theme } from "theme"
import ChevronDownIcon from "assets/icons/ChevronDown.svg?react"
import { BN_0 } from "utils/constants"
import { useAllOmnipoolDeposits } from "./position/FarmingPosition.utils"
import { Separator } from "components/Separator/Separator"
import { useRpcProvider } from "providers/rpcProvider"

export const FarmingPositionWrapper = ({
  pool,
}: {
  pool: TPoolFullData | TXYKPoolFullData
}) => {
  const { t } = useTranslation()
  const {
    assets: { hub },
  } = useRpcProvider()
  const [collapsed, setCollapsed] = useState(false)
  const { account } = useAccount()

  const miningPositions = useAllOmnipoolDeposits()

  const toast = TOAST_MESSAGES.reduce((memo, type) => {
    const msType = type === "onError" ? "onLoading" : type
    memo[type] = (
      <Trans t={t} i18nKey={`farms.exitAll.toast.${msType}`}>
        <span />
      </Trans>
    )
    return memo
  }, {} as ToastMessage)

  const positions = pool.miningNftPositions

  const exit = useFarmExitAllMutation(positions, pool.id, toast)

  const positionsNumber = positions.length

  const total = useMemo(() => {
    if (miningPositions.data[pool.id]) {
      return miningPositions.data[pool.id].reduce(
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
  }, [miningPositions.data, pool.id])

  if (!positionsNumber) return null

  const withAnimation = positionsNumber > 1
  const isHubValue = total.hub.gt(0)

  return (
    <SPoolDetailsContainer
      sx={{ pb: withAnimation ? [0, 0] : "initial" }}
      css={{ background: "transparent" }}
    >
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div sx={{ flex: "row", align: "center", gap: 8 }}>
          <Icon size={14} sx={{ color: "brightBlue300" }} icon={<FPIcon />} />
          <Text color="brightBlue300">{t("farms.positions.header.title")}</Text>
        </div>
        {withAnimation ? (
          <Button
            variant="error"
            size="compact"
            onClick={() => exit.mutate()}
            disabled={account?.isExternalWalletConnected}
          >
            <Icon size={12} icon={<ExitIcon />} />
            {t("liquidity.pool.farms.exitAll.btn")}
          </Button>
        ) : null}
      </div>

      <div
        sx={{ flex: "row", justify: "space-between", align: "center", py: 12 }}
      >
        <div sx={{ flex: "column", gap: 2 }}>
          <Text color="basic400" fs={[12, 13]} sx={{ mb: 2 }}>
            {t("liquidity.pool.positions.farming")}
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
            {t("liquidity.pool.positions.farm.number")}
          </Text>
          <Text color="white" fs={[14, 16]}>
            {positionsNumber}
          </Text>
        </div>
      </div>

      <ClaimRewardsCard poolId={pool.id} />

      {positionsNumber > 1 && (
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
                  ? positionsNumber * 328
                  : positionsNumber * 25,
              }
            : { height: "auto" }
        }
      >
        {positions.map((item, i) => (
          <FarmingPosition
            key={i}
            poolId={pool.id}
            index={i + 1}
            depositNft={item}
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
    </SPoolDetailsContainer>
  )
}

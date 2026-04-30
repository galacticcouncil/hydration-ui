import {
  ComputedReserveData,
  useFormattedHealthFactor,
} from "@galacticcouncil/money-market/hooks"
import { CircleX } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  AmountLabel,
  AssetLabel,
  Button,
  Flex,
  Icon,
  SpinnerIcon,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { PoolError } from "@/api/pools"
import { AssetLogo } from "@/components/AssetLogo"
import {
  SStrategyPosition,
  SStrategyPositionMobile,
} from "@/modules/borrow/multiply/components/StrategyPosition.styled"
import {
  getMultiplyPairByPosition,
  isLoopedPosition,
  StrategyPositionsData,
  useCloseLoopedPosition,
  useClosePositions,
} from "@/modules/borrow/multiply/components/StrategyPositions.utils"
import { useUnloopingProxySteps } from "@/modules/borrow/multiply/hooks/useUnloopingProxySteps"
import { getEnterWithAssetId } from "@/modules/borrow/multiply/MultiplyApp.utils"
import { RESERVE_LOGO_OVERRIDE_MAP } from "@/modules/borrow/reserve/components/ReserveLabel"
import { useAssets } from "@/providers/assetsProvider"

export const StrategyPositionWrapper = ({
  position,
}: {
  position: StrategyPositionsData
}) => {
  return isLoopedPosition(position) ? (
    <LoopedStrategyPosition position={position} />
  ) : (
    <SimpleStrategyPosition position={position} />
  )
}

const LoopedStrategyPosition = ({
  position,
}: {
  position: StrategyPositionsData & {
    debtReserve: ComputedReserveData
    debtBalance: string
  }
}) => {
  const strategy = getMultiplyPairByPosition(position)

  if (!strategy) throw new Error("Strategy not found")

  const { data: unloopingData } = useUnloopingProxySteps({
    supplied: position.suppliedBalance,
    borrowed: position.debtBalance,
    repayAmount: position.debtBalance,
    supplyReserve: position.suppliedReserve,
    borrowReserve: position.debtReserve,
    enterWithAssetId: strategy.enterWithAssetId,
  })

  const enterWithAssetId = getEnterWithAssetId(
    strategy,
    position.suppliedAssetId,
  )

  const { mutate: closePosition, isPending } = useCloseLoopedPosition(
    unloopingData?.steps ?? [],
    enterWithAssetId,
  )

  return (
    <StrategyPosition
      position={position}
      isPending={isPending}
      onSubmit={() => closePosition(position)}
    />
  )
}

const SimpleStrategyPosition = ({
  position,
}: {
  position: StrategyPositionsData
}) => {
  const { mutate: closePosition, isPending } = useClosePositions()

  return (
    <StrategyPosition
      position={position}
      isPending={isPending}
      onSubmit={() => closePosition(position)}
    />
  )
}

export const StrategyPosition = ({
  position,
  isPending,
  errors,
  onSubmit,
}: {
  position: StrategyPositionsData
  isPending: boolean
  errors?: PoolError[]
  onSubmit: () => void
}) => {
  const { t } = useTranslation("common")
  const { getRelatedAToken } = useAssets()

  const assetId = position.suppliedAssetId
  const ovverideIconId = RESERVE_LOGO_OVERRIDE_MAP[assetId]

  const { isMobile } = useBreakpoints()

  const logoId = ovverideIconId ?? assetId
  const symbol = ovverideIconId
    ? (getRelatedAToken(position.suppliedAssetId)?.symbol ??
      position.suppliedSymbol)
    : position.suppliedSymbol

  const swapErrors = errors
  const isSwapErrors = swapErrors && swapErrors.length > 0

  if (isMobile) {
    return (
      <SStrategyPositionMobile>
        <Flex align="center" gap="s">
          <AssetLogo id={logoId} />
          <AssetLabel symbol={symbol} />
        </Flex>

        <Button
          variant="tertiary"
          size="small"
          width="min-content"
          disabled={isSwapErrors || isPending}
          onClick={onSubmit}
        >
          <Icon component={isPending ? SpinnerIcon : CircleX} size="s" />
          {t("close")}
        </Button>

        <Amount
          label="Net worth"
          value={t("currency", {
            value: position.netWorth,
          })}
        />

        <Amount
          label="APY"
          value={t("percent", {
            value: position.netApy * 100,
          })}
        />

        <HealtFactorValue healthFactor={position.healthFactor} />

        {/* <Amount
          label="Created at"
          value={t("date.default", {
            value: position.createdAt,
            format: "dd.MM.yyyy",
          })}
        /> */}
      </SStrategyPositionMobile>
    )
  }

  return (
    <SStrategyPosition>
      <Flex align="center" gap="s">
        <AssetLogo id={logoId} />
        <AssetLabel symbol={symbol} />
      </Flex>

      <Amount
        label="Net worth"
        value={t("currency", {
          value: position.netWorth,
        })}
      />

      <Amount
        label="APY"
        value={t("percent", {
          value: position.netApy * 100,
        })}
      />

      <HealtFactorValue healthFactor={position.healthFactor} />

      <Amount
        label="Created at"
        value={t("date.default", {
          value: position.createdAt,
          format: "dd.MM.yyyy",
        })}
      />

      <Button
        variant="tertiary"
        size="small"
        width="min-content"
        disabled={isSwapErrors || isPending}
        onClick={onSubmit}
      >
        <Icon component={isPending ? SpinnerIcon : CircleX} size="s" />
        {t("close")}
      </Button>
    </SStrategyPosition>
  )
}

const HealtFactorValue = ({ healthFactor }: { healthFactor: string }) => {
  const { t } = useTranslation("common")
  const {
    healthFactor: formattedHealthFactor,
    healthFactorColor,
    isHealthFactorValid,
  } = useFormattedHealthFactor(healthFactor)

  return (
    <Flex direction="column" gap="xs">
      <AmountLabel>Health factor</AmountLabel>
      <Text fs="p4" lh="s" color={healthFactorColor}>
        {isHealthFactorValid
          ? t("number", {
              value: formattedHealthFactor,
            })
          : "-"}
      </Text>
    </Flex>
  )
}

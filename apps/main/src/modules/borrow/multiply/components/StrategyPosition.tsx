import { useFormattedHealthFactor } from "@galacticcouncil/money-market/hooks"
import { CircleX } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  AmountLabel,
  AssetLabel,
  Button,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import {
  SStrategyPosition,
  SStrategyPositionMobile,
} from "@/modules/borrow/multiply/components/StrategyPosition.styled"
import {
  StrategyPositionsData,
  useClosePositions,
} from "@/modules/borrow/multiply/components/StrategyPositions.utils"
import { RESERVE_LOGO_OVERRIDE_MAP } from "@/modules/borrow/reserve/components/ReserveLabel"
import { useAssets } from "@/providers/assetsProvider"

export const StrategyPosition = ({
  position,
}: {
  position: StrategyPositionsData
}) => {
  const { t } = useTranslation("common")
  const { getRelatedAToken } = useAssets()

  const { mutate: closePosition } = useClosePositions()
  const assetId = position.underlyingAssetId
  const ovverideIconId = RESERVE_LOGO_OVERRIDE_MAP[assetId]

  const { isMobile } = useBreakpoints()

  const logoId = ovverideIconId ?? assetId
  const symbol = ovverideIconId
    ? (getRelatedAToken(position.underlyingAssetId)?.symbol ?? position.symbol)
    : position.symbol

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
          onClick={() => closePosition(position)}
        >
          <Icon component={CircleX} size="s" />
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
        onClick={() => closePosition(position)}
      >
        <Icon component={CircleX} size="s" />
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
          ? t("percent", {
              value: formattedHealthFactor,
            })
          : "-"}
      </Text>
    </Flex>
  )
}

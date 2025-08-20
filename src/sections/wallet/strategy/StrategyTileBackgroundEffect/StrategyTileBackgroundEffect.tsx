import { lazy } from "react"
import { FC } from "react"
import { useMedia } from "react-use"
import { StrategyTileVariant } from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import { theme } from "theme"
import { neverGuard } from "utils/helpers"

const StrategyTileBackgroundVariant1Desktop1 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffectDesktop1.svg?react"
    )
  ).default,
}))

const StrategyTileBackgroundVariant1Desktop2 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffectDesktop2.svg?react"
    )
  ).default,
}))

const HollarEffect = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/StrategyTileBackgroundEffect/HollarEffect.svg?react"
    )
  ).default,
}))

const GETHEffect = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/StrategyTileBackgroundEffect/GETHEffect.svg?react"
    )
  ).default,
}))

const StrategyTileBackgroundMobile1 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffectMobile1.svg?react"
    )
  ).default,
}))

const StrategyTileBackgroundMobile2 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffectMobile2.svg?react"
    )
  ).default,
}))

type Props = {
  readonly variant: StrategyTileVariant
}

export const StrategyTileBackgroundEffect: FC<Props> = ({ variant }) => {
  const isMobile = useMedia(theme.viewport.lt.md)

  if (isMobile) {
    switch (variant) {
      case StrategyTileVariant.One:
        return (
          <>
            <StrategyTileBackgroundMobile1 />
            <StrategyTileBackgroundMobile2 />
          </>
        )
      case StrategyTileVariant.Two:
        return <GETHEffect />
      case StrategyTileVariant.Hollar:
        return <HollarEffect />
      default:
        neverGuard(variant)
    }
  }

  switch (variant) {
    case StrategyTileVariant.One:
      return (
        <>
          <StrategyTileBackgroundVariant1Desktop1 />
          <StrategyTileBackgroundVariant1Desktop2 />
        </>
      )
    case StrategyTileVariant.Two:
      return <GETHEffect />
    case StrategyTileVariant.Hollar:
      return <HollarEffect />
    default:
      neverGuard(variant)
  }
}

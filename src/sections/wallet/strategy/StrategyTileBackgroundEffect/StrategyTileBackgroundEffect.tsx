import { lazy } from "react"
import { FC } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"

const StrategyTileBackgroundDesktop1 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffectDesktop1.svg?react"
    )
  ).default,
}))

const StrategyTileBackgroundDesktop2 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffectDesktop2.svg?react"
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

export const StrategyTileBackgroundEffect: FC = () => {
  const isMobile = useMedia(theme.viewport.lt.md)

  return isMobile ? (
    <>
      <StrategyTileBackgroundMobile1 />
      <StrategyTileBackgroundMobile2 />
    </>
  ) : (
    <>
      <StrategyTileBackgroundDesktop1 />
      <StrategyTileBackgroundDesktop2 />
    </>
  )
}

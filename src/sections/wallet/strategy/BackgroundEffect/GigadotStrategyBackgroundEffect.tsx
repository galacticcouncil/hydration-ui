import { lazy } from "react"
import { FC } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"

const GigadotStrategyBackgroundDesktop1 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/BackgroundEffect/GigadotStrategyBackgroundDesktop1.svg?react"
    )
  ).default,
}))

const GigadotStrategyBackgroundDesktop2 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/BackgroundEffect/GigadotStrategyBackgroundDesktop2.svg?react"
    )
  ).default,
}))

const GigadotStrategyBackgroundMobile1 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/BackgroundEffect/GigadotStrategyBackgroundMobile1.svg?react"
    )
  ).default,
}))

const GigadotStrategyBackgroundMobile2 = lazy(async () => ({
  default: (
    await import(
      "sections/wallet/strategy/BackgroundEffect/GigadotStrategyBackgroundMobile2.svg?react"
    )
  ).default,
}))

export const GigadotStrategyBackgroundEffect: FC = () => {
  const isMobile = useMedia(theme.viewport.lt.sm)

  return isMobile ? (
    <>
      <GigadotStrategyBackgroundMobile1 />
      <GigadotStrategyBackgroundMobile2 />
    </>
  ) : (
    <>
      <GigadotStrategyBackgroundDesktop1 />
      <GigadotStrategyBackgroundDesktop2 />
    </>
  )
}

import { useLbpPool } from "api/bonds"
import { useBestNumber } from "api/chain"
import IconBonds from "assets/icons/Bonds.svg?react"
import IconDCA from "assets/icons/navigation/IconDCA.svg?react"
import IconOTC from "assets/icons/navigation/IconOTC.svg?react"
import IconSwap from "assets/icons/navigation/IconSwap.svg?react"
import {
  SubNavigation,
  SubNavigationTabLink,
} from "components/Layout/SubNavigation/SubNavigation"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"

const isOtcPageEnabled = import.meta.env.VITE_FF_OTC_ENABLED === "true"
const isDcaPageEnabled = import.meta.env.VITE_FF_DCA_ENABLED === "true"
const isBondsPageEnabled = import.meta.env.VITE_FF_BONDS_ENABLED === "true"

export const BondsTabLink = () => {
  const { t } = useTranslation()
  const {
    assets: { bonds },
  } = useRpcProvider()

  const lbpPool = useLbpPool()
  const bestNumber = useBestNumber()

  const currentBlockNumber = bestNumber.data?.relaychainBlockNumber.toNumber()

  const isActive = useMemo(() => {
    if (bonds) {
      return bonds.some((bond) => {
        const pool = lbpPool.data?.find((pool) =>
          pool.assets.some((assetId: number) => assetId === Number(bond.id)),
        )

        if (currentBlockNumber && pool && pool.start && pool.end) {
          return (
            currentBlockNumber > Number(pool.start) &&
            currentBlockNumber < Number(pool.end)
          )
        }

        return false
      })
    }
  }, [bonds, currentBlockNumber, lbpPool.data])

  return (
    <SubNavigationTabLink
      to={LINKS.bonds}
      icon={<IconBonds />}
      label={t("header.trade.bonds.title")}
      badge={isActive ? t("header.trade.active") : ""}
    />
  )
}

export const Navigation = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()
  return (
    <SubNavigation>
      <SubNavigationTabLink
        to={LINKS.swap}
        icon={<IconSwap />}
        label={t("header.trade.swap.title")}
      />
      {isOtcPageEnabled && (
        <SubNavigationTabLink
          to={LINKS.otc}
          icon={<IconOTC />}
          label={t("header.trade.otc.title")}
        />
      )}
      {isDcaPageEnabled && (
        <SubNavigationTabLink
          to={LINKS.dca}
          icon={<IconDCA />}
          label={t("header.trade.dca.title")}
        />
      )}
      {isBondsPageEnabled ? (
        isLoaded ? (
          <BondsTabLink />
        ) : (
          <SubNavigationTabLink
            to={LINKS.bonds}
            icon={<IconBonds />}
            label={t("header.trade.bonds.title")}
          />
        )
      ) : null}
    </SubNavigation>
  )
}

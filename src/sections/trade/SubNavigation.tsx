import { LINKS } from "utils/navigation"
import { useTranslation } from "react-i18next"
import IconDCA from "assets/icons/navigation/IconDCA.svg?react"
import IconOTC from "assets/icons/navigation/IconOTC.svg?react"
import IconSwap from "assets/icons/navigation/IconSwap.svg?react"
import IconBonds from "assets/icons/Bonds.svg?react"
import { Link, useSearch } from "@tanstack/react-location"
import { ReactNode, useMemo } from "react"
import { Text } from "components/Typography/Text/Text"
import { Icon } from "components/Icon/Icon"
import { theme } from "theme"
import {
  SBadge,
  STabContainer,
  SubNavigationContainer,
} from "./sections/SubNavigation.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useLbpPool } from "api/bonds"
import { useBestNumber } from "api/chain"

const isOtcPageEnabled = import.meta.env.VITE_FF_OTC_ENABLED === "true"
const isDcaPageEnabled = import.meta.env.VITE_FF_DCA_ENABLED === "true"
const isBondsPageEnabled = import.meta.env.VITE_FF_BONDS_ENABLED === "true"

const Tab = ({
  to,
  icon,
  label,
  withBadge,
}: {
  to: string
  icon: ReactNode
  label: string
  withBadge?: boolean
}) => {
  const search = useSearch()

  return (
    <Link
      to={to}
      search={search}
      css={{
        "&:hover > div > p": { color: theme.colors.white },
        height: "100%",
      }}
    >
      {({ isActive }) => (
        <>
          <STabContainer>
            <Icon sx={{ color: "brightBlue300" }} icon={icon} />
            <Text fs={13} color={isActive ? "white" : "iconGray"}>
              {label}
            </Text>
            {withBadge && <SBadge>Active</SBadge>}
          </STabContainer>
          {isActive && (
            <div
              sx={{ height: 1, bg: "brightBlue300", width: "100%" }}
              css={{ position: "relative", bottom: 1 }}
            />
          )}
        </>
      )}
    </Link>
  )
}

const BondsTabLink = () => {
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
    <Tab
      to={LINKS.bonds}
      icon={<IconBonds />}
      label={t("header.trade.bonds.title")}
      withBadge={isActive}
    />
  )
}

export const SubNavigation = () => {
  const { t } = useTranslation()
  const { isLoaded } = useRpcProvider()

  return (
    <SubNavigationContainer>
      <Tab
        to={LINKS.swap}
        icon={<IconSwap />}
        label={t("header.trade.swap.title")}
      />
      {isOtcPageEnabled && (
        <Tab
          to={LINKS.otc}
          icon={<IconOTC />}
          label={t("header.trade.otc.title")}
        />
      )}
      {isDcaPageEnabled && (
        <Tab
          to={LINKS.dca}
          icon={<IconDCA />}
          label={t("header.trade.dca.title")}
        />
      )}
      {isBondsPageEnabled ? (
        isLoaded ? (
          <BondsTabLink />
        ) : (
          <Tab
            to={LINKS.bonds}
            icon={<IconBonds />}
            label={t("header.trade.bonds.title")}
          />
        )
      ) : null}
    </SubNavigationContainer>
  )
}

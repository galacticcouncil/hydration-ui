import { TabLink } from "components/Tabs/TabLink"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"
import AssetsIcon from "assets/icons/AssetsIcon.svg?react"
import PositionsIcon from "assets/icons/PositionsIcon.svg?react"
import WaterRippleIcon from "assets/icons/WaterRippleIcon.svg?react"
import PoolsAndFarms from "assets/icons/PoolsAndFarms.svg?react"
import { SButton, SContainer } from "./WalletAssetsFilter.styled"
import { Icon } from "components/Icon/Icon"
import { useNavigate, useSearch } from "@tanstack/react-location"

const filters = [
  {
    id: "all",
    icon: <AssetsIcon />,
  },
  {
    id: "assets",
    icon: <PositionsIcon />,
  },
  {
    id: "liquidity",
    icon: <WaterRippleIcon />,
  },
  {
    id: "farming",
    icon: <PoolsAndFarms />,
  },
] as const

export const WalletAssetsFilter = () => {
  const { t } = useTranslation()

  const search = useSearch()
  const navigate = useNavigate()

  const activeFilterId = search.filter ?? "all"

  return (
    <SContainer>
      {filters.map(({ id, icon }) => (
        <SButton
          key={id}
          active={activeFilterId === id}
          variant="outline"
          size="small"
          onClick={() => navigate({ search: { filter: id } })}
        >
          <Icon size={14} icon={icon} />
          {t(`wallet.header.${id}`)}
        </SButton>
      ))}
    </SContainer>
  )
}

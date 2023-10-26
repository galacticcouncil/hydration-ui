import { useTranslation } from "react-i18next"
import AssetsIcon from "assets/icons/AssetsIcon.svg?react"
import PositionsIcon from "assets/icons/PositionsIcon.svg?react"
import WaterRippleIcon from "assets/icons/WaterRippleIcon.svg?react"
import PoolsAndFarms from "assets/icons/PoolsAndFarms.svg?react"
import IconSearch from "assets/icons/IconSearch.svg?react"
import {
  SButton,
  SButtonContainer,
  SSearchContainer,
} from "./WalletAssetsFilters.styled"
import { Icon } from "components/Icon/Icon"
import { Input } from "components/Input/Input"
import { useDebounce } from "react-use"
import { useState } from "react"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"

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

export const WalletAssetsFilters = () => {
  const { t } = useTranslation()

  const { search, category, setFilter } = useWalletAssetsFilters()

  const [searchVal, setSearchVal] = useState(search ?? "")

  useDebounce(
    () => {
      setFilter({ search: searchVal.length > 0 ? searchVal : undefined })
    },
    300,
    [searchVal],
  )

  return (
    <div sx={{ flex: "column", gap: [16, 20], mb: [16, 30] }}>
      <SButtonContainer>
        {filters.map(({ id, icon }) => (
          <SButton
            key={id}
            active={category === id}
            variant="outline"
            size="small"
            onClick={() => setFilter({ category: id })}
          >
            <Icon size={14} icon={icon} />
            {t(`wallet.header.${id}`)}
          </SButton>
        ))}
      </SButtonContainer>
      <SSearchContainer>
        <IconSearch />
        <Input
          value={searchVal}
          onChange={setSearchVal}
          name="search"
          label="Input"
          placeholder={t("wallet.header.search")}
        />
      </SSearchContainer>
    </div>
  )
}

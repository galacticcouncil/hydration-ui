import { useTranslation } from "react-i18next"
import AssetsIcon from "assets/icons/AssetsIcon.svg?react"
import PositionsIcon from "assets/icons/PositionsIcon.svg?react"
import WaterRippleIcon from "assets/icons/WaterRippleIcon.svg?react"
import PoolsAndFarms from "assets/icons/PoolsAndFarms.svg?react"
import { SButton, SButtonContainer } from "./WalletAssetsFilters.styled"
import { Icon } from "components/Icon/Icon"
import { useDebounce } from "react-use"
import { useState } from "react"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"
import { useRpcProvider } from "providers/rpcProvider"
import Skeleton from "react-loading-skeleton"
import { WalletPaymentAsset } from "sections/wallet/assets/paymentAsset/WalletPaymentAsset"
import { Search } from "components/Search/Search"

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
  const { isLoaded } = useRpcProvider()
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
    <div sx={{ flex: "column", gap: [16, 30], mb: [16, 20] }}>
      <Search
        value={searchVal}
        setValue={setSearchVal}
        placeholder={t("wallet.header.search")}
      />
      <div
        sx={{
          flex: "row",
          justify: "space-between",
          align: "center",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
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
        <div sx={{ ml: [0, "auto"], width: ["100%", "auto"] }}>
          {isLoaded ? <WalletPaymentAsset /> : <Skeleton width={220} />}
        </div>
      </div>
    </div>
  )
}

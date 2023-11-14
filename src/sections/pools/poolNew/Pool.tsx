import { SPoolContainer } from "./Pool.styled"
import { TOmnipoolAsset, TXYKPool } from "sections/pools/PoolsPage.utils"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { isXYKPool } from "sections/pools/PoolsPage.utils"
import { PoolDetails } from "./components/PoolDetails"
import { AvailableFarms } from "./components/AvailableFarms"
import { MyPositions } from "./components/MyPositions"

export const PoolNew = ({ pool }: { pool: TOmnipoolAsset | TXYKPool }) => {
  const { t } = useTranslation()

  const isXYK = isXYKPool(pool)

  return (
    <SPoolContainer>
      <PoolDetails pool={pool} />
      <div sx={{ p: 30, bg: "gray" }}>
        <MyPositions pool={pool} />
        {/*TODO: conditional from the overview page if there is farms, if so render that component */}
        <AvailableFarms pool={pool} />
      </div>
    </SPoolContainer>
  )
}

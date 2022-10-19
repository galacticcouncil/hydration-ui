import { DualAssetIcons } from "components/DualAssetIcons/DualAssetIcons"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { PoolBase } from "@galacticcouncil/sdk"
import { getTradeFee } from "sections/pools/pool/Pool.utils"
import { Icon } from "components/Icon/Icon"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"

type Props = { pool: PoolBase }

export const PoolDetails = ({ pool }: Props) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column" }}>
      <div sx={{ flex: "row", justify: "space-between" }}>
        <div>
          <Text fs={14} lh={26} fw={400} color="neutralGray400">
            {t("pools.pool.title", { type: pool.type })}
          </Text>
          <div sx={{ flex: "row", align: "center" }}>
            <DualAssetIcons
              firstIcon={{ icon: getAssetLogo(pool.tokens[0].symbol) }}
              secondIcon={{ icon: getAssetLogo(pool.tokens[1].symbol) }}
            />
            <div sx={{ flex: "column", gap: 1 }}>
              <Text fw={700} color="white">
                {pool.tokens[0].symbol}/{pool.tokens[1].symbol}
              </Text>
              <Text fs={12} lh={14} color="neutralGray500">
                Token/Token {/*TODO*/}
              </Text>
            </div>
          </div>
        </div>
        <div sx={{ flex: "row", align: "center" }}>
          <div sx={{ flex: "column", justify: "center", width: ["auto", 120] }}>
            <Text fs={14} fw={400} color="neutralGray400" lh={26}>
              {t("pools.pool.poolDetails.fee")}
            </Text>
            <Text lh={22} color="white">
              {t("value.percentage", { value: getTradeFee(pool.tradeFee) })}
            </Text>
          </div>
          <Icon
            icon={<ChevronRight />}
            sx={{
              ml: 11,
              mt: 6,
              color: "primary300",
              display: ["inherit", "none"],
            }}
            size={36}
          />
        </div>
      </div>
      <Separator sx={{ mt: [18, 34] }} />
    </div>
  )
}

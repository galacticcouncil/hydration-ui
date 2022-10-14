import { FC } from "react"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"

type Props = { balance?: BigNumber }

export const PoolSharesUnstaked: FC<Props> = ({ balance }) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", gap: 6 }}>
      <Text fs={12} lh={16} fw={400} color="neutralGray500">
        {t("pools.pool.liquidity.unstakedShares")}
      </Text>
      <Text fs={14} lh={18} color="white">
        {t("value", { value: balance })}
      </Text>
    </div>
  )
}

import { useTranslation } from "react-i18next"
import { Text } from "../../../../../components/Typography/Text/Text"
import { FC } from "react"

interface Props {
  symbol: string
  chain: string
}

export const WalletLiquidityPositionsTableDetailsChain: FC<Props> = ({
  symbol,
  chain,
}) => {
  const { t } = useTranslation()

  return (
    <div>
      <Text
        fs={12}
        lh={14}
        fw={500}
        color="basic400"
        sx={{
          mb: 8,
        }}
      >
        {t("wallet.assets.liquidityPositions.table.details.chain", {
          symbol,
        })}
      </Text>
      <Text fs={14} lh={16} fw={500}>
        {chain}
      </Text>
    </div>
  )
}

import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { TAsset } from "providers/assets"

type Props = {
  readonly asset: TAsset
  readonly minReceived: string
}

export const NewDepositSummary: FC<Props> = ({ asset, minReceived }) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row", justify: "space-between" }}>
      <Text fw={500} fs={[12, 14]} color="basic400">
        {t("wallet.strategy.deposit.minReceived")}
      </Text>
      <Text fw={500} fs={[12, 14]} color="white">
        {"≈ "}
        {t("value.tokenWithSymbol", {
          value: minReceived,
          symbol: asset.symbol,
        })}
      </Text>
    </div>
  )
}

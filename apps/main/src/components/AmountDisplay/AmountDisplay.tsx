import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetPrice } from "@/components/AssetPrice"

type Props = {
  readonly balance: number
}

export const AmountDisplay: FC<Props> = ({ balance }) => {
  const { t } = useTranslation()

  return (
    <Flex gap={2} direction="column">
      <Text fs={13} color={getToken("text.high")}>
        {t("number", { value: balance })}
      </Text>
      <AssetPrice
        assetId="10"
        value={balance}
        wrapper={<Text fs={10} color={getToken("text.low")} />}
      />
    </Flex>
  )
}

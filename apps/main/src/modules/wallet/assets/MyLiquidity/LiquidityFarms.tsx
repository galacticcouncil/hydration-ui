import { Flex, Text } from "@galacticcouncil/ui/components"
import { px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/Logo"

type Props = {
  readonly assetId: string
  readonly rewards: number
}

export const LiquidityFarms: FC<Props> = ({ assetId, rewards }) => {
  const { t } = useTranslation(["wallet", "common"])

  return (
    <Flex gap={4} align="center">
      <Logo id={assetId} size="small" />
      <Text
        fs={13}
        lh={px(18)}
        fw={500}
        color="#B3D7FA"
        sx={{ whiteSpace: "nowrap" }}
      >
        {t("common:percent", { value: rewards })}{" "}
        {t("myLiquidity.position.rewards")}
      </Text>
    </Flex>
  )
}

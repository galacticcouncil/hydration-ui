import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"

type Props = {
  readonly assetId: string
  readonly rewards: number
}

export const LiquidityFarms: FC<Props> = ({ assetId, rewards }) => {
  const { t } = useTranslation(["wallet", "common"])

  // TODO integrate
  const farmsAvailable = 1

  return (
    <Flex gap={4} align="center">
      <AssetLogo id={assetId} size="small" />
      <Text fs={13} lh={px(18)} fw={500} color="#B3D7FA" whiteSpace="nowrap">
        {t("common:percent", { value: rewards })}{" "}
        {t("myLiquidity.position.rewards")}
      </Text>
      {farmsAvailable >= 1 && (
        <Flex
          sx={{ borderRadius: 8 }}
          bg={getToken("textButtons.small.rest")}
          justify="center"
          align="center"
          height={15}
          minWidth={15}
        >
          <Text
            fw={700}
            fs={8}
            lh={px(18)}
            color={getToken("buttons.primary.medium.onButton")}
          >
            +{farmsAvailable}
          </Text>
        </Flex>
      )}
    </Flex>
  )
}

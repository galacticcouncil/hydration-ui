import { Flex, ValueStats } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components"

export const NetWorth: FC = () => {
  const { t } = useTranslation(["wallet", "common"])

  const [netWorth] = useDisplayAssetPrice("10", 10301874)

  return (
    <Flex
      direction={["row", "column"]}
      align={["center", "flex-start"]}
      pb={[8, 0]}
    >
      <ValueStats
        alwaysWrap
        size="medium"
        label={t("balances.header.netWorth")}
        value={netWorth}
      />
      <Flex
        borderWidth={1}
        borderStyle="solid"
        borderColor={getToken("details.borders")}
        align="center"
        justify="center"
        sx={{ textAlign: "center" }}
        height="100%"
        width="100%"
      >
        Graph placeholder
      </Flex>
    </Flex>
  )
}

import { Box, Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MyLiquidityActions } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityActions"
import { MyLiquidityTable } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable"
import { LiquidityPositionByAsset } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"

type Props = {
  readonly searchPhrase: string
  readonly data: Array<LiquidityPositionByAsset>
  readonly isLoading: boolean
}

export const MyLiquidity: FC<Props> = ({ searchPhrase, data, isLoading }) => {
  const { t } = useTranslation("wallet")

  return (
    <Box>
      <Flex justify="space-between" align="center">
        <Box pt={28}>
          <SectionHeader>{t("myLiquidity.header.title")}</SectionHeader>
        </Box>
        <MyLiquidityActions />
      </Flex>
      <MyLiquidityTable
        data={data}
        isLoading={isLoading}
        searchPhrase={searchPhrase}
      />
    </Box>
  )
}

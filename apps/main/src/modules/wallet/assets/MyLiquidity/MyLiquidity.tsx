import { Box, Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MyLiquidityActions } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityActions"
import { MyLiquidityTable } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable"
import { useMyLiquidityTableData } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"

type Props = {
  readonly searchPhrase: string
}

export const MyLiquidity: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("wallet")

  const { data: liquidityData, isLoading: liquidityLoading } =
    useMyLiquidityTableData()

  return (
    <Box>
      <Flex justify="space-between" align="center">
        <Box pt={28}>
          <SectionHeader>{t("myLiquidity.header.title")}</SectionHeader>
        </Box>
        <MyLiquidityActions />
      </Flex>
      <MyLiquidityTable
        data={liquidityData}
        isLoading={liquidityLoading}
        searchPhrase={searchPhrase}
      />
    </Box>
  )
}

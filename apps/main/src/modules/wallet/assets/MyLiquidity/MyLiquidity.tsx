import { Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MyLiquidityActions } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityActions"
import { MyLiquidityTable } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable"

type Props = {
  readonly searchPhrase: string
}

export const MyLiquidity: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("wallet")

  return (
    <div>
      <Flex justify="space-between" align="center">
        <SectionHeader>{t("myLiquidity.header.title")}</SectionHeader>
        <MyLiquidityActions />
      </Flex>
      <MyLiquidityTable searchPhrase={searchPhrase} />
    </div>
  )
}

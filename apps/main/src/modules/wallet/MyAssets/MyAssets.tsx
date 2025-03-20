import { Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { MyAssetsActions } from "@/modules/wallet/MyAssets/MyAssetsActions"
import { MyAssetsTable } from "@/modules/wallet/MyAssets/MyAssetsTable"

type Props = {
  readonly searchPhrase: string
}

export const MyAssets: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("wallet")

  return (
    <div>
      <Flex justify="space-between" align="center">
        <SectionHeader>{t("myAssets.header.title")}</SectionHeader>
        <MyAssetsActions />
      </Flex>
      <MyAssetsTable searchPhrase={searchPhrase} />
    </div>
  )
}

import { Flame } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex, Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { DataProviderSelect } from "@/components/DataProviderSelect/DataProviderSelect"
import { SFooter } from "@/modules/layout/components/Footer.styled"
import { useBannersStore } from "@/states/banners"

export const Footer = () => {
  const { t } = useTranslation("common")
  const openGigaNews = useBannersStore((state) => state.openGigaNews)

  return (
    <SFooter justify="space-between">
      <Button
        variant="tertiary"
        outline
        size="small"
        onClick={openGigaNews}
        sx={{ color: getToken("text.high"), textTransform: "uppercase" }}
      >
        <Icon size={18} component={Flame} />
        {t("gigaNews")}
      </Button>

      <Flex gap="base">
        <DataProviderSelect />
      </Flex>
    </SFooter>
  )
}

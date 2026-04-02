import { Flex } from "@galacticcouncil/ui/components"

import { DataProviderSelect } from "@/components/DataProviderSelect/DataProviderSelect"
import { GigaNews } from "@/components/GigaNews/GigaNews"
import { SFooter } from "@/modules/layout/components/Footer.styled"

export const Footer = () => {
  return (
    <SFooter justify="space-between">
      <GigaNews />

      <Flex gap="base">
        <DataProviderSelect />
      </Flex>
    </SFooter>
  )
}

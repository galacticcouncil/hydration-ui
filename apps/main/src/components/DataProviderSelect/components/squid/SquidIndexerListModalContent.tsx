import {
  Flex,
  ModalBody,
  Separator,
  Spinner,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { NeckworkStatusItem } from "@/components/DataProviderSelect/components/neckwork/NeckworkStatusItem"
import {
  SquidIndexerListHeader,
  SquidIndexerListItem,
} from "@/components/DataProviderSelect/components/squid/SquidIndexerListItem"
import { useFullSquidUrlList } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { useNeckworkEnabled } from "@/states/neckwork"
import { useProviderRpcUrlStore } from "@/states/provider"

export const SquidIndexerListModalContent = () => {
  const { t } = useTranslation("common")
  const { squidUrl } = useProviderRpcUrlStore()
  const neckworkEnabled = useNeckworkEnabled()

  const urlList = useFullSquidUrlList()
  const activeSquid = urlList.find((item) => item.url === squidUrl)

  const activeItem = neckworkEnabled ? (
    <NeckworkStatusItem />
  ) : activeSquid ? (
    <SquidIndexerListItem name={activeSquid.name} url={activeSquid.url} />
  ) : null

  return (
    <ModalBody>
      {activeItem ? (
        <Stack
          bg={getToken("surfaces.containers.dim.dimOnBg")}
          borderRadius="m"
        >
          <SquidIndexerListHeader />
          <Separator />
          {activeItem}
        </Stack>
      ) : (
        <Flex align="center" justify="center" gap="base" p="base" height={64}>
          <Spinner size="s" />
          <Text fs="p5" color={getToken("text.medium")}>
            {t("rpc.change.modal.autoMode.loading")}
          </Text>
        </Flex>
      )}
    </ModalBody>
  )
}

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

import { RpcList } from "@/components/DataProviderSelect/components/rpc/RpcList"
import {
  RpcListHeader,
  RpcListItemActive,
} from "@/components/DataProviderSelect/components/rpc/RpcListItem"
import { useActiveProviderProps } from "@/components/DataProviderSelect/useActiveProviderProps"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore } from "@/states/provider"

type RpcListModalContentProps = {
  poll?: boolean
}

export const RpcListModalContent = ({
  poll = false,
}: RpcListModalContentProps) => {
  const { t } = useTranslation("common")
  const { autoMode } = useProviderRpcUrlStore()
  const activeProvider = useActiveProviderProps()
  const { isReady } = useRpcProvider()

  if (autoMode) {
    return (
      <ModalBody>
        {isReady && activeProvider ? (
          <Stack
            bg={getToken("surfaces.containers.dim.dimOnBg")}
            borderRadius="m"
          >
            <RpcListHeader />
            <Separator />
            <RpcListItemActive
              url={activeProvider.url}
              name={activeProvider.name}
              poll={poll}
            />
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

  return (
    <ModalBody noPadding scrollable={false}>
      <RpcList poll={poll} />
    </ModalBody>
  )
}

import {
  Box,
  Flex,
  ModalBody,
  Spinner,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useActiveProviderProps } from "@/api/provider"
import { RpcList } from "@/components/ProviderRpcSelect/components/RpcList"
import { RpcListItemActive } from "@/components/ProviderRpcSelect/components/RpcListItem"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore } from "@/states/provider"

export const RpcListModalContent = () => {
  const { t } = useTranslation("common")
  const { autoMode } = useProviderRpcUrlStore()
  const activeProvider = useActiveProviderProps()
  const { isLoaded } = useRpcProvider()

  if (autoMode) {
    return (
      <ModalBody>
        {isLoaded && activeProvider ? (
          <Box
            bg={getToken("surfaces.containers.dim.dimOnBg")}
            borderRadius="m"
            p="s"
          >
            <RpcListItemActive
              url={activeProvider.url}
              name={activeProvider.name}
            />
          </Box>
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
      <RpcList />
    </ModalBody>
  )
}

import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalClose,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Separator,
  Spinner,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useActiveProviderProps } from "@/api/provider"
import { RpcForm } from "@/components/ProviderRpcSelect/components/RpcForm"
import { RpcList } from "@/components/ProviderRpcSelect/components/RpcList"
import { RpcListItemActive } from "@/components/ProviderRpcSelect/components/RpcListItem"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore } from "@/states/provider"

export type RpcSelectModalProps = ModalProps

export const RpcSelectModal: React.FC<RpcSelectModalProps> = (props) => {
  const { t } = useTranslation()
  const { autoMode, setAutoMode } = useProviderRpcUrlStore()
  const activeProvider = useActiveProviderProps()
  const { isLoaded } = useRpcProvider()

  return (
    <Modal disableInteractOutside {...props}>
      <ModalHeader
        title={t("rpc.change.modal.title")}
        customHeader={
          <Flex direction="column">
            <Separator my={10} mx="var(--modal-content-inset)" />
            <Flex align="center" justify="space-between">
              <Box>
                <Text>{t("rpc.change.modal.autoMode.title")}</Text>
                <Text
                  fs={12}
                  color={getToken("text.medium")}
                  maxWidth={["100%", "75%"]}
                >
                  {t("rpc.change.modal.autoMode.desc")}
                </Text>
              </Box>
              <Toggle
                size="large"
                checked={autoMode}
                onCheckedChange={setAutoMode}
              />
            </Flex>
            {!autoMode && (
              <>
                <Separator my={16} mx="var(--modal-content-inset)" />
                <RpcForm />
              </>
            )}
          </Flex>
        }
      />
      {autoMode && (
        <ModalBody>
          {isLoaded && activeProvider ? (
            <Box
              bg={getToken("surfaces.containers.dim.dimOnBg")}
              borderRadius="lg"
              p={4}
            >
              <RpcListItemActive
                url={activeProvider.url}
                name={activeProvider.name}
              />
            </Box>
          ) : (
            <Flex align="center" justify="center" gap={10} p={10} height={64}>
              <Spinner size={14} />
              <Text fs="p5" color={getToken("text.medium")}>
                {t("rpc.change.modal.autoMode.loading")}
              </Text>
            </Flex>
          )}
        </ModalBody>
      )}
      {!autoMode && (
        <ModalBody noPadding scrollable={false}>
          <RpcList />
        </ModalBody>
      )}
      <ModalFooter>
        <ModalClose asChild>
          <Button size="large" width="100%">
            {t("close")}
          </Button>
        </ModalClose>
      </ModalFooter>
    </Modal>
  )
}

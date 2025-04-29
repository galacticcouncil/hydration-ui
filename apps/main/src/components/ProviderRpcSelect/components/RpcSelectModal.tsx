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
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useActiveProviderProps } from "@/api/provider"
import { RpcForm } from "@/components/ProviderRpcSelect/components/RpcForm"
import { RpcList } from "@/components/ProviderRpcSelect/components/RpcList"
import { RpcListItemActive } from "@/components/ProviderRpcSelect/components/RpcListItem"
import { useProviderRpcUrlStore } from "@/states/provider"

export type RpcSelectModalProps = ModalProps

export const RpcSelectModal: React.FC<RpcSelectModalProps> = (props) => {
  const { t } = useTranslation()
  const { autoMode, setAutoMode } = useProviderRpcUrlStore()
  const activeProvider = useActiveProviderProps()

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
      {autoMode && activeProvider && (
        <ModalBody>
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
        </ModalBody>
      )}
      {!autoMode && (
        <ModalBody sx={{ p: 0 }}>
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

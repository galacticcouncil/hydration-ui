import {
  Box,
  Button,
  Flex,
  Modal,
  ModalCloseTrigger,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Separator,
  Stack,
  TabsContent,
  TabsRoot,
  Text,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AutoModeToggle } from "@/components/DataProviderSelect/components/AutoModeToggle"
import { RpcForm } from "@/components/DataProviderSelect/components/rpc/RpcForm"
import { RpcListModalContent } from "@/components/DataProviderSelect/components/rpc/RpcListModalContent"
import { SquidIndexerForm } from "@/components/DataProviderSelect/components/squid/SquidIndexerForm"
import { SquidIndexerListModalContent } from "@/components/DataProviderSelect/components/squid/SquidIndexerListModalContent"
import { useProviderRpcUrlStore } from "@/states/provider"

enum TabView {
  RPC = "RpcSelect",
  SQUID = "squid",
}

export type DataProviderSelectModalProps = ModalProps

export const DataProviderSelectModal: React.FC<DataProviderSelectModalProps> = (
  props,
) => {
  const { t } = useTranslation()
  const { autoMode, setAutoMode, legacyProvider, setLegacyProvider } =
    useProviderRpcUrlStore()

  const [view, setView] = useState<TabView>(TabView.RPC)

  return (
    <Modal disableInteractOutside {...props}>
      <ModalHeader
        title={t("rpc.change.modal.title")}
        align="center"
        customHeader={
          <Stack
            separated
            pt="m"
            separator={
              <Separator
                my="var(--modal-content-padding)"
                mx="var(--modal-content-inset)"
              />
            }
          >
            <ToggleGroup<TabView>
              type="single"
              value={view}
              onValueChange={(value) => value && setView(value)}
            >
              <ToggleGroupItem value={TabView.RPC}>
                {t("rpc.change.modal.view.rpc")}
              </ToggleGroupItem>
              <ToggleGroupItem value={TabView.SQUID}>
                {t("rpc.change.modal.view.indexer")}
              </ToggleGroupItem>
            </ToggleGroup>
            <Flex align="center" justify="space-between">
              <Box>
                <Text>{t("rpc.change.modal.legacyProvider.title")}</Text>
                <Text
                  fs="p5"
                  color={getToken("text.medium")}
                  maxWidth={["100%", "75%"]}
                >
                  {t("rpc.change.modal.legacyProvider.desc")}
                </Text>
              </Box>
              <Toggle
                size="large"
                checked={legacyProvider}
                onCheckedChange={setLegacyProvider}
              />
            </Flex>
            <AutoModeToggle
              size="large"
              checked={autoMode}
              onCheckedChange={setAutoMode}
            />
            {!autoMode && (
              <TabsRoot value={view}>
                <TabsContent value={TabView.RPC}>
                  <RpcForm />
                </TabsContent>
                <TabsContent value={TabView.SQUID}>
                  <SquidIndexerForm />
                </TabsContent>
              </TabsRoot>
            )}
          </Stack>
        }
      />
      <TabsRoot value={view}>
        <TabsContent value={TabView.RPC}>
          <RpcListModalContent />
        </TabsContent>
        <TabsContent value={TabView.SQUID}>
          <SquidIndexerListModalContent />
        </TabsContent>
      </TabsRoot>
      <ModalFooter>
        <ModalCloseTrigger asChild>
          <Button size="large" width="100%">
            {t("close")}
          </Button>
        </ModalCloseTrigger>
      </ModalFooter>
    </Modal>
  )
}

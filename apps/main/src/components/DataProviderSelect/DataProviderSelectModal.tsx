import {
  Button,
  Modal,
  ModalCloseTrigger,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Stack,
  TabsContent,
  TabsRoot,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AutoModeToggle } from "@/components/DataProviderSelect/components/AutoModeToggle"
import { RpcForm } from "@/components/DataProviderSelect/components/rpc/RpcForm"
import { RpcListModalContent } from "@/components/DataProviderSelect/components/rpc/RpcListModalContent"
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
  const { autoMode, setAutoMode } = useProviderRpcUrlStore()

  const [view, setView] = useState<TabView>(TabView.RPC)

  return (
    <Modal disableInteractOutside {...props}>
      <ModalHeader
        title={t("rpc.change.modal.title")}
        align="center"
        customHeader={
          <Stack pt="m">
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
            <TabsRoot value={view}>
              <TabsContent value={TabView.RPC}>
                <Stack gap="base">
                  <AutoModeToggle
                    size="large"
                    checked={autoMode}
                    onCheckedChange={setAutoMode}
                  />
                  {!autoMode && <RpcForm />}
                </Stack>
              </TabsContent>
            </TabsRoot>
          </Stack>
        }
      />
      <TabsRoot value={view}>
        <TabsContent value={TabView.RPC}>
          <RpcListModalContent poll={!!props.open} />
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

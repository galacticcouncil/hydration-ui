import {
  Button,
  Modal,
  ModalCloseTrigger,
  ModalFooter,
  ModalHeader,
  ModalProps,
  Separator,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { RpcAutoModeToggle } from "@/components/ProviderRpcSelect/components/RpcAutoModeToggle"
import { RpcForm } from "@/components/ProviderRpcSelect/components/RpcForm"
import { RpcListModalContent } from "@/components/ProviderRpcSelect/components/RpcListModalContent"
import { SquidForm } from "@/components/ProviderRpcSelect/components/SquidForm"
import { SquidListModalContent } from "@/components/ProviderRpcSelect/components/SquidListModalContent"
import { useProviderRpcUrlStore } from "@/states/provider"

export type RpcSelectModalProps = ModalProps

export const RpcSelectModal: React.FC<RpcSelectModalProps> = (props) => {
  const { t } = useTranslation()
  const [view, setView] = useState<"rpc" | "squid">("rpc")
  const { autoMode, setAutoMode } = useProviderRpcUrlStore()

  return (
    <Modal disableInteractOutside {...props}>
      <ModalHeader
        title={t("rpc.change.modal.title")}
        align="center"
        customHeader={
          <Stack
            separated
            pt={getTokenPx("scales.paddings.m")}
            separator={
              <Separator
                my="var(--modal-content-padding)"
                mx="var(--modal-content-inset)"
              />
            }
          >
            <ToggleGroup
              type="single"
              value={view}
              onValueChange={(value) => value && setView(value)}
            >
              <ToggleGroupItem value="rpc">
                {t("rpc.change.modal.view.rpc")}
              </ToggleGroupItem>
              <ToggleGroupItem value="squid">
                {t("rpc.change.modal.view.indexer")}
              </ToggleGroupItem>
            </ToggleGroup>
            {view === "rpc" && (
              <RpcAutoModeToggle
                size="large"
                checked={autoMode}
                onCheckedChange={setAutoMode}
              />
            )}
            {view === "rpc" && !autoMode && <RpcForm />}
            {view === "squid" && <SquidForm />}
          </Stack>
        }
      />
      {view === "rpc" && <RpcListModalContent />}
      {view === "squid" && <SquidListModalContent />}
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

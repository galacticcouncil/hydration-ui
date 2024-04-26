import { useProviderRpcUrlStore } from "api/provider"
import { Modal } from "components/Modal/Modal"
import { useState } from "react"

import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ProviderSelectForm } from "sections/provider/ProviderSelectForm"
import { useRpcStore } from "state/store"
import { SSwitchContainer } from "./ProviderSelectModal.styled"
import { DeleteModal } from "./components/DeleteModal/DeleteModal"
import { Button } from "components/Button/Button"

export function ProviderSelectModal(props: {
  open: boolean
  onClose: () => void
}) {
  const { setRpcUrl, autoMode, setAutoMode } = useProviderRpcUrlStore()
  const [removeRpcUrl, setRemoveRpcUrl] = useState<string | undefined>()
  const [tempAutoMode, setTempAutoMode] = useState(autoMode)
  const { t } = useTranslation()
  const { removeRpc } = useRpcStore()

  return (
    <>
      <Modal
        open={props.open}
        onClose={props.onClose}
        title={t("rpc.change.modal.title")}
        headerVariant="FontOver"
      >
        <SSwitchContainer
          sx={{
            flex: "row",
            align: "center",
            justify: "space-between",
            gap: 10,
          }}
        >
          <div sx={{ maxWidth: 280 }}>
            <Text fs={13} sx={{ mb: 4 }}>
              {t("rpc.change.modal.autoMode.title")}
            </Text>
            <Text color="basic400" fs={12}>
              {t("rpc.change.modal.autoMode.desc")}
            </Text>
          </div>
          <Switch
            name="rpc-auto-mode"
            value={tempAutoMode}
            onCheckedChange={setTempAutoMode}
          />
        </SSwitchContainer>

        <div sx={{ pt: 12 }}>
          {tempAutoMode ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setAutoMode(tempAutoMode)
                props.onClose()
                window.location.reload()
              }}
            >
              {t("rpc.change.modal.save")}
            </Button>
          ) : (
            <>
              <ProviderSelectForm
                onSave={(rpcUrl) => {
                  setRpcUrl(rpcUrl)
                  setAutoMode(tempAutoMode)
                  props.onClose()
                  window.location.reload()
                }}
                onRemove={(rpc) => {
                  setRemoveRpcUrl(rpc)
                }}
              />
              {!!removeRpcUrl && (
                <DeleteModal
                  onBack={() => setRemoveRpcUrl(undefined)}
                  onConfirm={() => {
                    removeRpc(removeRpcUrl)
                    setRemoveRpcUrl(undefined)
                  }}
                />
              )}
            </>
          )}
        </div>
      </Modal>
    </>
  )
}

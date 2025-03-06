import { useActiveProvider, useProviderRpcUrlStore } from "api/provider"
import { Modal } from "components/Modal/Modal"

import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ProviderSelectForm } from "sections/provider/ProviderSelectForm"
import {
  SAutoModeActiveContainer,
  SSwitchContainer,
  SSWitchContent,
} from "./ProviderSelectModal.styled"
import { Button } from "components/Button/Button"
import { ProviderItemActive } from "sections/provider/components/ProviderItem/ProviderItem"
import { useRpcProvider } from "providers/rpcProvider"
import { useRpcStatus } from "api/rpc"

export function ProviderSelectModal(props: {
  open: boolean
  onClose: () => void
}) {
  const { isLoaded } = useRpcProvider()
  const { autoMode, setAutoMode } = useProviderRpcUrlStore()
  const { t } = useTranslation()

  const activeProvider = useActiveProvider()

  return (
    <>
      <Modal
        open={props.open}
        onClose={props.onClose}
        title={t("rpc.change.modal.title")}
        headerVariant="GeistMono"
      >
        <SSwitchContainer>
          <SSWitchContent>
            <div sx={{ maxWidth: 280 }}>
              <Text fs={13} sx={{ mb: 4 }}>
                {t("rpc.change.modal.autoMode.title")}
              </Text>
              <Text color="basic400" fs={12}>
                {t("rpc.change.modal.autoMode.desc")}
              </Text>
            </div>
            <div sx={{ flex: "row", align: "center", gap: 8 }}>
              <Text fs={11} color="basic400">
                {autoMode
                  ? t("rpc.change.modal.autoMode.enabled")
                  : t("rpc.change.modal.autoMode.disabled")}
              </Text>
              <Switch
                name="rpc-auto-mode"
                value={autoMode}
                onCheckedChange={setAutoMode}
              />
            </div>
          </SSWitchContent>
          {autoMode && activeProvider.url && (
            <SAutoModeActiveContainer sx={{ mt: 14 }}>
              <AutoModeActiveProvider
                sx={{ opacity: isLoaded ? 1 : 0 }}
                name={activeProvider.name}
                url={activeProvider.url}
                isActive
              />
              {!isLoaded && (
                <Button variant="outline" isLoading>
                  {t("connecting")}
                </Button>
              )}
            </SAutoModeActiveContainer>
          )}
        </SSwitchContainer>

        <div sx={{ pt: 12 }}>
          {autoMode ? (
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                props.onClose()
              }}
            >
              {t("rpc.change.modal.close")}
            </Button>
          ) : (
            <ProviderSelectForm onClose={props.onClose} />
          )}
        </div>
      </Modal>
    </>
  )
}

const AutoModeActiveProvider: React.FC<
  React.ComponentPropsWithoutRef<typeof ProviderItemActive>
> = (props) => {
  const { data } = useRpcStatus(props.url)
  return <ProviderItemActive {...props} ping={data?.ping ?? null} />
}

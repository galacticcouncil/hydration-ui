import { useBestNumber } from "api/chain"
import { PROVIDERS, useProviderRpcUrlStore } from "api/provider"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { ReactComponent as ChevronRightIcon } from "assets/icons/ChevronRightIcon.svg"
import { ProviderSelectModal } from "sections/provider/ProviderSelectModal"
import { ProviderStatus } from "sections/provider/ProviderStatus"
import { SButton, SName } from "./ProviderSelectButton.styled"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"

export const ProviderSelectButton = () => {
  const [open, setOpen] = useState(false)
  const store = useProviderRpcUrlStore()

  const api = useApiPromise()
  const isApi = isApiLoaded(api)

  const rpcUrl = store.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find((provider) => provider.url === rpcUrl)
  const number = useBestNumber(!isApi)

  return (
    <>
      <SButton tabIndex={0} onClick={() => setOpen(true)} whileHover="animate">
        <SName
          variants={{
            initial: { width: 0 },
            animate: { width: "auto" },
            exit: { width: 0 },
          }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <Text font="ChakraPetch" fs={11} fw={500}>
            {selectedProvider?.name}
          </Text>
          <ChevronRightIcon />
          <Separator orientation="vertical" sx={{ height: 14, mr: 10 }} />
        </SName>
        <ProviderStatus
          parachainBlockNumber={number.data?.parachainBlockNumber}
          timestamp={number.data?.timestamp}
        />
      </SButton>
      {open && (
        <ProviderSelectModal open={open} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

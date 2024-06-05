import { useBestNumber } from "api/chain"
import { PROVIDERS, useProviderRpcUrlStore } from "api/provider"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import ChevronRightIcon from "assets/icons/ChevronRightIcon.svg?react"
import { ProviderSelectModal } from "sections/provider/ProviderSelectModal"
import { ProviderStatus } from "sections/provider/ProviderStatus"
import { SButton, SName } from "./ProviderSelectButton.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { theme } from "theme"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { isEvmAccount } from "utils/evm"

export const ProviderSelectButton = () => {
  const [open, setOpen] = useState(false)
  const store = useProviderRpcUrlStore()

  const { account } = useAccount()

  const { isLoaded } = useRpcProvider()

  const rpcUrl = store.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find((provider) => provider.url === rpcUrl)
  const number = useBestNumber(!isLoaded)

  const modalDisabled = isEvmAccount(account?.address)

  return (
    <>
      <SButton
        tabIndex={0}
        onClick={modalDisabled ? undefined : () => setOpen(true)}
        whileHover={modalDisabled ? "" : "animate"}
        css={{ zIndex: theme.zIndices.tablePlaceholder }}
      >
        <SName
          variants={{
            initial: { width: 0 },
            animate: { width: "auto" },
            exit: { width: 0 },
          }}
          transition={{ duration: 0.15, ease: "easeInOut" }}
        >
          <Text fs={11} fw={500} css={{ whiteSpace: "nowrap" }}>
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

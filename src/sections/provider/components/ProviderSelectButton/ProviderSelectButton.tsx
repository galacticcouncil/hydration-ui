import { useBestNumber } from "api/chain"
import { useActiveProvider } from "api/provider"
import { Separator } from "components/Separator/Separator"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import ChevronRightIcon from "assets/icons/ChevronRightIcon.svg?react"
import { ProviderSelectModal } from "sections/provider/ProviderSelectModal"
import { ProviderStatus } from "sections/provider/ProviderStatus"
import { SButton, SName } from "./ProviderSelectButton.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { theme } from "theme"

export const ProviderSelectButton = () => {
  const [open, setOpen] = useState(false)

  const activeProvider = useActiveProvider()

  const { isLoaded } = useRpcProvider()

  const number = useBestNumber(!isLoaded)

  return (
    <>
      <SButton
        tabIndex={0}
        onClick={() => setOpen(true)}
        whileHover="animate"
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
            {activeProvider?.name}
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

import {
  Flex,
  Grid,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { Web3ConnectProviderButton } from "@/components/Web3ConnectProviderButton"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
import { getWallets } from "@/wallets"

const ALL_WALLETS = getWallets()

export const Web3ConnectModal = () => {
  const { open, toggle } = useWeb3ConnectModal()
  return (
    <Modal open={open} onOpenChange={() => toggle()} disableInteractOutside>
      <ModalHeader title="Connect wallet" />
      <ModalBody>
        <Grid columns={[2, 4]} gap={10}>
          {ALL_WALLETS.map(({ provider, title, logo, enable }) => (
            <Web3ConnectProviderButton
              type="button"
              key={provider}
              onClick={enable}
            >
              <img width={32} height={32} src={logo} alt={title} />
              <Text fs={14} align="center" mt={10}>
                {title}
              </Text>
            </Web3ConnectProviderButton>
          ))}
        </Grid>
      </ModalBody>
    </Modal>
  )
}
/* 
<Box key={provider}>
<img width={48} height={48} loading="lazy" src={logo} alt={title} />
{title}
</Box> */

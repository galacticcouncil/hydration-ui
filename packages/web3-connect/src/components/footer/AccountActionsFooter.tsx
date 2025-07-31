import { ChevronRight, LogOut } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  ModalFooter,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { prop } from "remeda"

import { ProviderIcons } from "@/components/provider/ProviderIcons"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount, useWeb3Connect, useWeb3ConnectModal } from "@/hooks"

export const AccountActionsFooter = () => {
  const { setPage } = useWeb3ConnectContext()
  const { toggle } = useWeb3ConnectModal()
  const { account, disconnect } = useAccount()

  const getConnectedProviders = useWeb3Connect(
    (state) => state.getConnectedProviders,
  )

  const connectedProviders = getConnectedProviders()
  const connected = connectedProviders.map(prop("type"))

  const onLogout = () => {
    disconnect()
    toggle()
  }
  return (
    <ModalFooter justify="space-between">
      {connected.length > 0 && (
        <Flex gap={8} align="center" display={["none", null, "flex"]}>
          <ProviderIcons providers={connected} />
          <Text fs="p4" color={getToken("text.medium")}>
            {connected.length} connected
          </Text>
        </Flex>
      )}
      <Flex gap={8} justify={["space-between"]}>
        {account && (
          <Button variant="tertiary" onClick={onLogout}>
            Log out
            <Icon size={14} component={LogOut} ml={4} mr={-4} />
          </Button>
        )}
        <Button
          variant="accent"
          size="small"
          outline
          onClick={() => setPage(Web3ConnectModalPage.ProviderSelect)}
        >
          Manage wallets
          <Icon size={14} component={ChevronRight} ml={4} mr={-4} />
        </Button>
      </Flex>
    </ModalFooter>
  )
}

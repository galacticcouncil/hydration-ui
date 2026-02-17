import { ChevronRight, LogOut } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  ModalFooter,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"

import { ProviderIcons } from "@/components/provider/ProviderIcons"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount, useWeb3Connect, useWeb3ConnectModal } from "@/hooks"

export const AccountActionsFooter = () => {
  const { t } = useTranslation()
  const { mode, setPage, isControlled } = useWeb3ConnectContext()
  const { toggle } = useWeb3ConnectModal()
  const { disconnect } = useAccount()

  const getConnectedProviders = useWeb3Connect(
    (state) => state.getConnectedProviders,
  )

  const connectedProviders = getConnectedProviders(mode)
  const connected = connectedProviders.map(prop("type"))
  const isConnected = connected.length > 0

  const onLogout = () => {
    disconnect()
    toggle()
  }
  return (
    <ModalFooter justify="space-between">
      {connected.length > 0 && (
        <Flex gap="base" align="center" display={["none", null, "flex"]}>
          <ProviderIcons providers={connected} />
          <Text fs="p4" color={getToken("text.medium")}>
            {t("account.connected", { count: connected.length })}
          </Text>
        </Flex>
      )}
      <Flex gap="base" justify="space-between" ml="auto">
        {isConnected && !isControlled && (
          <Button variant="tertiary" onClick={onLogout}>
            {t("account.logOut")}
            <Icon size="s" component={LogOut} mr="-s" />
          </Button>
        )}
        <Button
          variant="accent"
          size="small"
          outline
          onClick={() => setPage(Web3ConnectModalPage.ProviderSelect)}
        >
          {t("account.manageWallets")}
          <Icon size="s" component={ChevronRight} mr="-s" />
        </Button>
      </Flex>
    </ModalFooter>
  )
}

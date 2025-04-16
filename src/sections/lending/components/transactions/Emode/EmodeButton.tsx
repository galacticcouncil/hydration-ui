import { FC } from "react"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useModalContext } from "sections/lending/hooks/useModal"
import { EmodeModalType } from "./EmodeModalContent"
import SettingsIcon from "assets/icons/SettingsIcon.svg?react"
import { Icon } from "components/Icon/Icon"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getEmodeMessage } from "./EmodeNaming"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

type EmodeButtonProps = {
  className?: string
}

export const EmodeButton: FC<EmodeButtonProps> = ({ className }) => {
  const { openEmode } = useModalContext()
  const { account } = useAccount()
  const { user, eModes } = useAppDataContext()

  const isEModeDisabled = user.userEmodeCategoryId === 0

  return (
    <div className={className} sx={{ flex: "row", align: "center", gap: 8 }}>
      <Text fs={12} lh={12} color="basic300">
        E-Mode
      </Text>
      <Button
        size="micro"
        disabled={!account || account.isExternalWalletConnected}
        onClick={() =>
          openEmode(
            isEModeDisabled ? EmodeModalType.ENABLE : EmodeModalType.SWITCH,
          )
        }
      >
        {isEModeDisabled
          ? "Disabled"
          : getEmodeMessage(eModes[user.userEmodeCategoryId]?.label)}
        <Icon icon={<SettingsIcon />} size={12} />
      </Button>
    </div>
  )
}

import { Settings } from "@galacticcouncil/ui/assets/icons"
import { Button, Icon } from "@galacticcouncil/ui/components"

import { getEmodeMessage } from "@/components/transactions/emode/emode.utils"
import { EmodeModalType } from "@/components/transactions/emode/EmodeModalContent"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "@/hooks/useModal"

type EmodeButtonProps = {
  className?: string
}

export const ManageEmodeButton: React.FC<EmodeButtonProps> = ({
  className,
}) => {
  const { openEmode } = useModalContext()
  const { user, eModes } = useAppDataContext()

  const isEModeDisabled = user.userEmodeCategoryId === 0

  return (
    <Button
      size="small"
      variant={isEModeDisabled ? "tertiary" : "secondary"}
      outline={isEModeDisabled}
      disabled={!user}
      className={className}
      onClick={() =>
        openEmode(
          isEModeDisabled ? EmodeModalType.ENABLE : EmodeModalType.SWITCH,
        )
      }
    >
      {isEModeDisabled
        ? "Disabled"
        : getEmodeMessage(eModes[user.userEmodeCategoryId]?.label)}
      <Icon mr={-4} size="s" component={Settings} />
    </Button>
  )
}

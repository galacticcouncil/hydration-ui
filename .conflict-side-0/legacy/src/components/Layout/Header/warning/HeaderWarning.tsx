import CrossIcon from "assets/icons/CrossIcon.svg?react"
import {
  SSecondaryItem,
  SWarningMessageContainer,
  SWarningMessageContent,
} from "components/WarningMessage/WarningMessage.styled"

export type MigrationWarningProps = {
  onClick?: () => void
  onClose?: () => void
  children: React.ReactNode
}

export const HeaderWarning: React.FC<MigrationWarningProps> = ({
  onClick,
  onClose,
  children,
}) => {
  return (
    <SWarningMessageContainer onClick={onClick}>
      <SSecondaryItem />
      <SWarningMessageContent sx={{ fontWeight: 600 }}>
        {children}
      </SWarningMessageContent>
      <SSecondaryItem
        css={{
          justifyContent: "flex-end",
        }}
      >
        {onClose && (
          <CrossIcon
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          />
        )}
      </SSecondaryItem>
    </SWarningMessageContainer>
  )
}

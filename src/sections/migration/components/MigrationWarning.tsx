import CrossIcon from "assets/icons/CrossIcon.svg?react"
import {
  SSecondaryItem,
  SWarningMessageContainer,
  SWarningMessageContent,
} from "components/WarningMessage/WarningMessage.styled"
import { Trans, useTranslation } from "react-i18next"

export type MigrationWarningProps = {
  onClick: () => void
  onClose?: () => void
}

export const MigrationWarning: React.FC<MigrationWarningProps> = ({
  onClick,
  onClose,
}) => {
  const { t } = useTranslation()
  return (
    <SWarningMessageContainer onClick={onClick}>
      <SSecondaryItem />
      <SWarningMessageContent>
        <Trans t={t} i18nKey="migration.warning.text">
          <span css={{ textDecoration: "underline", whiteSpace: "nowrap" }} />
        </Trans>
      </SWarningMessageContent>
      <SSecondaryItem
        css={{
          justifyContent: "flex-end",
        }}
      >
        <CrossIcon
          onClick={(e) => {
            e.stopPropagation()
            onClose?.()
          }}
        />
      </SSecondaryItem>
    </SWarningMessageContainer>
  )
}

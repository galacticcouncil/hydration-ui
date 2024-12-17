import SettingsIcon from "assets/icons/SettingsIcon.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { ClaimingRangeModal } from "./ClaimingRangeModal"
import { useState } from "react"
import { useTranslation } from "react-i18next"

export const ClaimingRangeButton = () => {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <ButtonTransparent
        name="Adjust claiming range"
        sx={{ flex: "row", gap: 4, align: "top" }}
        css={{ "&:hover": { opacity: 0.8 }, outline: "none" }}
        onClick={() => setOpen(true)}
      >
        <Icon sx={{ color: "darkBlue100" }} size={14} icon={<SettingsIcon />} />
        <Text fs={12} color="darkBlue100">
          {t("claimingRange.button")}
        </Text>
      </ButtonTransparent>

      {open && <ClaimingRangeModal onClose={() => setOpen(false)} />}
    </>
  )
}

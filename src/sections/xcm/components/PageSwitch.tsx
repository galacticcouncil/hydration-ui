import { useLocation } from "react-use"
import { PillSwitch } from "components/PillSwitch/PillSwitch"
import { useTranslation } from "react-i18next"
import { LINKS } from "utils/navigation"
import { useNavigate } from "@tanstack/react-location"

export const PageSwitch = () => {
  const { t } = useTranslation()

  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <div
      sx={{ flex: "column", align: "center", justify: "space-between", mb: 10 }}
    >
      <PillSwitch
        value={pathname}
        onChange={(page) =>
          navigate({
            to: page,
          })
        }
        options={[
          {
            value: LINKS.cross_chain,
            label: t("xcm.switch.crosschain"),
          },
          {
            value: LINKS.bridge,
            label: t("xcm.switch.bridge"),
          },
        ]}
      />
    </div>
  )
}

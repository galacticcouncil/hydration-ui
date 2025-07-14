import { Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { SOtcHeader } from "@/modules/trade/otc/header/OtcHeader.styled"
import { OtcValue } from "@/modules/trade/otc/header/OtcValue"

// TODO integrate
export const OtcHeader: FC = () => {
  const { t } = useTranslation("trade")

  return (
    <SOtcHeader>
      <OtcValue label={t("otc.header.otcValue")} price={10301874} />
      <Separator display={["block", "none"]} />
      <OtcValue label={t("otc.header.sold")} price={10301874} />
      <Separator display={["block", "none"]} />
      <OtcValue label={t("otc.header.24volume")} price={10301874} />
    </SOtcHeader>
  )
}

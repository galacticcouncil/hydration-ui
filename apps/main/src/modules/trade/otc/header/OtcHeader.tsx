import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useOtcHeaderData } from "@/modules/trade/otc/header/OtcHeader.data"
import { SOtcHeader } from "@/modules/trade/otc/header/OtcHeader.styled"
import { OtcValue } from "@/modules/trade/otc/header/OtcValue"

export const OtcHeader: FC = () => {
  const { t } = useTranslation("trade")
  const { otcValue, isLoading } = useOtcHeaderData()

  return (
    <SOtcHeader>
      <OtcValue
        label={t("otc.header.otcValue")}
        price={otcValue}
        isLoading={isLoading}
      />
    </SOtcHeader>
  )
}

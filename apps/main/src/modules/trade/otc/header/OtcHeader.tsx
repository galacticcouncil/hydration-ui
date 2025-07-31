import { Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useOtcHeaderData } from "@/modules/trade/otc/header/OtcHeader.data"
import { SOtcHeader } from "@/modules/trade/otc/header/OtcHeader.styled"
import { OtcValue } from "@/modules/trade/otc/header/OtcValue"

// TODO integrate
export const OtcHeader: FC = () => {
  const { t } = useTranslation("trade")
  const { otcValue, sold, volume, isLoading } = useOtcHeaderData()

  return (
    <SOtcHeader>
      <OtcValue
        label={t("otc.header.otcValue")}
        price={otcValue}
        isLoading={isLoading}
      />
      <Separator display={["block", "none"]} />
      <OtcValue
        label={t("otc.header.sold")}
        price={sold}
        isLoading={isLoading}
      />
      <Separator display={["block", "none"]} />
      <OtcValue
        label={t("otc.header.24volume")}
        price={volume}
        isLoading={isLoading}
      />
    </SOtcHeader>
  )
}

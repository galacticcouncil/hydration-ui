import Carrier from "assets/icons/crosschains/Carrier.svg?react"
import i18n from "i18n/i18n"

export const CROSSCHAINS = [
  {
    icon: <Carrier css={{ borderRadius: "50%" }} />,
    name: "Carrier",
    guide: null,
    description: i18n.t("xcm.bridge.carrier.description"),
    url: "https://www.carrier.so",
  },
]

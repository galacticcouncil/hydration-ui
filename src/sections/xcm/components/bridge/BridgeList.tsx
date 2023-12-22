import { Spacer } from "components/Spacer/Spacer"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SContainer, STitle } from "./BridgeList.styled"
import { CROSSCHAINS } from "./BridgeList.utils"
import { BridgeListItem } from "./BridgeListItem"

export function BridgeList() {
  const { t } = useTranslation()

  return (
    <SContainer>
      <div sx={{ flex: "column" }}>
        <div>
          <STitle sx={{ my: 5 }}>{t("xcm.switch.bridge")}</STitle>
          <Text fs={16} lh={24} color="basic400">
            {t("xcm.bridge.description")}
          </Text>
        </div>
        <Spacer size={26} />
        <div sx={{ flex: "column", gap: 6 }}>
          {CROSSCHAINS.map((chain) => (
            <BridgeListItem {...chain} key={chain.name} />
          ))}
        </div>
      </div>
    </SContainer>
  )
}
